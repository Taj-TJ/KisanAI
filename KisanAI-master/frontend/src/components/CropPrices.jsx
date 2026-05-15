import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, MapPin, Search, Loader2, RefreshCcw, Activity, Sparkles, AlertCircle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCard from './ui/AnimatedCard';
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
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState(null);

  // Debounce search
  useEffect(() => {
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

  const loadAI = async () => {
    setLoadingAI(true);
    try {
      const data = await fetchPriceAnalysis();
      setAiAnalysis(data.analysis);
    } catch (err) {
      setAiAnalysis('Market analysis temporarily unavailable.');
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    loadData();
    loadAI();
    
    // Refresh live data every 60 seconds
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
      <div className="min-h-screen flex items-center justify-center bg-[#0d1a0e]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-leaf-400 animate-spin mx-auto" />
          <p className="text-gray-400 font-light animate-pulse">Connecting to Mandi API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'linear-gradient(160deg, #0d1a0e 0%, #0f1c1a 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Market Prices</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={13} className="text-leaf-400" />
              <p className="text-sm text-gray-400 italic">Live Agmarknet Data</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
             <button 
               onClick={() => { loadData(); loadAI(); }}
               disabled={updating}
               className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/10 transition-all"
             >
                {updating ? <Loader2 size={10} className="animate-spin text-leaf-400" /> : <RefreshCcw size={10} className="text-leaf-400" />}
                {updating ? 'Updating...' : 'Live Feed'}
             </button>
             {lastUpdate && <p className="text-[9px] text-gray-600 font-mono mt-1">Refreshed: {lastUpdate.toLocaleTimeString()}</p>}
          </div>
        </div>

        {/* AI Market Insight Card */}
        <AnimatedCard className="p-5 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border-indigo-500/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Sparkles size={120} className="text-indigo-400 rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/20">
                <Sparkles size={16} className="text-indigo-400" />
              </div>
              <h3 className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">AI Market Insight</h3>
            </div>
            <div className="min-h-[60px]">
              {loadingAI ? (
                <div className="flex items-center gap-3 py-2">
                  <Loader2 size={16} className="animate-spin text-indigo-400" />
                  <p className="text-sm text-gray-500 font-light italic">Analyzing Mandi trends...</p>
                </div>
              ) : (
                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-sm text-gray-300 leading-relaxed font-light"
                >
                  {aiAnalysis || "Fetching expert market analysis..."}
                </motion.p>
              )}
            </div>
          </div>
        </AnimatedCard>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <AlertCircle className="text-red-400" size={18} />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Top Movers (Gainers/Losers) */}
        {!debouncedSearch && topGainer && topLoser && (
          <div className="grid grid-cols-2 gap-4">
            <AnimatedCard className="p-4 bg-emerald-900/10 border-emerald-500/20">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={12}/> Top Gainer</p>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-white font-bold text-sm truncate max-w-[80px]">{topGainer.crop}</h3>
                  <p className="text-[10px] text-gray-400 truncate max-w-[80px]">{topGainer.market}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold text-sm">+{topGainer.change}</p>
                  <p className="text-white font-mono text-xs">₹{topGainer.price}</p>
                </div>
              </div>
            </AnimatedCard>
            <AnimatedCard className="p-4 bg-red-900/10 border-red-500/20">
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingDown size={12}/> Top Loser</p>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-white font-bold text-sm truncate max-w-[80px]">{topLoser.crop}</h3>
                  <p className="text-[10px] text-gray-400 truncate max-w-[80px]">{topLoser.market}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold text-sm">-{topLoser.change}</p>
                  <p className="text-white font-mono text-xs">₹{topLoser.price}</p>
                </div>
              </div>
            </AnimatedCard>
          </div>
        )}

        {/* Search */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-4 transition-all focus-within:ring-1 focus-within:ring-leaf-500/50"
          style={{ background: 'rgba(26,46,27,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Search size={18} className="text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search crop or mandi..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-600 font-light"
          />
        </div>

        {/* Price Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((item, idx) => {
              const isUp = item.trend === 'up';
              const colorBase = isUp ? '#34d399' : '#f87171';
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={`${item.crop}-${item.market}`}
                >
                  <AnimatedCard className="p-5 overflow-hidden relative group">
                    <div className="absolute inset-0 top-1/2 opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity">
                      {item.history && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={item.history}>
                             <Area type="monotone" dataKey="value" stroke={colorBase} strokeWidth={2} fill={colorBase} fillOpacity={0.1} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="overflow-hidden">
                          <h3 className="text-lg font-bold text-white tracking-tight truncate pr-2" title={item.crop}>
                            {item.crop}
                          </h3>
                          <span className="text-[9px] text-gray-400 mt-2 inline-block px-2 py-1 rounded-md font-bold uppercase tracking-wider bg-white/5 border border-white/10 truncate max-w-full">
                            Variety: {item.variety}
                          </span>
                        </div>
                        <div className={`p-2 rounded-xl flex items-center justify-center flex-shrink-0 ${isUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                          {isUp ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Live Price</p>
                          <p className="text-xl font-black tracking-tight">
                            <NumberTicker value={item.price} />
                            <span className="text-xs font-normal text-gray-500 ml-1">/q</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isUp ? '+' : '-'}{item.change}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <MapPin size={10} className="text-leaf-600" />
                            <p className="text-[9px] text-gray-400 font-medium truncate max-w-[100px]">{item.market}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-3xl">
              <p className="text-gray-500">No market data available for this search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
