import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, AlertCircle, Sprout, CloudRain, LineChart, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedCard from './ui/AnimatedCard';

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

const ALERTS = [
  { id: 1, type: 'warning', text: 'Heavy rainfall expected in next 48 hours. Secure harvested crops.', icon: CloudRain, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 2, type: 'danger', text: 'Pest outbreak (Fall Armyworm) reported in neighboring district.', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 3, type: 'success', text: 'Wheat prices are up by 5% today in your local Mandi.', icon: LineChart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

const TIPS = [
  "Apply neem oil spray in the early morning to prevent aphid infestations organically.",
  "Consider intercropping legumes with your main crop to naturally fix soil nitrogen.",
  "Deep ploughing during summer months helps in exposing soil-borne pathogens to solar heat.",
];

export default function Dashboard() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'linear-gradient(160deg, #0d1a0e 0%, #0f1c1a 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10 space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Welcome back, Kisan <Sprout size={28} className="text-leaf-400" />
          </h2>
          <p className="text-sm text-gray-400 mt-1">Here is your daily agricultural intelligence overview.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Crops Analyzed', value: 1250, suffix: '+', icon: ShieldCheck, color: 'text-emerald-400' },
            { label: 'Markets Tracked', value: 45, icon: LineChart, color: 'text-blue-400' },
            { label: 'Active Farmers', value: 8900, suffix: '+', icon: Zap, color: 'text-amber-400' },
            { label: 'AI Accuracy', value: 96, suffix: '%', icon: Sprout, color: 'text-leaf-400' },
          ].map((stat, i) => (
            <AnimatedCard key={i} className="p-5" hover={true}>
               <div className="flex justify-between items-start mb-2">
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</p>
                 <stat.icon size={16} className={stat.color} />
               </div>
               <p className="text-3xl font-black text-white mt-2">
                 <Counter end={stat.value} suffix={stat.suffix} />
               </p>
            </AnimatedCard>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Smart Alerts */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] opacity-60">Smart Alerts</h3>
            <AnimatedCard className="p-6 h-full flex flex-col gap-4" hover={false}>
              {ALERTS.map((alert) => (
                <div key={alert.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.bg} border border-current`}>
                     <alert.icon size={20} className={alert.color} />
                  </div>
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${alert.color}`}>
                      {alert.type}
                    </p>
                    <p className="text-sm text-gray-200 leading-relaxed font-medium">{alert.text}</p>
                  </div>
                </div>
              ))}
            </AnimatedCard>
          </div>

          {/* Daily Tip Widget & Quick Actions */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] opacity-60 mb-4">Daily AI Tip</h3>
              <AnimatedCard className="p-6 bg-gradient-to-br from-leaf-900/40 to-black/40 border-leaf-500/20 relative overflow-hidden" hover={false}>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-leaf-500/20 rounded-full blur-2xl"></div>
                <Lightbulb size={28} className="text-leaf-400 mb-4 relative z-10" />
                <div className="relative z-10 min-h-[80px]">
                   <motion.p 
                     key={tipIndex}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="text-sm text-gray-200 leading-relaxed"
                   >
                     {TIPS[tipIndex]}
                   </motion.p>
                </div>
                <div className="flex gap-1 mt-6 relative z-10">
                  {TIPS.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all ${i === tipIndex ? 'w-4 bg-leaf-400' : 'w-2 bg-white/20'}`} />
                  ))}
                </div>
              </AnimatedCard>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] opacity-60 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                 <Link to="/disease" className="group">
                   <AnimatedCard className="p-4 flex flex-col items-center text-center gap-2 border border-white/5 transition-all hover:bg-leaf-900/20 hover:border-leaf-500/30">
                     <ShieldCheck size={24} className="text-leaf-400 group-hover:scale-110 transition-transform" />
                     <span className="text-xs font-bold text-white">Scan Crop</span>
                   </AnimatedCard>
                 </Link>
                 <Link to="/recommend" className="group">
                   <AnimatedCard className="p-4 flex flex-col items-center text-center gap-2 border border-white/5 transition-all hover:bg-leaf-900/20 hover:border-leaf-500/30">
                     <Sprout size={24} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                     <span className="text-xs font-bold text-white">Plan Crop</span>
                   </AnimatedCard>
                 </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
