import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, Droplets, ThermometerSun, AlertTriangle, MapPin, Cloud, CloudLightning, Snowflake, Sunrise, Sunset, Activity, Sparkles } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import LoadingSkeleton from './ui/LoadingSkeleton';
import AnimatedCard from './ui/AnimatedCard';
import { fetchWeather as fetchWeatherAPI } from '../services/api';
import ErrorState from './ui/ErrorState';

const WEATHER_ICONS = {
  0: Sun, 1: Sun, 2: Cloud, 3: Cloud, 45: Cloud, 48: Cloud,
  51: CloudRain, 53: CloudRain, 55: CloudRain, 61: CloudRain, 63: CloudRain, 65: CloudRain,
  80: CloudRain, 81: CloudRain, 82: CloudRain, 95: CloudLightning, 96: CloudLightning, 99: CloudLightning,
};

const getAlert = (code, temp) => {
  if (code >= 51 && code <= 65) return "High rain chance — avoid pesticide spraying or outdoor drying.";
  if (code >= 80 && code <= 82) return "Heavy showers expected. Postpone fertilizer application.";
  if (temp > 40) return "Extreme heat alert. Ensure adequate irrigation during early morning.";
  if (temp < 5) return "Frost risk. Consider protective measures for sensitive crops.";
  return "Conditions are currently favorable for general farming activities.";
};

export default function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090, name: 'New Delhi' });

  const fetchWeather = async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch from our secure backend which uses the user's OpenWeather key
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
      <div className="min-h-screen p-6 md:p-10 max-w-2xl mx-auto space-y-6">
        <LoadingSkeleton className="h-8 w-1/3" />
        <LoadingSkeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <LoadingSkeleton className="h-32 rounded-2xl" />
          <LoadingSkeleton className="h-32 rounded-2xl" />
        </div>
        <LoadingSkeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <ErrorState message={error} onRetry={() => fetchWeather(location.lat, location.lon)} />
      </div>
    );
  }

  const { current, forecast, alerts, location: locationName } = weatherData;
  const CurrentIcon = current.icon ? () => <img src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`} className="w-full h-full" alt="weather" /> : Cloud;
  
  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'linear-gradient(160deg, #0d1a0e 0%, #0f1c1a 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10 space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Weather Dashboard</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={13} className="text-leaf-400" />
            <p className="text-sm text-gray-400">{locationName || 'Local Area'} (LAT: {location.lat.toFixed(2)}, LON: {location.lon.toFixed(2)})</p>
          </div>
        </div>

        {/* Current Weather Card */}
        <AnimatedCard className="p-6 relative overflow-hidden" hover={false}>
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 blur-3xl bg-leaf-500"></div>

          <div className="relative z-10">
            <p className="text-[10px] text-leaf-400 font-bold uppercase tracking-[0.2em] mb-4">Live Conditions</p>

            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-7xl font-extralight text-white leading-none mb-3">{Math.round(current.temp)}°</p>
                <div className="flex items-center gap-2">
                   <p className="text-leaf-300 font-medium text-lg capitalize">
                     {current.description}
                   </p>
                </div>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }} 
                transition={{ repeat: Infinity, duration: 8 }}
                className="w-24 h-24"
              >
                <CurrentIcon />
              </motion.div>
            </div>

            {/* Smart AI Advisory */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">AI Farming Alerts</span>
              </div>
              {alerts && alerts.map((alert, i) => (
                <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-3">
                  <SproutIcon size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-100 leading-relaxed">{alert}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>

        {/* Vital Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Droplets, label: 'Humidity', value: `${current.humidity}%`, color: 'text-blue-400' },
            { icon: Wind, label: 'Wind Speed', value: `${current.wind} km/h`, color: 'text-teal-400' },
            { icon: Sunrise, label: 'Sunrise', value: current.sunrise ? new Date(current.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A', color: 'text-yellow-400' },
            { icon: Sunset, label: 'Sunset', value: current.sunset ? new Date(current.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A', color: 'text-orange-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <AnimatedCard key={label} className="flex flex-col items-center gap-2 py-5 bg-white/[0.02]" hover={true}>
              <Icon size={20} className={color} />
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</span>
              <span className="text-sm font-bold text-white tracking-tight">{value}</span>
            </AnimatedCard>
          ))}
        </div>

        {/* 5-Day Forecast */}
        <h3 className="text-sm font-bold text-white mt-8 mb-4 uppercase tracking-[0.2em] opacity-60">5-Day Forecast</h3>
        <div className="flex flex-col gap-2">
          {forecast.map((day) => {
            const Icon = day.icon ? () => <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} className="w-8 h-8" alt="weather" /> : Cloud;
            const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });

            return (
              <AnimatedCard
                key={day.date}
                className="p-4 flex items-center justify-between bg-white/[0.01]"
              >
                <div className="w-24">
                  <span className="text-sm font-semibold text-gray-300">{dayName}</span>
                </div>
                
                <div className="flex items-center gap-3 flex-1 px-4">
                  <Icon />
                  <span className="text-xs text-gray-500 font-medium capitalize">
                    {day.description}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-white">{Math.round(day.temp_high || day.temp)}°</span>
                  <span className="text-sm font-medium text-gray-600">{Math.round(day.temp_low || (day.temp - 5))}°</span>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
        
        <p className="text-center text-[10px] text-gray-700 mt-8 mb-4">
          Powered by OpenWeatherMap & Gemini AI
        </p>
      </div>
    </div>
  );
}

function SproutIcon({ className, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 20h10" />
      <path d="M10 20c5.5-1.5 5.5-8.5 5.5-8.5" />
      <path d="M15.5 11.5c-3 0-5.5-2.5-5.5-5.5" />
      <path d="M10 20c-5.5-1.5-5.5-8.5-5.5-8.5" />
      <path d="M4.5 11.5c3 0 5.5-2.5 5.5-5.5" />
    </svg>
  );
}
