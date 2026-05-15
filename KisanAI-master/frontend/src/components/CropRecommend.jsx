import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Droplets, 
  ThermometerSun, 
  Leaf, 
  CheckCircle2, 
  MapPin, 
  Loader2, 
  Navigation, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  BadgeCheck,
  History,
  X,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRecommendations, fetchRecHistory } from '../services/api';

export default function CropRecommend() {
  const [form, setForm] = useState({ soil: '', season: '', water: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [location, setLocation] = useState({ lat: null, lon: null, name: '' });
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = async () => {
    try {
      const data = await fetchRecHistory();
      setHistory(data);
    } catch (err) { console.error('History load error:', err); }
  };

  useEffect(() => {
    document.title = "Field Planning | KisanAI";
    loadHistory();
    detectLocation();
  }, []);

  const detectLocation = async () => {
    if (!("geolocation" in navigator)) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await resp.json();
        const city = data.address.city || data.address.town || data.address.village || 'Your Area';
        const state = data.address.state || '';
        setLocation({ lat: latitude, lon: longitude, name: `${city}${state ? ', ' + state : ''}` });
      } catch (err) {
        console.error('Geo error:', err);
      } finally {
        setLocLoading(false);
      }
    }, () => setLocLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await fetchRecommendations({ ...form, lat: location.lat, lon: location.lon });
      setResult(data.recommendations);
      loadHistory();
    } catch (err) {
      setError('Field planning engine is currently busy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-['Manrope'] text-[#191d18] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#002c06] tracking-tight">Field Planning</h1>
            <p className="text-xs text-[#41493e] font-medium opacity-60 mt-0.5">Optimized crop rotation and resource management.</p>
          </motion.div>
          
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowHistory(v => !v)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${showHistory ? 'bg-[#1b5e20] text-white border-[#1b5e20]' : 'bg-white border-[#e1e4db] text-[#41493e] hover:bg-gray-50'}`}
             >
                <History size={14} />
                Plan History
             </button>

             <button 
               onClick={detectLocation}
               disabled={locLoading}
               className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-white border border-[#e1e4db] text-[#41493e] hover:shadow-sm"
             >
                {locLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} className={location.name ? "text-[#1b5e20]" : ""} />}
                {location.name || 'Detect Area'}
             </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 relative">
          {/* History Sidebar */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="absolute inset-y-0 left-0 w-full lg:w-72 bg-white z-20 border border-[#e1e4db] rounded-2xl p-6 shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#002c06] font-black text-[10px] uppercase tracking-widest">Recent Plans</h3>
                  <button onClick={() => setShowHistory(false)} className="text-[#41493e] hover:text-[#002c06]"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setResult(JSON.parse(item.recommendations));
                        setForm({ soil: item.soil, season: item.season, water: item.water });
                        setShowHistory(false);
                      }}
                      className="w-full text-left p-4 rounded-xl border border-[#f4f4f0] hover:border-[#1b5e20]/20 hover:bg-[#f8faf2] transition-all"
                    >
                      <p className="text-[#002c06] text-[10px] font-black uppercase tracking-tight mb-1">{item.season} Cycle</p>
                      <div className="flex items-center gap-2 text-[9px] text-[#41493e] font-bold uppercase opacity-40">
                        <span>{item.soil} Soil</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                  {history.length === 0 && <p className="text-center text-xs text-[#41493e] py-10 opacity-40 italic">No past plans found.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Configuration Card */}
          <div className="lg:w-72 shrink-0">
            <motion.div 
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#e1e4db] rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6 border-b border-[#f4f4f0] pb-4">
                 <Layers size={16} className="text-[#1b5e20]" />
                 <h2 className="text-[10px] font-black uppercase tracking-widest text-[#002c06]">Field Parameters</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  {
                    key: 'soil', label: 'Soil Composition', icon: Leaf, color: 'text-amber-600',
                    options: [
                      { v: 'Alluvial', l: 'Alluvial' },
                      { v: 'Black',    l: 'Black (Regur)' },
                      { v: 'Red',      l: 'Red' },
                      { v: 'Laterite', l: 'Laterite' },
                      { v: 'Loam',     l: 'Loamy' },
                    ]
                  },
                  {
                    key: 'season', label: 'Planting Season', icon: Calendar, color: 'text-emerald-600',
                    options: [
                      { v: 'Kharif', l: 'Kharif (Monsoon)' },
                      { v: 'Rabi',   l: 'Rabi (Winter)' },
                      { v: 'Zaid',   l: 'Zaid (Summer)' },
                    ]
                  },
                  {
                    key: 'water', label: 'Water Resources', icon: Droplets, color: 'text-blue-600',
                    options: [
                      { v: 'High',   l: 'Abundant Irrigation' },
                      { v: 'Medium', l: 'Moderate Supply' },
                      { v: 'Low',    l: 'Rainfed / Scarcity' },
                    ]
                  }
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#41493e] uppercase tracking-widest opacity-60 flex items-center gap-2">
                       <field.icon size={12} className={field.color} /> {field.label}
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={form[field.key]}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        className="w-full bg-[#f8faf2] border border-[#e1e4db] rounded-xl px-4 py-3 text-xs text-[#002c06] font-bold outline-none appearance-none focus:ring-1 focus:ring-[#1b5e20]/20 transition-all"
                      >
                        <option value="" disabled>Select {field.key}...</option>
                        {field.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1b5e20] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#002c06] transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Run Analysis'}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            {!result && !loading && (
              <div className="bg-white/50 border-2 border-dashed border-[#e1e4db] rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                   <Sprout size={32} className="text-[#1b5e20]/20" />
                </div>
                <h3 className="text-lg font-bold text-[#002c06] mb-2">Ready to plan?</h3>
                <p className="text-sm text-[#41493e] max-w-sm font-medium opacity-60">Configure your field parameters and run the analysis to find the most profitable and sustainable crops for your specific area.</p>
              </div>
            )}

            {loading && (
              <div className="bg-white border border-[#e1e4db] rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] shadow-sm">
                <div className="w-20 h-20 relative mb-8">
                   <div className="absolute inset-0 border-4 border-[#d9e6da] rounded-full" />
                   <div className="absolute inset-0 border-4 border-transparent border-t-[#1b5e20] rounded-full animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Sprout size={28} className="text-[#1b5e20] animate-pulse" />
                   </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002c06] mb-1">Processing Field Data</p>
                <p className="text-xs text-[#41493e] font-medium opacity-40 italic">Aggregating soil health and climate models...</p>
              </div>
            )}

            <AnimatePresence>
              {result && !loading && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between px-2 mb-2">
                     <h3 className="text-[10px] font-black text-[#002c06] uppercase tracking-[0.2em] flex items-center gap-2">
                       <BadgeCheck size={16} className="text-emerald-600" /> Professional Recommendations
                     </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {result.map((crop, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white border border-[#e1e4db] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                      >
                        {i === 0 && (
                           <div className="absolute top-0 right-0 bg-[#002c06] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl z-10">
                             Optimal Match
                           </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-6">
                           <div className="w-14 h-14 bg-[#f8faf2] rounded-xl flex items-center justify-center flex-shrink-0 border border-[#e1e4db] group-hover:bg-[#d9e6da] transition-colors">
                             <Leaf size={24} className="text-[#1b5e20]" />
                           </div>
                           
                           <div className="flex-1 space-y-4">
                              <div>
                                 <h4 className="text-xl font-extrabold text-[#002c06] leading-tight mb-1">{crop.name}</h4>
                                 <p className="text-sm text-[#41493e] font-medium leading-relaxed opacity-80">{crop.reason}</p>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                 <div className="bg-[#f8faf2] p-3 rounded-xl border border-[#e1e4db]/50">
                                    <p className="text-[8px] font-black text-[#41493e] uppercase tracking-widest opacity-40 mb-1 flex items-center gap-1.5">
                                       <Calendar size={10} /> Growth Cycle
                                    </p>
                                    <p className="text-xs font-bold text-[#002c06]">{crop.cycle}</p>
                                 </div>
                                 <div className="bg-[#f8faf2] p-3 rounded-xl border border-[#e1e4db]/50">
                                    <p className="text-[8px] font-black text-[#41493e] uppercase tracking-widest opacity-40 mb-1 flex items-center gap-1.5">
                                       <TrendingUp size={10} /> Profit Plan
                                    </p>
                                    <p className="text-xs font-bold text-[#002c06]">{crop.profit}</p>
                                 </div>
                                 <div className="bg-[#f8faf2] p-3 rounded-xl border border-[#e1e4db]/50">
                                    <p className="text-[8px] font-black text-[#41493e] uppercase tracking-widest opacity-40 mb-1 flex items-center gap-1.5">
                                       <CheckCircle2 size={10} /> Resource Fit
                                    </p>
                                    <p className="text-xs font-bold text-[#002c06]">Optimized</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                <AlertTriangle className="text-red-600" size={18} />
                <p className="text-xs font-bold text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Advisory Tips Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {[
             { title: 'Climate Focus', text: 'Regional models suggest stable rainfall. Adjusting for standard irrigation.', icon: Droplets, color: 'text-blue-600' },
             { title: 'Soil Integrity', text: 'Last lab sync complete. Composition remains within optimal range.', icon: ShieldAlert, color: 'text-emerald-600' },
             { title: 'Market Pulse', text: 'Regional demand for cereals is trending up 3.5% this month.', icon: TrendingUp, color: 'text-amber-600' }
           ].map((tip, i) => (
             <div key={i} className="bg-white border border-[#e1e4db] p-5 rounded-2xl flex items-start gap-4">
                <tip.icon size={20} className={`${tip.color} shrink-0 mt-1`} />
                <div>
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-[#002c06] mb-1">{tip.title}</h5>
                   <p className="text-xs text-[#41493e] font-medium leading-relaxed opacity-60">{tip.text}</p>
                </div>
             </div>
           ))}
        </section>
      </div>
    </div>
  );
}
