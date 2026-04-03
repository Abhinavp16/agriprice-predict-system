export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '--';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  }).format(value);
};

export const formatNumber = (value) => {
  if (value === undefined || value === null) return '--';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
};

export const commodityLabel = (commodity, language = 'en') => {
  const labels = {
    onion: { en: 'Onion', hi: 'प्याज' },
    paddy: { en: 'Paddy', hi: 'धान' },
    soybean: { en: 'Soybean', hi: 'सोयाबीन' },
    wheat: { en: 'Wheat', hi: 'गेहूं' },
  };

  return labels[commodity]?.[language] || commodity;
};

export const riskClass = (riskLevel) => {
  if (riskLevel === 'High') return 'bg-rose-100 text-rose-700';
  if (riskLevel === 'Medium') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
};
