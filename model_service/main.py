from __future__ import annotations

import logging
import math
from datetime import datetime, timedelta
from statistics import mean, pstdev

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Smart Agri Market Model Service")


class HistoryPoint(BaseModel):
    arrivalQty: float = 0
    date: str
    maxPrice: float
    minPrice: float
    modalPrice: float


class CandidateMarket(BaseModel):
    district: str
    estimatedDistanceKm: float = 24
    history: list[HistoryPoint]
    marketId: str
    marketName: str
    state: str


class PredictRequest(BaseModel):
    candidates: list[CandidateMarket]
    commodity: str
    district: str
    farmLocationText: str = ""
    quantity: float | None = None
    state: str
    transportCostPerKm: float | None = None


class ForecastRequest(BaseModel):
    commodity: str
    district: str
    estimatedDistanceKm: float = 24
    history: list[HistoryPoint]
    marketId: str
    marketName: str
    quantity: float | None = None
    state: str
    transportCostPerKm: float | None = None


def _mean(values: list[float]) -> float:
    return mean(values) if values else 0.0


def _std(values: list[float]) -> float:
    return pstdev(values) if len(values) > 1 else 0.0


def _trend_label(prices: list[float]) -> str:
    if len(prices) < 4:
        return "Limited history"

    delta = prices[-1] - _mean(prices[-4:-1])
    if delta > 60:
        return "Rising"
    if delta < -60:
        return "Cooling"
    return "Stable"


def _risk_level(volatility_ratio: float) -> str:
    if volatility_ratio < 0.035:
        return "Low"
    if volatility_ratio < 0.075:
        return "Medium"
    return "High"


def _confidence_label(history_len: int, volatility_ratio: float) -> str:
    if history_len >= 18 and volatility_ratio < 0.06:
        return "High"
    if history_len >= 10 and volatility_ratio < 0.1:
        return "Medium"
    return "Low"


def _transport_cost(transport_cost_per_km: float | None, distance_km: float | None) -> float | None:
    if transport_cost_per_km is None or distance_km is None:
        return None
    return round(transport_cost_per_km * distance_km, 2)


def _build_anomalies(history: list[HistoryPoint]) -> list[dict]:
    prices = [point.modalPrice for point in history]
    arrivals = [point.arrivalQty for point in history]
    price_mean = _mean(prices)
    price_std = max(_std(prices), 1)
    arrival_mean = _mean(arrivals)
    arrival_std = max(_std(arrivals), 1)

    anomalies: list[dict] = []
    for point in history:
        if abs(point.modalPrice - price_mean) / price_std >= 1.6:
            anomalies.append(
                {
                    "date": point.date,
                    "reason": "Price spike" if point.modalPrice > price_mean else "Price dip",
                    "value": point.modalPrice,
                }
            )
        elif abs(point.arrivalQty - arrival_mean) / arrival_std >= 1.6:
            anomalies.append(
                {
                    "date": point.date,
                    "reason": "Arrival surge" if point.arrivalQty > arrival_mean else "Arrival drop",
                    "value": point.arrivalQty,
                }
            )

    return anomalies[-5:]


def _generate_forecast_points(
    history: list[HistoryPoint],
    estimated_distance_km: float | None,
    quantity: float | None,
    transport_cost_per_km: float | None,
) -> dict:
    prices = [point.modalPrice for point in history]
    arrivals = [point.arrivalQty for point in history]

    last_price = prices[-1]
    rolling3 = _mean(prices[-3:])
    rolling7 = _mean(prices[-7:])
    volatility = _std(prices[-7:]) or max(last_price * 0.02, 50)
    momentum = last_price - prices[-4] if len(prices) >= 4 else 0
    avg_arrival = _mean(arrivals[-7:])
    last_arrival = arrivals[-1]
    arrival_pressure = ((avg_arrival - last_arrival) / max(avg_arrival, 1)) * 55
    baseline = (0.45 * last_price) + (0.3 * rolling3) + (0.25 * rolling7) + arrival_pressure
    drift = (momentum * 0.2) + (arrival_pressure * 0.15)

    last_date = datetime.strptime(history[-1].date, "%Y-%m-%d")
    current = baseline
    forecast_points = []
    for step in range(1, 8):
        mean_reversion = (rolling7 - current) * 0.08
        seasonal = math.sin(step / 2.4) * (volatility * 0.18)
        predicted = max(100.0, current + drift + mean_reversion + seasonal)
        band = max(60.0, volatility * 1.05)
        forecast_points.append(
            {
                "forecastDate": (last_date + timedelta(days=step)).strftime("%Y-%m-%d"),
                "predictedPrice": round(predicted, 2),
                "lowerBound": round(max(0.0, predicted - band), 2),
                "upperBound": round(predicted + band, 2),
            }
        )
        current = predicted

    avg_price = _mean([point["predictedPrice"] for point in forecast_points])
    best_day = max(forecast_points, key=lambda point: point["predictedPrice"])
    expected_change_percent = round(((avg_price - last_price) / max(last_price, 1)) * 100, 2)
    profit_transport_cost = _transport_cost(transport_cost_per_km, estimated_distance_km)
    gross_revenue = round(avg_price * quantity, 2) if quantity is not None else None
    net_return = (
        round(gross_revenue - profit_transport_cost, 2)
        if gross_revenue is not None and profit_transport_cost is not None
        else None
    )

    return {
        "confidenceLabel": _confidence_label(len(history), volatility / max(rolling7, 1)),
        "forecast": forecast_points,
        "profitEstimate": {
            "grossRevenue": gross_revenue,
            "netReturn": net_return,
            "transportCost": profit_transport_cost,
        },
        "riskLevel": _risk_level(volatility / max(rolling7, 1)),
        "summary": {
            "averageForecastPrice": round(avg_price, 2),
            "bestSellDay": best_day,
            "expectedChangePercent": expected_change_percent,
        },
    }


def _build_explanation(
    market_name: str,
    prices: list[float],
    arrivals: list[float],
    predicted_price: float,
    trend_label: str,
) -> list[str]:
    last_price = prices[-1]
    rolling7 = _mean(prices[-7:])
    last_arrival = arrivals[-1]
    avg_arrival = _mean(arrivals[-7:])
    explanations = [
        f"{market_name} is {trend_label.lower()} with the latest modal price at {last_price:.0f} INR/quintal.",
        f"The 7-day average is {rolling7:.0f} INR/quintal and the model projects {predicted_price:.0f} next.",
        (
            f"Arrivals are {'below' if last_arrival < avg_arrival else 'above'} the weekly average "
            f"({last_arrival:.0f} vs {avg_arrival:.0f}), which affects price pressure."
        ),
    ]

    if predicted_price > rolling7:
        explanations.append("Recent momentum and tighter arrivals support a stronger selling window.")
    else:
        explanations.append("Price momentum is moderating, so the forecast favors stable rather than aggressive upside.")

    return explanations[:4]


def _score_candidate(candidate: CandidateMarket, quantity: float | None, transport_cost_per_km: float | None) -> dict:
    history = candidate.history
    if len(history) < 5:
        raise ValueError(f"Insufficient history for market {candidate.marketName}")

    prices = [point.modalPrice for point in history]
    arrivals = [point.arrivalQty for point in history]
    last_price = prices[-1]
    rolling3 = _mean(prices[-3:])
    rolling7 = _mean(prices[-7:])
    momentum = last_price - prices[-4] if len(prices) >= 4 else 0
    volatility = _std(prices[-7:]) or max(last_price * 0.02, 50)
    volatility_ratio = volatility / max(rolling7, 1)
    avg_arrival = _mean(arrivals[-7:])
    last_arrival = arrivals[-1]
    arrival_adjustment = ((avg_arrival - last_arrival) / max(avg_arrival, 1)) * 70
    predicted_price = (
        (0.45 * last_price)
        + (0.25 * rolling3)
        + (0.2 * rolling7)
        + (0.1 * (last_price + momentum))
        + arrival_adjustment
    )

    transport_cost = _transport_cost(transport_cost_per_km, candidate.estimatedDistanceKm)
    gross_revenue = round(predicted_price * quantity, 2) if quantity is not None else None
    net_return = (
        round(gross_revenue - transport_cost, 2)
        if gross_revenue is not None and transport_cost is not None
        else None
    )
    trend_label = _trend_label(prices)
    forecast_snapshot = _generate_forecast_points(
        history,
        candidate.estimatedDistanceKm,
        quantity,
        transport_cost_per_km,
    )

    return {
        "arrivalQty": round(last_arrival, 2),
        "confidenceLabel": _confidence_label(len(history), volatility_ratio),
        "estimatedDistanceKm": candidate.estimatedDistanceKm,
        "explanation": _build_explanation(
            candidate.marketName,
            prices,
            arrivals,
            predicted_price,
            trend_label,
        ),
        "forecastSummary": forecast_snapshot["summary"],
        "grossRevenue": gross_revenue,
        "marketId": candidate.marketId,
        "marketName": candidate.marketName,
        "netReturn": net_return,
        "predictedPrice": round(predicted_price, 2),
        "recentTrend": trend_label,
        "riskLevel": _risk_level(volatility_ratio),
    }


@app.post("/predict")
def predict(request: PredictRequest):
    try:
        if not request.candidates:
            raise ValueError("At least one candidate market is required.")

        scored_markets = [
            _score_candidate(candidate, request.quantity, request.transportCostPerKm)
            for candidate in request.candidates
        ]
        scored_markets.sort(key=lambda market: market["predictedPrice"], reverse=True)
        best_market = scored_markets[0]

        return {
            "bestMarketId": best_market["marketId"],
            "bestMarketName": best_market["marketName"],
            "confidenceLabel": best_market["confidenceLabel"],
            "explanation": best_market["explanation"],
            "forecastSummary": best_market["forecastSummary"],
            "predictedPrice": best_market["predictedPrice"],
            "riskLevel": best_market["riskLevel"],
            "topMarkets": scored_markets[:5],
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Prediction failed for commodity %s", request.commodity)
        raise HTTPException(status_code=500, detail="Prediction failed") from exc


@app.post("/forecast")
def forecast(request: ForecastRequest):
    try:
        if len(request.history) < 5:
            raise ValueError("At least 5 historical data points are required for forecasting.")

        result = _generate_forecast_points(
            request.history,
            request.estimatedDistanceKm,
            request.quantity,
            request.transportCostPerKm,
        )
        result["anomalies"] = _build_anomalies(request.history)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Forecast failed for market %s", request.marketId)
        raise HTTPException(status_code=500, detail="Forecast failed") from exc


@app.get("/models")
def list_models():
    return {
        "available_models": [
            "onion",
            "paddy",
            "soybean",
            "wheat",
        ],
        "strategy": "historical-heuristic-v1",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "smart-agri-model-service",
        "strategy": "historical-heuristic-v1",
    }
