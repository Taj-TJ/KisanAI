import React, { useState, useEffect } from 'react';
import { Sprout, Droplets, ThermometerSun, Leaf, CheckCircle2, MapPin, Loader2, Sparkles, Navigation, AlertTriangle, TrendingUp, ShieldAlert, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCard from './ui/AnimatedCard';
import GlowButton from './ui/GlowButton';
import EmptyState from './ui/EmptyState';
import { fetchRecommendations } from '../services/api';

export default function CropRecommend() {
  const [form, setForm] = useState({ soil: '', season: '', water: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [location, setLocation] = useState({ lat: null, lon: null, name: '' });
  const [error, setError] = useState(null);

  const detectLocation = async () => {
    if (!("geolocation" in navigator)) return;
    
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await resp.json();
        
        const state = data.address.state;
        const city = data.address.city || data.address.town || data.address.village || 'Your Area';
        setLocation({ lat: latitude, lon: longitude, name: `${city}, ${state}` });
      } catch (err) {
        console.error('Geo error:', err);
      } finally {
        setLocLoading(false);
      }
    }, () => setLocLoading(false));
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const data = await fetchRecommendations({
        ...form,
        lat: location.lat,
        lon: location.lon
      });
      setResult(data.recommendations);
    } catch (err) {
      setError('AI Recommendation engine is currently busy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'linear-gradient(160deg, #0d1a0e 0%, #0f1c1a 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10">

        {/* Header */}
        <div className="mb-8 md:flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
              AI Crop Recommender <Sparkles size={20} className="text-leaf-400" />
            </h2>
            <p className="text-sm text-gray-400 mt-1">Personalized agricultural intelligence powered by Gemini AI</p>
          </div>
          
          <div className="mt-4 md:mt-0">
             <button 
               type="button"
               onClick={detectLocation}
               disabled={locLoading}
               className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-white/5 border border-white/10"
               style={{ color: location.name ? '#61a65d' : '#aaa' }}
             >
                {locLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                {location.name ? `Location: ${location.name}` : 'Detect My Location'}
             </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <AnimatedCard
            className="p-6 lg:w-80 flex-shrink-0"
            hover={false}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {[
                {
                  key: 'soil', label: 'Soil Type', Icon: Leaf, color: 'text-amber-500',
                  options: [
                    { v: 'Alluvial', l: 'Alluvial Soil' },
                    { v: 'Black',    l: 'Black Soil (Regur)' },
                    { v: 'Red',      l: 'Red Soil' },
                    { v: 'Laterite', l: 'Laterite Soil' },
                  ]
                },
                {
                  key: 'season', label: 'Upcoming Season', Icon: ThermometerSun, color: 'text-orange-400',
                  options: [
                    { v: 'Kharif', l: 'Kharif (Monsoon)' },
                    { v: 'Rabi',   l: 'Rabi (Winter)' },
                    { v: 'Zaid',   l: 'Zaid (Summer)' },
                  ]
                },
                {
                  key: 'water', label: 'Water Availability', Icon: Droplets, color: 'text-blue-400',
                  options: [
                    { v: 'High',   l: 'High (Canal / Borewell)' },
                    { v: 'Medium', l: 'Medium (Limited groundwater)' },
                    { v: 'Low',    l: 'Low (Rainfed only)' },
                  ]
                }
              ].map(({ key, label, Icon, color, options }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2 uppercase tracking-tighter">
                    <Icon size={14} className={color} /> {label}
                  </label>
                  <select
                    required
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3.5 text-sm text-white outline-none appearance-none transition-all focus:ring-1 focus:ring-leaf-500"
                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <option value="" disabled>Choose {label}...</option>
                    {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              ))}

              <GlowButton
                type="submit"
                disabled={loading}
                className="w-full py-4 text-sm font-bold text-white flex items-center justify-center h-14 mt-2"
              >
                {loading
                  ? <Loader2 className="animate-spin" />
                  : <span className="flex items-center gap-2 uppercase tracking-widest"><Sparkles size={16} /> Analyze Field</span>
                }
              </GlowButton>
            </form>
          </AnimatedCard>

          {/* Results Area */}
          <div className="flex-1">
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-2xl flex items-center gap-3 mb-6">
                <AlertCircle className="text-red-400" size={18} />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {!result && !loading && (
              <EmptyState 
                icon={Sprout} 
                title="Ready to grow?" 
                description="Configure your field parameters and let the AI Expert calculate the most profitable crops for your location."
              />
            )}

            {loading && (
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-6">
                <div className="w-24 h-24 relative">
                  <div className="absolute inset-0 border-[6px] rounded-full opacity-10" style={{ borderColor: '#3f8a3b' }}></div>
                  <div className="absolute inset-0 border-[6px] border-transparent rounded-full animate-spin" style={{ borderTopColor: '#61a65d' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <Sprout size={32} className="text-leaf-400" />
                    </motion.div>
                  </div>
                </div>
                <div className="text-center">
                   <p className="text-lg font-semibold text-white">Consulting AI Agronomist...</p>
                   <p className="text-xs text-leaf-500 mt-1 uppercase tracking-widest animate-pulse">Analyzing Live Weather & Soil Data</p>
                </div>
              </div>
            )}

            {result && !loading && (
              <motion.div initial="hidden" animate="visible" variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }} className="flex flex-col gap-5">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-widest opacity-80">
                     <BadgeCheck size={18} className="text-emerald-400" /> Expert Recommendations
                   </h3>
                   <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded-md">POWERED BY GEMINI AI</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {result.map((crop, i) => (
                    <AnimatedCard
                      key={i}
                      className="p-6 md:p-8 flex flex-col md:flex-row items-start gap-6 relative overflow-hidden"
                    >
                      {i === 0 && (
                         <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-lg z-10">
                           Top Match
                         </div>
                      )}

                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-xl bg-leaf-500/10 border border-leaf-500/20 z-10">
                        <Leaf size={28} className="text-leaf-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0 w-full z-10">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <h4 className="font-bold text-white text-2xl tracking-tight leading-tight">
                              {crop.name}
                            </h4>
                            <p className="text-xs text-gray-400 font-light mt-2 leading-relaxed">{crop.reason}</p>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                           <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                             <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
                               <ThermometerSun size={10} className="text-orange-400" /> Growth Cycle
                             </p>
                             <p className="text-sm text-gray-200 font-bold tracking-tight">{crop.cycle}</p>
                           </div>
                           <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                             <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
                               <TrendingUp size={10} className="text-emerald-400" /> Profit Potential
                             </p>
                             <p className="text-sm text-gray-200 font-bold tracking-tight">{crop.profit}</p>
                           </div>
                           <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                             <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
                               <ShieldAlert size={10} className="text-blue-400" /> Resource Match
                             </p>
                             <p className="text-sm text-gray-200 font-bold tracking-tight">Optimized</p>
                           </div>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertCircle({ className, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
