import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { ArrowLeft, Clock, MapPin, Zap } from 'lucide-react';

const mockChartData = [
  { name: 'Mon', price: 24, volume: 1400 },
  { name: 'Tue', price: 25, volume: 1560 },
  { name: 'Wed', price: 23.5, volume: 1200 },
  { name: 'Thu', price: 26, volume: 1800 },
  { name: 'Fri', price: 28, volume: 2100 },
  { name: 'Sat', price: 27, volume: 1950 },
  { name: 'Sun', price: 25.5, volume: 1600 },
];

const MarketDetail = () => {
  const { id } = useParams();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock local fetch until backend is populated
    setTimeout(() => {
      setMarket({
        id,
        name: 'Pune APMC Main Hub',
        district: 'Pune',
        status: 'Open',
        lastUpdated: '10 mins ago'
      });
      setLoading(false);
    }, 800);
  }, [id]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <Link to="/" className="inline-flex items-center text-slate-500 hover:text-primary-600 transition-colors group">
        <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Search
      </Link>

      {/* Header Profile */}
      <div className="glass-panel p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-slate-900">{market?.name}</h1>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wide">
              {market?.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1.5"><MapPin size={16} /> District: {market?.district}</span>
            <span className="flex items-center gap-1.5"><Clock size={16} /> Updated: {market?.lastUpdated}</span>
          </div>
        </div>
        <div className="bg-primary-50 text-primary-700 px-6 py-4 rounded-2xl flex items-center gap-3">
          <Zap size={24} className="text-primary-500 animate-pulse" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">Market Trend</p>
            <p className="text-xl font-black">High Demand</p>
          </div>
        </div>
      </div>

      {/* Analytics Main Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800">7-Day Price History</h2>
              <p className="text-slate-500 text-sm mt-1">Average daily closing prices (₹/10kg)</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:ring-primary-500">
              <option>Onion</option>
              <option>Potato</option>
              <option>Tomato</option>
            </select>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="price" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel Stats */}
        <div className="space-y-8">
          <div className="glass-panel p-8">
            <h3 className="font-bold text-slate-800 mb-6 uppercase tracking-wider text-sm">Today's Highlights</h3>
            <div className="space-y-6">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Total Arrival Volume</p>
                <p className="text-3xl font-black text-slate-900">2,450 <span className="text-lg text-slate-400 font-medium tracking-normal">Quintals</span></p>
              </div>
              <div className="h-px bg-slate-100 w-full" />
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Average Grade A Price</p>
                <p className="text-3xl font-black text-emerald-600">₹25.8 <span className="text-lg text-emerald-600/60 font-medium tracking-normal">/ 10kg</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;
