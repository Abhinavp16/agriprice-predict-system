import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';

const commodities = [
  { id: 'onion', name: 'Onion', icon: '🧅' },
  { id: 'potato', name: 'Potato', icon: '🥔' },
  { id: 'tomato', name: 'Tomato', icon: '🍅' },
];

const Home = () => {
  const navigate = useNavigate();
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [location, setLocation] = useState('');
  // In a real app, these would come from the browser's Geolocation API or a map selector
  const [lat, setLat] = useState('18.5204');
  const [lon, setLon] = useState('73.8567');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCommodity) return;
    
    navigate(`/results?commodity=${selectedCommodity}&lat=${lat}&lon=${lon}&locName=${encodeURIComponent(location || 'Pune')}`);
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
          Find the Best Market for Your Produce
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Our AI-powered models analyze real-time data to predict exactly where you'll get the best price for your crops in Pune.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Commodity Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
              1. Select Commodity
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {commodities.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCommodity(c.id)}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                    selectedCommodity === c.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md transform scale-105'
                      : 'border-slate-200 bg-white/50 hover:border-primary-300 hover:bg-white text-slate-600'
                  }`}
                >
                  <span className="text-4xl">{c.icon}</span>
                  <span className="font-medium text-lg">{c.name}</span>
                  {selectedCommodity === c.id && (
                    <div className="absolute top-3 right-3 w-3 h-3 bg-primary-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Location Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
              2. Your Location (Pune)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <MapPin size={20} />
              </div>
              <input
                type="text"
                placeholder="Enter your specific area or farm location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!selectedCommodity}
              className={`w-full py-4 rounded-xl text-lg font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                selectedCommodity
                  ? 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white transform hover:-translate-y-1'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Search size={24} />
              Find Best Market
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
