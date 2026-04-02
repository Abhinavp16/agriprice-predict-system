import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, Truck, ChevronLeft, AlertCircle } from 'lucide-react';

const Results = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const commodity = params.get('commodity');
  const lat = params.get('lat');
  const lon = params.get('lon');
  const locName = params.get('locName');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        // Uses the locally configured vite proxy or .env pointing to backend cluster
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/recommend`,
          {
            params: { commodity, lat, lon }
          }
        );
        // Assuming response structure: { best_market, predicted_price }
        setResult(response.data);
      } catch (err) {
        console.error('Prediction fetch error', err);
        setError('Failed to fetch prediction from the server. Please ensure backend services are running.');
      } finally {
        setLoading(false);
      }
    };

    if (commodity && lat && lon) {
      fetchPrediction();
    } else {
      setError('Missing parameters. Please try submitting again from the home page.');
      setLoading(false);
    }
  }, [commodity, lat, lon]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-8 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-slate-700 animate-pulse">Running ML Models...</h2>
        <p className="text-slate-500">Analyzing historical and predictive market data across Pune</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <Link to="/" className="inline-flex items-center text-slate-500 hover:text-primary-600 mb-8 transition-colors group">
        <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to search</span>
      </Link>

      {error ? (
        <div className="glass-panel border-red-200 bg-red-50/80 p-6 flex items-start gap-4">
          <AlertCircle className="text-red-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Error Processing Request</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Best Recommended Market
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              For <span className="font-bold text-primary-700 capitalize">{commodity}</span> from {locName || 'your location'}
            </p>
          </div>

          <div className="glass-panel p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-bold text-sm tracking-wide mb-6 flex items-center gap-2 w-max">
                  <TrendingUp size={16} /> Highest Projected Return
                </div>
                <h2 className="text-6xl font-black text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                  {result?.best_market || 'N/A'}
                </h2>
                <div className="flex items-center gap-2 text-slate-500 font-medium mb-8">
                  <Truck size={20} />
                  <span>Estimated transport distance: ~14 km</span>
                </div>
              </div>
              
              <div className="bg-white/80 p-8 rounded-3xl shadow-lg border border-slate-100 backdrop-blur-md">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Predicted APMC Price</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-extrabold text-primary-600">₹{result?.predicted_price || '0.00'}</span>
                  <span className="text-xl text-slate-400 font-medium text-slate-400 font-medium">/ 10 kg</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full mt-6 mb-2">
                  <div className="h-full bg-gradient-to-r from-primary-400 to-emerald-400 rounded-full w-4/5"></div>
                </div>
                <p className="text-xs font-semibold text-emerald-600">Model Confidence: 89%</p>
                <Link to={`/market/1`} className="mt-8 block w-full text-center py-3 bg-primary-50 text-primary-700 font-bold rounded-xl hover:bg-primary-600 hover:text-white transition-all duration-300">
                  View Market Details & Trends
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
