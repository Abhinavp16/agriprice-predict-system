import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { formatCurrency, formatNumber, riskClass } from '../lib/formatters';
import { useI18n } from '../context/I18nContext';

const anomalyDot = ({ cx, cy, payload }) => {
  if (!payload?.isAnomaly) {
    return <circle cx={cx} cy={cy} r={3} fill="#0ea5e9" />;
  }

  return <circle cx={cx} cy={cy} r={6} fill="#e11d48" stroke="#fff" strokeWidth={2} />;
};

const MarketDetail = () => {
  const { id } = useParams();
  const { search } = useLocation();
  const { t } = useI18n();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const commodity = params.get('commodity') || 'wheat';
  const quantity = params.get('quantity') || '';
  const transportCostPerKm = params.get('transportCostPerKm') || '';
  const [detail, setDetail] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        const [detailResponse, forecastResponse] = await Promise.all([
          api.get(`/api/markets/${id}`, {
            params: { commodity, quantity, transportCostPerKm },
          }),
          api.get(`/api/markets/${id}/forecast`, {
            params: { commodity, quantity, transportCostPerKm },
          }),
        ]);

        setDetail(detailResponse.data);
        setForecast(forecastResponse.data);
      } catch (err) {
        setError(err.response?.data?.error || t('errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id, commodity, quantity, transportCostPerKm, t]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="glass-panel p-8 text-rose-700">{error}</div>;
  }

  const anomalies = detail?.anomalies || [];
  const priceHistory = (detail?.priceHistory || []).map((point) => ({
    ...point,
    isAnomaly: anomalies.some((anomaly) => anomaly.date === point.date),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600">
        <ArrowLeft size={18} />
        Back
      </Link>

      <section className="glass-panel p-8 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary-600 font-semibold">{t('detailTitle')}</p>
            <h1 className="mt-4 text-4xl font-black text-slate-900">{detail?.market?.name}</h1>
            <p className="mt-2 text-slate-500">{detail?.market?.district}, {detail?.market?.state}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${riskClass(detail?.riskLevel)}`}>
              {t('risk')}: {detail?.riskLevel}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
              {t('confidence')}: {detail?.confidenceLabel}
            </span>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">{t('latestPrice')}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(detail?.latestPrice)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">{t('latestArrival')}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatNumber(detail?.arrivals?.latestArrivalQty)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">{t('grossRevenue')}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(forecast?.profitEstimate?.grossRevenue)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">{t('netReturn')}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(forecast?.profitEstimate?.netReturn)}</p>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.35fr_0.65fr] gap-8">
        <div className="glass-panel p-7">
          <h2 className="text-2xl font-bold text-slate-800">{t('recentHistory')}</h2>
          <div className="h-80 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="modalPrice" stroke="#0ea5e9" strokeWidth={3} dot={anomalyDot} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-7">
            <h2 className="text-2xl font-bold text-slate-800">{t('forecast')}</h2>
            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast?.forecast || []}>
                  <defs>
                    <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="forecastDate" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="predictedPrice" stroke="#16a34a" fill="url(#forecastArea)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <p>Average forecast: <span className="font-semibold text-slate-900">{formatCurrency(forecast?.summary?.averageForecastPrice)}</span></p>
              <p>Best sell day: <span className="font-semibold text-slate-900">{forecast?.summary?.bestSellDay?.forecastDate}</span></p>
              <p>Expected change: <span className="font-semibold text-slate-900">{forecast?.summary?.expectedChangePercent}%</span></p>
            </div>
          </div>

          <div className="glass-panel p-7">
            <h2 className="text-2xl font-bold text-slate-800">{t('recentTrend')}</h2>
            <p className="mt-4 text-slate-600">{detail?.trendLabel}</p>
            <div className="mt-4 space-y-3">
              {anomalies.length > 0 ? anomalies.map((anomaly) => (
                <div key={`${anomaly.date}-${anomaly.reason}`} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-3">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <span>{anomaly.date}: {anomaly.reason}</span>
                </div>
              )) : (
                <p className="text-slate-500">{t('noData')}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel p-7">
        <h2 className="text-2xl font-bold text-slate-800">{t('latestArrival')}</h2>
        <div className="h-72 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="arrivalQty" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default MarketDetail;
