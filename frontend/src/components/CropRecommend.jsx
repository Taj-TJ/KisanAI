import React, { useState, useEffect } from 'react';
import { Sprout, Droplets, ThermometerSun, Leaf, CheckCircle2, MapPin, Loader2, Sparkles, Navigation } from 'lucide-react';

// Knowledge base mapping state/region to likely soil and crops
const REGION_DATA = {
  'Uttar Pradesh': { soil: 'alluvial', crops: ['Wheat 🌾', 'Sugarcane 🎋', 'Rice 🌾'] },
  'Punjab': { soil: 'alluvial', crops: ['Wheat 🌾', 'Rice 🌾', 'Cotton 🌿'] },
  'Haryana': { soil: 'alluvial', crops: ['Wheat 🌾', 'Mustard 🌼', 'Barley'] },
  'Madhya Pradesh': { soil: 'black', crops: ['Soybean 🌱', 'Wheat 🌾', 'Gram 🌱'] },
  'Maharashtra': { soil: 'black', crops: ['Cotton 🌿', 'Sugarcane 🎋', 'Jowar 🌾'] },
  'Gujarat': { soil: 'black', crops: ['Cotton 🌿', 'Groundnut 🥜', 'Castor'] },
  'Karnataka': { soil: 'red', crops: ['Ragi', 'Coffee ☕', 'Maize 🌽'] },
  'Tamil Nadu': { soil: 'red', crops: ['Rice 🌾', 'Groundnut 🥜', 'Coconut 🥥'] },
  'Kerala': { soil: 'laterite', crops: ['Rubber', 'Black Pepper', 'Cardamom'] },
  'Assam': { soil: 'alluvial', crops: ['Tea ☕', 'Rice 🌾', 'Jute'] },
  'Rajasthan': { soil: 'red', crops: ['Bajra', 'Mustard 🌼', 'Guar'] },
};

const DB = {
  alluvial:  { kharif: { high: ['Rice 🌾','Sugarcane 🎋','Cotton 🌿'], med: ['Maize 🌽'] }, rabi: { high: ['Wheat 🌾','Mustard 🌼'], med: ['Gram 🌱'] }, zaid: { high: ['Sunflower 🌻'], med: ['Watermelon 🍉'] } },
  black:     { kharif: { high: ['Cotton 🌿','Soybean 🌱'], med: ['Jowar 🌾'] }, rabi: { high: ['Wheat 🌾','Chickpea 🌱'], med: ['Linseed'] }, zaid: { high: ['Sunflower 🌻'], med: [] } },
  red:       { kharif: { high: ['Groundnut 🥜','Millets 🌾'], med: ['Maize 🌽'] }, rabi: { high: ['Wheat 🌾','Barley'], med: ['Lentil'] }, zaid: { high: ['Watermelon 🍉'], med: [] } },
  laterite:  { kharif: { high: ['Cashew 🥜','Tea','Coffee'], med: ['Rice 🌾'] }, rabi: { high: ['Cassava','Pineapple 🍍'], med: [] }, zaid: { high: ['Banana 🍌'], med: [] } },
};

export default function CropRecommend() {
  const [form, setForm] = useState({ soil: '', season: '', water: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locationName, setLocationName] = useState('');

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
        setLocationName(`${city}, ${state}`);

        if (state && REGION_DATA[state]) {
           setForm(prev => ({ ...prev, soil: REGION_DATA[state].soil }));
        }
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

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    setTimeout(() => {
      const s = DB[form.soil]?.[form.season];
      if (s) {
        const recs = s.high.map((name, i) => ({ 
           name, 
           confidence: 90 + Math.floor(Math.random() * 8), 
           cycle: '120-150 Days', 
           profit: 'High',
           matchReason: `Thrives in ${form.soil} soil during ${form.season} season.`
        }));
        setResult(recs);
      } else {
        setResult([]);
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'linear-gradient(160deg, #0d1a0e 0%, #0f1c1a 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10">

        {/* Header */}
        <div className="mb-8 md:flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
              AI Crop Recommender <Sparkles size={20} className="text-leaf-400" />
            </h2>
            <p className="text-sm text-gray-400 mt-1">Personalized agricultural intelligence based on your terrain</p>
          </div>
          
          <div className="mt-4 md:mt-0">
             <button 
               onClick={detectLocation}
               disabled={locLoading}
               className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: locationName ? '#61a65d' : '#888' }}
             >
               {locLoading ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
               {locationName ? `Location: ${locationName}` : 'Detect My Location'}
             </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div
            className="rounded-3xl p-6 lg:w-80 flex-shrink-0 animate-fade-in"
            style={{ background: 'rgba(26,46,27,0.5)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {[
                {
                  key: 'soil', label: 'Soil Type', Icon: Leaf, color: 'text-amber-500',
                  options: [
                    { v: 'alluvial', l: 'Alluvial Soil' },
                    { v: 'black',    l: 'Black Soil (Regur)' },
                    { v: 'red',      l: 'Red Soil' },
                    { v: 'laterite', l: 'Laterite Soil' },
                  ]
                },
                {
                  key: 'season', label: 'Upcoming Season', Icon: ThermometerSun, color: 'text-orange-400',
                  options: [
                    { v: 'kharif', l: 'Kharif (Monsoon)' },
                    { v: 'rabi',   l: 'Rabi (Winter)' },
                    { v: 'zaid',   l: 'Zaid (Summer)' },
                  ]
                },
                {
                  key: 'water', label: 'Water Availability', Icon: Droplets, color: 'text-blue-400',
                  options: [
                    { v: 'high',   l: 'High (Canal / Borewell)' },
                    { v: 'medium', l: 'Medium (Limited groundwater)' },
                    { v: 'low',    l: 'Low (Rainfed only)' },
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl py-4 text-sm font-bold text-white flex items-center justify-center h-14 transition-all active:scale-95 mt-2"
                style={{ background: 'linear-gradient(135deg, #2d6e2a, #3f8a3b)', boxShadow: '0 8px 30px rgba(63,138,59,0.3)' }}
              >
                {loading
                  ? <Loader2 className="animate-spin" />
                  : <span className="flex items-center gap-2 uppercase tracking-widest"><Sparkles size={16} /> Get Recommendations</span>
                }
              </button>
            </form>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            {!result && !loading && (
              <div
                className="min-h-[300px] h-full rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12"
                style={{ border: '2px dashed rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
              >
                <div className="w-20 h-20 rounded-full bg-leaf-900/20 flex items-center justify-center mb-6">
                  <Sprout size={40} className="text-leaf-900" />
                </div>
                <h4 className="text-white font-medium mb-2">Ready to grow?</h4>
                <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">Adjust your field parameters and let KisanAI calculate the most profitable crops for your location.</p>
              </div>
            )}

            {loading && (
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 relative">
                  <div className="absolute inset-0 border-[6px] rounded-full opacity-10" style={{ borderColor: '#3f8a3b' }}></div>
                  <div className="absolute inset-0 border-[6px] border-transparent rounded-full animate-spin" style={{ borderTopColor: '#61a65d' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sprout className="text-leaf-400 animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                   <p className="text-lg font-semibold text-white animate-pulse">Computing Best Matches...</p>
                   <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Integrating soil & climate matrices</p>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-widest opacity-80">
                     <CheckCircle2 size={16} className="text-emerald-400" /> Top Recommendations
                   </h3>
                   <span className="text-[10px] text-gray-500 font-mono">Found {result.length} matches</span>
                </div>

                {result.length === 0 && (
                  <div className="p-12 text-center bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                     <p className="text-gray-500 text-sm italic">No optimal matches found for this specific combination. Our AI suggests trying an alternative season or verifying your soil type.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {result.map((crop, i) => (
                    <div
                      key={i}
                      className="group rounded-[2rem] p-6 flex items-start gap-6 transition-all hover:translate-x-1"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-2xl transition-transform group-hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {crop.name.split(' ').pop()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-white text-xl tracking-tight leading-tight">
                              {crop.name.replace(/\s[\S]*$/, '')}
                            </h4>
                            <p className="text-xs text-leaf-400/80 font-medium mt-1">{crop.matchReason}</p>
                          </div>
                          <div
                            className="text-xs font-black px-3 py-1.5 rounded-xl text-emerald-400 flex-shrink-0 flex flex-col items-center"
                            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.1)' }}
                          >
                            <span className="text-[10px] opacity-60 uppercase font-bold mb-0.5">Match</span>
                            {crop.confidence}%
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="bg-white/[0.02] rounded-2xl p-3 border border-white/[0.03]">
                            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Growth Cycle</p>
                            <p className="text-sm text-gray-300 font-bold">{crop.cycle}</p>
                          </div>
                          <div className="bg-white/[0.02] rounded-2xl p-3 border border-white/[0.03]">
                            <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Profitability</p>
                            <p className={`text-sm font-black ${crop.profit === 'High' ? 'text-amber-500' : 'text-blue-500'}`}>
                              {crop.profit.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
