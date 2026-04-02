const { getCommodityLabels } = require('../utils/normalizers');

const MARKET_SEED = [
    {
        _id: 'mp-bhopal-001',
        code: 'MP-BPL-001',
        name: 'Bhopal Krishi Upaj Mandi',
        state: 'Madhya Pradesh',
        district: 'Bhopal',
        lat: 23.2599,
        lon: 77.4126,
        estimatedDistanceKm: 18,
        status: 'Active',
        commodities: ['wheat', 'soybean', 'onion', 'paddy'],
        priceBias: 45,
    },
    {
        _id: 'mp-bhopal-002',
        code: 'MP-BPL-002',
        name: 'Karond Farmer Market',
        state: 'Madhya Pradesh',
        district: 'Bhopal',
        lat: 23.2815,
        lon: 77.4011,
        estimatedDistanceKm: 24,
        status: 'Active',
        commodities: ['wheat', 'soybean', 'onion', 'paddy'],
        priceBias: 85,
    },
    {
        _id: 'mp-indore-001',
        code: 'MP-IDR-001',
        name: 'Indore Chhawani Mandi',
        state: 'Madhya Pradesh',
        district: 'Indore',
        lat: 22.7196,
        lon: 75.8577,
        estimatedDistanceKm: 22,
        status: 'Active',
        commodities: ['wheat', 'soybean', 'onion', 'paddy'],
        priceBias: 130,
    },
    {
        _id: 'mp-indore-002',
        code: 'MP-IDR-002',
        name: 'Lasudia Produce Exchange',
        state: 'Madhya Pradesh',
        district: 'Indore',
        lat: 22.7521,
        lon: 75.9027,
        estimatedDistanceKm: 28,
        status: 'Active',
        commodities: ['wheat', 'soybean', 'onion', 'paddy'],
        priceBias: 70,
    },
    {
        _id: 'cg-raipur-001',
        code: 'CG-RPR-001',
        name: 'Raipur Kisan Bazaar',
        state: 'Chhattisgarh',
        district: 'Raipur',
        lat: 21.2514,
        lon: 81.6296,
        estimatedDistanceKm: 20,
        status: 'Active',
        commodities: ['wheat', 'soybean', 'onion', 'paddy'],
        priceBias: 60,
    },
    {
        _id: 'cg-raipur-002',
        code: 'CG-RPR-002',
        name: 'Abhanpur Agri Yard',
        state: 'Chhattisgarh',
        district: 'Raipur',
        lat: 21.0522,
        lon: 81.7456,
        estimatedDistanceKm: 33,
        status: 'Active',
        commodities: ['wheat', 'soybean', 'onion', 'paddy'],
        priceBias: 25,
    },
    {
        _id: 'cg-durg-001',
        code: 'CG-DRG-001',
        name: 'Durg Krishi Mandi',
        state: 'Chhattisgarh',
        district: 'Durg',
        lat: 21.1904,
        lon: 81.2849,
        estimatedDistanceKm: 19,
        status: 'Active',
        commodities: ['wheat', 'soybean', 'onion', 'paddy'],
        priceBias: 10,
    },
    {
        _id: 'cg-durg-002',
        code: 'CG-DRG-002',
        name: 'Bhilai Produce Hub',
        state: 'Chhattisgarh',
        district: 'Durg',
        lat: 21.1938,
        lon: 81.3509,
        estimatedDistanceKm: 26,
        status: 'Active',
        commodities: ['wheat', 'soybean', 'onion', 'paddy'],
        priceBias: 42,
    },
];

const COMMODITY_CONFIG = {
    onion: { arrivalBase: 520, basePrice: 1880, spread: 95, slope: 24 },
    paddy: { arrivalBase: 640, basePrice: 2220, spread: 80, slope: 18 },
    soybean: { arrivalBase: 390, basePrice: 4470, spread: 120, slope: 28 },
    wheat: { arrivalBase: 440, basePrice: 2650, spread: 85, slope: 20 },
};

function buildPriceDocs(days = 24) {
    const today = new Date(Date.UTC(2026, 3, 2));
    const docs = [];

    for (const market of MARKET_SEED) {
        for (const commodity of market.commodities) {
            const config = COMMODITY_CONFIG[commodity];
            for (let offset = days - 1; offset >= 0; offset -= 1) {
                const day = new Date(today);
                day.setUTCDate(today.getUTCDate() - offset);
                const isoDate = day.toISOString().slice(0, 10);
                const step = days - offset;
                const weeklyWave = ((step % 5) - 2) * 9;
                const seasonalWave = Math.round(Math.sin(step / 3) * (config.spread / 3));
                const stateLift = market.state === 'Madhya Pradesh' ? 35 : -18;
                const modalPrice =
                    config.basePrice +
                    market.priceBias +
                    stateLift +
                    step * config.slope +
                    weeklyWave +
                    seasonalWave;
                const minPrice = modalPrice - config.spread;
                const maxPrice = modalPrice + Math.round(config.spread * 1.2);
                const arrivalQty =
                    config.arrivalBase +
                    ((step % 4) * 22) +
                    Math.round(Math.cos(step / 4) * 18) +
                    Math.round(market.priceBias / 8);

                docs.push({
                    _id: `${market._id}-${commodity}-${isoDate}`,
                    arrivalQty: Math.max(arrivalQty, 70),
                    commodity,
                    date: isoDate,
                    district: market.district,
                    ingestedAt: new Date().toISOString(),
                    marketId: market._id,
                    maxPrice,
                    minPrice,
                    modalPrice,
                    source: 'seed-bootstrap',
                    state: market.state,
                });
            }
        }
    }

    return docs;
}

function buildModelVersions() {
    return Object.keys(COMMODITY_CONFIG).flatMap((commodity, index) => {
        const labels = getCommodityLabels(commodity);
        return [
            {
                _id: `${commodity}-recommendation-v1`,
                commodity,
                commodityLabel: labels.en,
                taskType: 'recommendation',
                states: ['Madhya Pradesh', 'Chhattisgarh'],
                artifactPath: `builtin:${commodity}:recommendation:v1`,
                metrics: {
                    mape: 5.8 + index * 0.4,
                    rmse: 72 + index * 6,
                },
                trainedAt: '2026-04-01T09:00:00.000Z',
                isActive: true,
            },
            {
                _id: `${commodity}-forecast-v1`,
                commodity,
                commodityLabel: labels.en,
                taskType: 'forecast',
                states: ['Madhya Pradesh', 'Chhattisgarh'],
                artifactPath: `builtin:${commodity}:forecast:v1`,
                metrics: {
                    mape: 6.9 + index * 0.5,
                    rmse: 81 + index * 7,
                },
                trainedAt: '2026-04-01T09:30:00.000Z',
                isActive: true,
            },
        ];
    });
}

function getSeedPayload() {
    const createdAt = new Date().toISOString();

    return {
        markets: MARKET_SEED.map((market) => ({
            ...market,
            createdAt,
            updatedAt: createdAt,
        })),
        modelVersions: buildModelVersions(),
        prices: buildPriceDocs(),
    };
}

module.exports = {
    getSeedPayload,
};
