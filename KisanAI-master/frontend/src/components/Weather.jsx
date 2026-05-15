import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  ThermometerSun, 
  AlertTriangle, 
  MapPin, 
  Cloud, 
  CloudLightning, 
  Snowflake, 
  Sunrise, 
  Sunset, 
  Activity, 
  Sparkles,
  ChevronRight,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWeather as fetchWeatherAPI } from '../services/api';
import ErrorState from './ui/ErrorState';

export default function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090, name: 'New Delhi' });

  const fetchWeather = async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeatherAPI(lat, lon);
      
      if (data.current) {
        setWeatherData(data);
      } else {
        throw new Error(data.error || 'Invalid weather data');
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch real-time weather data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Weather Forecast | KisanAI";
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude, name: 'Local Area' });
          fetchWeather(latitude, longitude);
        },
        (err) => {
          console.warn('Geolocation denied, using default.', err);
          fetchWeather(location.lat, location.lon);
        }
      );
    } else {
      fetchWeather(location.lat, location.lon);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] flex flex-col items-center justify-center p-6 space-y-4">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-[#1b5e20]/20 border-t-[#1b5e20]"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#41493e]">Syncing with Meteorological Satellites...</p>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center p-6">
        <ErrorState message={error} onRetry={() => fetchWeather(location.lat, location.lon)} />
      </div>
    );
  }

  const { current, forecast, alerts, location: locationName } = weatherData;
  const CurrentIcon = current.icon ? () => <img src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`} className="w-full h-full" alt="weather" /> : Cloud;

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-['Manrope'] text-[#191d18] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-[#002c06] mb-0.5">
              <MapPin size={18} />
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                {locationName || 'Local Area'}
              </h1>
            </div>
            <p className="text-xs text-[#41493e] font-medium opacity-80 flex items-center gap-2">
              <Navigation size={10} className="text-[#1b5e20]" />
              Precision weather tracking for optimal irrigation and soil management.
            </p>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#41493e] opacity-60">
             <span>LAT: {location.lat.toFixed(2)}</span>
             <span className="w-1 h-1 rounded-full bg-current opacity-30" />
             <span>LON: {location.lon.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Weather Card (Bento Style) */}
          <section className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#e1e4db] rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden h-full flex flex-col justify-between"
            >
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#d9e6da] rounded-full blur-[80px] opacity-40 -mr-24 -mt-24" />
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                  <span className="inline-block bg-[#d9e6da] text-[#002c06] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 border border-[#1b5e20]/10">
                    Live Conditions
                  </span>
                  
                  <div className="flex items-end gap-2">
                    <h2 className="text-6xl md:text-7xl font-extrabold text-[#002c06] leading-none">
                      {Math.round(current.temp)}°
                    </h2>
                    <div className="mb-2">
                      <p className="text-lg md:text-xl font-bold text-[#191d18] capitalize leading-none mb-1">
                        {current.description}
                      </p>
                      <p className="text-[10px] font-bold text-[#41493e] opacity-60 uppercase tracking-widest">
                        Feels like {Math.round(current.feels_like)}°
                      </p>
                    </div>
                  </div>
                </div>

                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="w-24 h-24 md:w-28 md:h-28 bg-[#f8faf2] rounded-2xl flex items-center justify-center p-3 border border-[#e1e4db]/50 shadow-inner"
                >
                  <CurrentIcon />
                </motion.div>
              </div>

              {/* Vitals Row */}
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 md:mt-12">
                {[
                  { icon: Droplets, label: 'Humidity', value: `${current.humidity}%`, color: 'text-blue-600' },
                  { icon: Wind, label: 'Wind Speed', value: `${current.wind} km/h`, color: 'text-emerald-600' },
                  { icon: Sunrise, label: 'Sunrise', value: current.sunrise ? new Date(current.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A', color: 'text-amber-600' },
                  { icon: Sunset, label: 'Sunset', value: current.sunset ? new Date(current.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A', color: 'text-orange-600' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#f8faf2] border border-[#e1e4db] p-4 rounded-xl flex flex-col gap-0.5 transition-all hover:border-[#1b5e20]/20 hover:shadow-sm">
                    <item.icon size={16} className={`${item.color} mb-1.5`} />
                    <span className="text-[9px] font-black text-[#41493e] uppercase tracking-widest opacity-60">{item.label}</span>
                    <span className="text-md font-extrabold text-[#002c06]">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* AI Advisory Section */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#002c06] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex-1 flex flex-col"
            >
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              
              <div className="relative z-10 flex items-center gap-3 mb-6">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Activity size={20} className="text-[#95d78e]" />
                </div>
                <h3 className="text-lg font-bold">Field Advisory</h3>
              </div>

              <div className="relative z-10 flex-1 space-y-4">
                {alerts && alerts.length > 0 ? alerts.map((alert, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="flex gap-4">
                       <div className="p-2 bg-white/10 rounded-lg h-fit">
                          {alert.toLowerCase().includes('rain') || alert.toLowerCase().includes('irrigation') ? <Droplets size={16} /> : <AlertTriangle size={16} />}
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-[#95d78e] mb-1">
                            {alert.toLowerCase().includes('rain') ? 'Irrigation Alert' : 'Field Advisory'}
                          </h4>
                          <p className="text-xs text-white/80 leading-relaxed font-medium">
                            {alert}
                          </p>
                       </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-white/40 italic text-sm py-8 text-center">
                    Conditions are stable. No urgent farming alerts for your region.
                  </div>
                )}
              </div>

              <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
                <button className="w-full py-3 bg-[#1b5e20] text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#2e6b2f] transition-all group">
                   Advisory Report
                   <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </section>

          {/* 5-Day Forecast Grid */}
          <section className="lg:col-span-12">
             <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-[#1b5e20]" />
                <h3 className="text-lg font-bold text-[#002c06]">5-Day Forecast</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {forecast.map((day, i) => {
                  const Icon = day.icon ? () => <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} className="w-full h-full" alt="weather" /> : Cloud;
                  const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });
                  
                  return (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (i * 0.05) }}
                      className="bg-white border border-[#e1e4db] p-4 rounded-2xl text-center hover:border-[#1b5e20] transition-all hover:shadow-sm group"
                    >
                      <p className="text-[9px] font-black text-[#41493e] uppercase tracking-widest mb-3 opacity-60">
                         {dayName}
                      </p>
                      <div className="w-12 h-12 mx-auto mb-3 p-1.5 bg-[#f8faf2] rounded-xl border border-[#e1e4db]/50 group-hover:bg-[#d9e6da] transition-colors">
                         <Icon />
                      </div>
                      <p className="text-[10px] font-bold text-[#191d18] capitalize mb-3 truncate">
                        {day.description}
                      </p>
                      <div className="flex justify-center items-end gap-2 pt-3 border-t border-[#e1e4db]/50">
                        <span className="text-md font-extrabold text-[#002c06]">{Math.round(day.temp_high || day.temp)}°</span>
                        <span className="text-xs font-bold text-[#41493e] opacity-40">{Math.round(day.temp_low || (day.temp - 5))}°</span>
                      </div>
                    </motion.div>
                  );
                })}
             </div>
          </section>
        </div>

        {/* Footer info */}
        <footer className="pt-8 border-t border-[#e1e4db] flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#41493e] opacity-40">
           <p>Powered by OpenWeatherMap & Meteorological Intelligence</p>
           <div className="flex gap-6">
              <span className="hover:text-[#1b5e20] cursor-pointer transition-colors">Data Integrity</span>
              <span className="hover:text-[#1b5e20] cursor-pointer transition-colors">Agri Sensors</span>
              <span className="hover:text-[#1b5e20] cursor-pointer transition-colors">Meteorological Node</span>
           </div>
        </footer>
      </div>
    </div>
  );
}
