const SUPPORTED_STATES = ['Chhattisgarh', 'Madhya Pradesh'];

const STATE_ALIASES = {
    cg: 'Chhattisgarh',
    chattisgarh: 'Chhattisgarh',
    chhattisgarh: 'Chhattisgarh',
    ct: 'Chhattisgarh',
    'madhya pradesh': 'Madhya Pradesh',
    madhyapradesh: 'Madhya Pradesh',
    mp: 'Madhya Pradesh',
};

const COMMODITY_ALIASES = {
    dhan: 'paddy',
    onion: 'onion',
    paddy: 'paddy',
    potato: 'potato',
    soyabean: 'soybean',
    soybean: 'soybean',
    tomato: 'tomato',
    wheat: 'wheat',
};

const COMMODITY_LABELS = {
    onion: { en: 'Onion', hi: 'प्याज' },
    paddy: { en: 'Paddy', hi: 'धान' },
    potato: { en: 'Potato', hi: 'आलू' },
    soybean: { en: 'Soybean', hi: 'सोयाबीन' },
    tomato: { en: 'Tomato', hi: 'टमाटर' },
    wheat: { en: 'Wheat', hi: 'गेहूं' },
};

function normalizeWhitespace(value) {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .trim();
}

function toSlug(value) {
    return normalizeWhitespace(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function normalizeState(value) {
    const normalized = normalizeWhitespace(value).toLowerCase();
    return STATE_ALIASES[normalized] || null;
}

function normalizeCommodity(value) {
    const normalized = toSlug(value);
    return COMMODITY_ALIASES[normalized] || null;
}

function normalizeDistrict(value) {
    const normalized = normalizeWhitespace(value);
    if (!normalized) {
        return null;
    }

    return normalized
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
}

function normalizeMarketName(value) {
    return normalizeWhitespace(value);
}

function getCommodityLabels(slug) {
    return COMMODITY_LABELS[slug] || {
        en: slug.charAt(0).toUpperCase() + slug.slice(1),
        hi: slug.charAt(0).toUpperCase() + slug.slice(1),
    };
}

module.exports = {
    COMMODITY_LABELS,
    SUPPORTED_STATES,
    getCommodityLabels,
    normalizeCommodity,
    normalizeDistrict,
    normalizeMarketName,
    normalizeState,
    normalizeWhitespace,
    toSlug,
};
