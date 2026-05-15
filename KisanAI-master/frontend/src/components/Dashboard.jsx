import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  AlertTriangle, 
  Sprout, 
  Droplets, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Plus, 
  Scan, 
  Calendar, 
  BarChart3, 
  Users,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, fetchDashboardAlerts, fetchDashboardTips } from '../services/api';

function Counter({ end, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span className="tabular-nums">{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function Dashboard() {
  const [tipIndex, setTipIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard | KisanAI";
    async function loadData() {
      setLoading(true);
      try {
        const [s, a, t] = await Promise.all([
          fetchDashboardStats().catch(() => ({ crops_analyzed: 0, markets_tracked: 0, active_farmers: 0, ai_accuracy: 0 })),
          fetchDashboardAlerts().catch(() => []),
          fetchDashboardTips().catch(() => [])
        ]);
        setStats(s);
        setAlerts(a);
        setTips(t);
      } catch (err) { 
        console.error('Dashboard load error:', err); 
      } finally { 
        setLoading(false); 
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (tips.length === 0) return;
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [tips]);

  const statItems = [
    { label: 'Crops Analyzed', value: stats?.crops_analyzed || 0, suffix: '+', icon: Sprout, color: 'text-leaf-600' },
    { label: 'Markets Tracked', value: stats?.markets_tracked || 0, icon: BarChart3, color: 'text-leaf-600' },
    { label: 'Active Farmers', value: stats?.active_farmers || 0, suffix: '+', icon: Users, color: 'text-leaf-600' },
    { label: 'Precision Score', value: stats?.ai_accuracy || 0, suffix: '%', icon: Zap, color: 'text-leaf-600' },
  ].filter(s => s.value >= 0);

  return (
    <div className="min-h-screen bg-[#faf9f5] font-['Manrope'] text-[#191d18] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8 space-y-6">
        
        {/* Welcome Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#002c06] tracking-tight">
              Welcome back, Kisan!
            </h2>
            <p className="text-md text-[#41493e] mt-1 font-medium">
              Your daily farm overview is ready.
            </p>
          </motion.div>
          
          <Link to="/recommend">
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="bg-[#1b5e20] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-md"
            >
              <Plus size={18} />
              <span>New Report</span>
            </motion.button>
          </Link>
        </section>

        {/* Metric Cards */}
        {statItems.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statItems.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-[#e1e4db] rounded-xl p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-1.5 rounded-lg bg-[#d9e6da] ${stat.color} transition-colors group-hover:bg-[#1b5e20] group-hover:text-white`}>
                    <stat.icon size={18} />
                  </div>
                </div>
                <p className="text-[9px] font-black text-[#41493e] uppercase tracking-[0.15em]">{stat.label}</p>
                <h3 className="text-2xl font-extrabold text-[#002c06] mt-1">
                  {loading ? <Loader2 className="animate-spin text-gray-200" size={18} /> : <Counter end={stat.value} suffix={stat.suffix} />}
                </h3>
              </motion.div>
            ))}
          </section>
        )}

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Smart Alerts & Daily Tip */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Smart Alerts */}
            <div className="bg-[#f4f4f0] border border-[#c0c9bb] rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold text-[#191d18]">Smart Alerts</h4>
                {!loading && alerts.length > 0 && (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[#d9e6da] px-3 py-1.5 rounded-full text-[#00450d]">
                    {alerts.length} Updates
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 opacity-30">
                    <Loader2 size={32} className="animate-spin mb-3" />
                    <p className="text-[10px] uppercase tracking-[0.15em] font-bold">Checking Status...</p>
                  </div>
                ) : alerts.length > 0 ? (
                  alerts.map((alert, i) => (
                    <motion.div 
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-4 p-5 rounded-xl border transition-all ${
                        alert.type === 'danger' ? 'bg-[#ffdad6] border-[#ba1a1a]/10' : 
                        alert.type === 'warning' ? 'bg-[#f8faf2] border-[#717a6d]/20' : 
                        'bg-white border-[#c0c9bb]/30'
                      }`}
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        alert.type === 'danger' ? 'bg-[#ba1a1a] text-white' : 
                        alert.type === 'warning' ? 'bg-[#1b5e20] text-white' : 
                        'bg-[#d9e6da] text-[#1b5e20]'
                      }`}>
                        {alert.type === 'danger' ? <AlertTriangle size={18} /> : <Droplets size={18} />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold mb-0.5 ${alert.type === 'danger' ? 'text-[#93000a]' : 'text-[#002c06]'}`}>
                          {alert.text}
                        </p>
                        <p className="text-[11px] text-[#41493e] opacity-70">
                          Recommended action is available in reports.
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#41493e] opacity-50 italic text-sm">
                    No urgent alerts today.
                  </div>
                )}
              </div>
            </div>

            {/* Daily Farming Tip */}
            <div className="relative overflow-hidden bg-[#002c06] text-white rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 group">
              <div className="flex-1 space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-[#90d689]">
                  <Lightbulb size={20} />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Daily Farming Tip</p>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tipIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <h5 className="text-lg md:text-2xl font-bold leading-snug">
                      {typeof tips[tipIndex] === 'string' ? tips[tipIndex] : (tips[tipIndex]?.text || "Optimize your crop health with advisory insights.")}
                    </h5>
                  </motion.div>
                </AnimatePresence>
                {!loading && tips.length > 1 && (
                  <div className="flex gap-1.5 mt-4">
                    {tips.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === tipIndex ? 'w-6 bg-[#90d689]' : 'w-1.5 bg-white/20'}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="w-24 h-24 flex-shrink-0 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Zap size={32} className="text-white opacity-20" />
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#ecefe6] border border-[#c0c9bb] rounded-2xl p-6">
              <h4 className="text-md font-bold text-[#191d18] mb-6">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/disease" className="group">
                  <div className="flex flex-col items-center justify-center p-5 bg-white border border-[#c0c9bb] rounded-2xl hover:bg-[#1b5e20] transition-all shadow-sm hover:shadow-lg">
                    <Scan size={24} className="text-[#1b5e20] group-hover:text-white transition-colors mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#41493e] group-hover:text-white/80 text-center">Scan Crop</span>
                  </div>
                </Link>
                <Link to="/recommend" className="group">
                  <div className="flex flex-col items-center justify-center p-5 bg-white border border-[#c0c9bb] rounded-2xl hover:bg-[#1b5e20] transition-all shadow-sm hover:shadow-lg">
                    <Calendar size={24} className="text-[#1b5e20] group-hover:text-white transition-colors mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#41493e] group-hover:text-white/80 text-center">Plan Crop</span>
                  </div>
                </Link>
                <Link to="/prices" className="group">
                  <div className="flex flex-col items-center justify-center p-5 bg-white border border-[#c0c9bb] rounded-2xl hover:bg-[#1b5e20] transition-all shadow-sm hover:shadow-lg">
                    <TrendingUp size={24} className="text-[#1b5e20] group-hover:text-white transition-colors mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#41493e] group-hover:text-white/80 text-center">Market Trends</span>
                  </div>
                </Link>
                <Link to="/chat" className="group">
                  <div className="flex flex-col items-center justify-center p-5 bg-white border border-[#c0c9bb] rounded-2xl hover:bg-[#1b5e20] transition-all shadow-sm hover:shadow-lg">
                    <ShieldCheck size={24} className="text-[#1b5e20] group-hover:text-white transition-colors mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#41493e] group-hover:text-white/80 text-center">Advisory Chat</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Environmental Snapshot */}
            <div className="bg-white border border-[#c0c9bb] rounded-2xl p-6 shadow-sm overflow-hidden relative">
              <h4 className="text-md font-bold text-[#191d18] mb-5">Market Pulse</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 bg-[#1b5e20] rounded-full" />
                      <div>
                        <p className="text-xs font-bold text-[#191d18]">Wheat</p>
                        <p className="text-[9px] text-[#41493e] uppercase font-bold tracking-widest">Regional</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#191d18]">₹2,275/q</p>
                      <p className="text-[10px] text-emerald-600 font-bold">+2.4%</p>
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 bg-[#d9e6da] rounded-full" />
                      <div>
                        <p className="text-xs font-bold text-[#191d18]">Mustard</p>
                        <p className="text-[9px] text-[#41493e] uppercase font-bold tracking-widest">Yard</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#191d18]">₹5,100/q</p>
                      <p className="text-[9px] text-red-500 font-bold">-0.8%</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
