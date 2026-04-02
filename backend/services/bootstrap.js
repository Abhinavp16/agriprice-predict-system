const { getSeedPayload } = require('../data/seedData');

async function ensureIndexes(db) {
    await db.collection('markets').createIndex({ state: 1, district: 1, name: 1 });
    await db.collection('daily_prices').createIndex({ marketId: 1, commodity: 1, date: -1 });
    await db.collection('daily_prices').createIndex(
        { marketId: 1, commodity: 1, date: 1, source: 1 },
        { unique: true },
    );
    await db.collection('forecasts').createIndex({ marketId: 1, commodity: 1, forecastDate: 1 });
    await db.collection('alerts').createIndex({ commodity: 1, state: 1, district: 1, status: 1 });
    await db.collection('model_versions').createIndex({ commodity: 1, taskType: 1, isActive: 1 });
}

async function seedIfEmpty(db) {
    const marketCount = await db.collection('markets').countDocuments();
    if (marketCount > 0) {
        return { seeded: false };
    }

    const seed = getSeedPayload();
    await db.collection('markets').insertMany(seed.markets);
    await db.collection('daily_prices').insertMany(seed.prices, { ordered: false });
    await db.collection('model_versions').insertMany(seed.modelVersions, { ordered: false });

    return {
        seeded: true,
        markets: seed.markets.length,
        prices: seed.prices.length,
    };
}

async function ensurePlatformReady(db) {
    await ensureIndexes(db);
    return seedIfEmpty(db);
}

module.exports = {
    ensureIndexes,
    ensurePlatformReady,
};
