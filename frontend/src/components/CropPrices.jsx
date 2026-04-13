import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, MapPin, Search, Loader2, RefreshCcw } from 'lucide-react';

const INITIAL_PRICES = [
  { crop: 'Wheat',    variety: 'Lok-1',   price: 2650, trend: 'up',   change: 50,  market: 'Bhopal Mandi' },
  { crop: 'Rice',     variety: 'Basmati', price: 3800, trend: 'down', change: 120, market: 'Karnal Mandi' },
  { crop: 'Soybean',  variety: 'Yellow',  price: 4700, trend: 'up',   change: 15,  market: 'Indore Mandi' },
  { crop: 'Cotton',   variety: 'BT',      price: 7100, trend: 'up',   change: 200, market: 'Rajkot Mandi' },
  { crop: 'Mustard',  variety: 'Black',   price: 5200, trend: 'down', change: 40,  market: 'Jaipur Mandi' },
  { crop: 'Maize',    variety: 'Hybrid',  price: 2100, trend: 'up',   change: 10,  market: 'Patna Mandi' },
  { crop: 'Onion',    variety: 'Red',     price: 1800, trend: 'up',   change: 30,  market: 'Nashik Mandi' },
  { crop: 'Potato',   variety: 'Jyoti',   price: 1200, trend: 'down', change: 15,  market: 'Agra Mandi' },
];

export default function CropPrices() {
  const [search, setSearch] = useState('');
  const [priceList, setPriceList] = useState(INITIAL_PRICES);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [updating, setUpdating] = useState(false);

  // Simulate "Live" updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdating(true);
      setTimeout(() => {
        setPriceList(prev => prev.map(p => {
          const fluctuation = Math.floor(Math.random() * 20) - 10; // -10 to +10
          return {
            ...p,
            price: p.price + fluctuation,
            change: fluctuation,
            trend: fluctuation >= 0 ? 'up' : 'down'
          };
        }));
        setLastUpdate(new Date());
        setUpdating(false);
      }, 500);
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const filtered = priceList.filter(p => p.crop.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'linear-gradient(160deg, #0d1a0e 0%, #0f1c1a 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Market Prices</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={13} className="text-leaf-400" />
              <p className="text-sm text-gray-400 italic">Simulated Live Mandi Feeds</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
             <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {updating ? <Loader2 size={10} className="animate-spin" /> : <RefreshCcw size={10} />}
                {updating ? 'Updating...' : 'Live Feed'}
             </div>
             <p className="text-[10px] text-leaf-400 font-mono">L.U: {lastUpdate.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-6 transition-all focus-within:ring-1 focus-within:ring-leaf-500/50"
          style={{ background: 'rgba(26,46,27,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Search size={18} className="text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search crop in Mandi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-600 font-light"
          />
        </div>

        {/* Price Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={item.crop}
              className="rounded-2xl p-5 shadow-lg transition-all hover:translate-y-[-2px] animate-fade-in"
              style={{
                background: 'linear-gradient(135deg, rgba(26,46,27,0.8) 0%, rgba(13,26,14,0.9) 100%)',
                border: '1px solid rgba(255,255,255,0.07)'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{item.crop}</h3>
                  <span
                    className="text-[10px] text-gray-400 mt-1.5 inline-block px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {item.variety}
                  </span>
                </div>
                <div
                  className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                    item.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                  style={{ background: item.trend === 'up' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)' }}
                >
                  {item.trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
              </div>

              <div className="flex items-end justify-between mt-4">
                <div>
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Trading At</p>
                  <p className={`text-xl font-black tracking-tight transition-colors ${updating ? 'opacity-50' : 'opacity-100'}`}>
                    ₹{item.price.toLocaleString()}<span className="text-xs font-normal text-gray-500 ml-1">/q</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold ${item.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.trend === 'up' ? '+' : ''}{item.change}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <MapPin size={9} className="text-leaf-600" />
                    <p className="text-[10px] text-gray-500 font-medium">{item.market}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-center text-[10px] text-gray-700 mt-12 mb-4 leading-relaxed">
           Live feed simulates market fluctuations for demonstration purposes.<br/>
           Values updated via mock Ag-Market WebSocket.
        </p>
      </div>
    </div>
  );
}
