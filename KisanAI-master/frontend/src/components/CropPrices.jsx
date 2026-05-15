import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, MapPin, Search, Loader2, RefreshCcw, Activity, AlertCircle, ChevronRight, BarChart3 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPrices, fetchPriceAnalysis } from '../services/api';

function NumberTicker({ value }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.5, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="inline-block"
    >
      ₹{value.toLocaleString()}
    </motion.span>
  );
}

export default function CropPrices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priceList, setPriceList] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState(null);

  // Debounce search
  useEffect(() => {
    document.title = "Market Trends | KisanAI";
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setUpdating(true);
    
    try {
      const data = await fetchPrices();
      setPriceList(data.prices);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch live market data.');
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  const loadAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const data = await fetchPriceAnalysis();
      setMarketAnalysis(data.analysis);
    } catch (err) {
      setMarketAnalysis('Market analysis temporarily unavailable.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    loadData();
    loadAnalysis();
    const interval = setInterval(() => loadData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return priceList.filter(p => 
      p.crop.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.market.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [priceList, debouncedSearch]);

  const topGainer = useMemo(() => 
    priceList.length ? [...priceList].sort((a,b) => (b.trend==='up'?b.change:0) - (a.trend==='up'?a.change:0))[0] : null
  , [priceList]);

  const topLoser = useMemo(() => 
    priceList.length ? [...priceList].sort((a,b) => (b.trend==='down'?b.change:0) - (a.trend==='down'?a.change:0))[0] : null
  , [priceList]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f0]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#1b5e20] animate-spin mx-auto" />
          <p className="text-[#41493e] font-bold text-[10px] uppercase tracking-widest animate-pulse">Accessing Mandi Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-['Manrope'] text-[#191d18] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#002c06] tracking-tight">Market Prices</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin size={12} className="text-[#1b5e20]" />
              <p className="text-xs text-[#41493e] font-medium opacity-60 italic">Live Agmarknet Data Feed</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                {lastUpdate && <p className="text-[9px] text-[#41493e] font-bold uppercase tracking-widest opacity-40">Refreshed: {lastUpdate.toLocaleTimeString()}</p>}
             </div>
             <button 
               onClick={() => { loadData(); loadAnalysis(); }}
               disabled={updating}
               className="flex items-center gap-2 bg-white border border-[#e1e4db] px-4 py-2 rounded-xl hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
             >
                {updating ? <Loader2 size={14} className="animate-spin text-[#1b5e20]" /> : <RefreshCcw size={14} className="text-[#1b5e20]" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-[#002c06]">Live Feed</span>
             </button>
          </div>
        </div>

        {/* Market Analysis Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#002c06] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group"
        >
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <BarChart3 size={18} className="text-[#95d78e]" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#95d78e]">Mandi Analysis</h3>
              </div>
              <div className="min-h-[40px]">
                {loadingAnalysis ? (
                  <div className="flex items-center gap-2 opacity-50">
                    <Loader2 size={12} className="animate-spin" />
                    <p className="text-xs italic">Syncing with regional price data...</p>
                  </div>
                ) : (
                  <p className="text-sm md:text-md font-medium text-white/90 leading-relaxed">
                    {marketAnalysis || "Regional price trends are being compiled for your local area."}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
               <span className="bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                 <TrendingUp size={10} className="text-[#95d78e]" /> High Momentum
               </span>
            </div>
          </div>
        </motion.div>

        {/* Top Movers (Gainers/Losers) */}
        {!debouncedSearch && topGainer && topLoser && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#e1e4db] p-4 rounded-xl flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#41493e] uppercase tracking-widest opacity-40 mb-0.5">Top Gainer</p>
                  <h4 className="text-sm font-bold text-[#002c06]">{topGainer.crop}</h4>
                  <p className="text-[10px] text-[#41493e]">{topGainer.market}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-600 font-black text-sm">+{topGainer.change}</p>
                <p className="text-xs font-bold text-[#002c06]">₹{topGainer.price}</p>
              </div>
            </div>

            <div className="bg-white border border-[#e1e4db] p-4 rounded-xl flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <TrendingDown size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#41493e] uppercase tracking-widest opacity-40 mb-0.5">Top Loser</p>
                  <h4 className="text-sm font-bold text-[#002c06]">{topLoser.crop}</h4>
                  <p className="text-[10px] text-[#41493e]">{topLoser.market}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-red-600 font-black text-sm">-{topLoser.change}</p>
                <p className="text-xs font-bold text-[#002c06]">₹{topLoser.price}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#41493e] opacity-40 group-focus-within:opacity-100 transition-opacity" />
          <input
            type="text"
            placeholder="Search crop or mandi station..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#e1e4db] rounded-xl pl-11 pr-4 py-3.5 text-sm text-[#191d18] placeholder:text-[#41493e]/40 focus:ring-1 focus:ring-[#1b5e20]/30 outline-none transition-all shadow-sm focus:shadow-md"
          />
        </div>

        {/* Market Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((item, idx) => {
              const isUp = item.trend === 'up';
              const colorBase = isUp ? '#1b5e20' : '#ba1a1a';
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  key={`${item.crop}-${item.market}`}
                >
                  <div className="bg-white border border-[#e1e4db] rounded-xl p-5 hover:shadow-lg transition-all relative overflow-hidden group">
                    {/* Visual Graph background */}
                    <div className="absolute inset-x-0 bottom-0 h-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                      {item.history && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={item.history}>
                             <Area type="monotone" dataKey="value" stroke={colorBase} strokeWidth={2} fill={colorBase} fillOpacity={1} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="relative z-10 space-y-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-md font-bold text-[#002c06]">{item.crop}</h3>
                          <p className="text-[9px] font-black text-[#41493e] uppercase tracking-widest opacity-40 mt-0.5">
                            {item.variety || 'Standard Variety'}
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} border border-current opacity-20`}>
                          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <h2 className="text-2xl font-black text-[#002c06] leading-none tracking-tight">
                            <NumberTicker value={item.price} />
                            <span className="text-[10px] font-bold text-[#41493e] opacity-40 ml-1">/q</span>
                          </h2>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-black ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isUp ? '↑' : '↓'} {item.change}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#f4f4f0] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 opacity-60">
                           <MapPin size={10} className="text-[#1b5e20]" />
                           <p className="text-[9px] font-bold text-[#41493e] truncate max-w-[120px]">{item.market}</p>
                        </div>
                        <ChevronRight size={12} className="text-[#41493e] opacity-20 group-hover:opacity-60 transition-all" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center bg-white/50 border border-dashed border-[#e1e4db] rounded-2xl">
              <Activity className="mx-auto mb-3 text-[#41493e] opacity-20" size={32} />
              <p className="text-[#41493e] font-bold text-[10px] uppercase tracking-widest opacity-60">No market listings found</p>
            </div>
          )}
        </div>
        
        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600" size={18} />
            <p className="text-xs font-bold text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
