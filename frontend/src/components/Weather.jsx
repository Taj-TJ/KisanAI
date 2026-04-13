import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, Droplets, ThermometerSun, AlertTriangle, MapPin, Loader2, Cloud, CloudLightning, Snowflake } from 'lucide-react';

const WEATHER_ICONS = {
  0: Sun, // Clear sky
  1: Sun, // Mainly clear
  2: Cloud, // Partly cloudy
  3: Cloud, // Overcast
  45: Cloud, // Fog
  48: Cloud, // Depositing rime fog
  51: CloudRain, // Drizzle: Light
  53: CloudRain, // Drizzle: Moderate
  55: CloudRain, // Drizzle: Dense intensity
  61: CloudRain, // Rain: Slight
  63: CloudRain, // Rain: Moderate
  65: CloudRain, // Rain: Heavy intensity
  80: CloudRain, // Rain showers: Slight
  81: CloudRain, // Rain showers: Moderate
  82: CloudRain, // Rain showers: Violent
  95: CloudLightning, // Thunderstorm: Slight or moderate
  96: CloudLightning, // Thunderstorm with slight hail
  99: CloudLightning, // Thunderstorm with heavy hail
};

const getAlert = (code, temp) => {
  if (code >= 51 && code <= 65) return "High rain chance — avoid pesticide spraying or outdoor drying.";
  if (code >= 80 && code <= 82) return "Heavy showers expected. Postpone fertilizer application.";
  if (temp > 40) return "Extreme heat alert. Ensure adequate irrigation during early morning.";
  if (temp < 5) return "Frost risk. Consider protective measures for sensitive crops.";
  return null;
};

export default function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090, name: 'New Delhi' }); // Default to Delhi

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await response.json();
        
        if (data.current) {
          setWeatherData(data);
        } else {
          throw new Error('Invalid weather data');
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Failed to fetch real-time weather data.');
      } finally {
        setLoading(false);
      }
    };

    // Try to get user location
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
      <div className="min-h-screen flex items-center justify-center bg-[#0d1a0e]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-leaf-400 animate-spin" />
          <p className="text-leaf-400 font-medium">Fetching live weather data...</p>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1a0e] p-6 text-center">
        <div className="bg-red-900/20 border border-red-500/20 p-8 rounded-3xl max-w-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Oops!</h3>
          <p className="text-red-200 text-sm mb-6">{error || 'Something went wrong.'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { current, daily } = weatherData;
  const CurrentIcon = WEATHER_ICONS[current.weather_code] || Cloud;
  const currentAlert = getAlert(current.weather_code, current.temperature_2m);

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'linear-gradient(160deg, #0d1a0e 0%, #0f1c1a 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white tracking-tight">Weather Forecast</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={13} className="text-leaf-400" />
            <p className="text-sm text-gray-400">{location.name} (LAT: {location.lat.toFixed(2)}, LON: {location.lon.toFixed(2)})</p>
          </div>
        </div>

        {/* Current Weather Card */}
        <div
          className="rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden animate-fade-in"
          style={{ background: 'linear-gradient(135deg, #1a2e1b 0%, #0f2011 60%, #0d1a0e 100%)', border: '1px solid rgba(97,166,93,0.2)' }}
        >
          {/* Decorative Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: '#61a65d' }}></div>

          <div className="relative z-10">
            <p className="text-[10px] text-leaf-400 font-bold uppercase tracking-[0.2em] mb-4">Live Updates</p>

            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-7xl font-extralight text-white leading-none mb-3">{Math.round(current.temperature_2m)}°</p>
                <div className="flex items-center gap-2">
                   <CurrentIcon size={20} className="text-leaf-300" />
                   <p className="text-leaf-300 font-medium text-lg">
                     {current.weather_code === 0 ? 'Clear Sky' : current.weather_code < 3 ? 'Partly Cloudy' : 'Overcast'}
                   </p>
                </div>
              </div>
              <CurrentIcon size={80} className="text-leaf-400 opacity-90 drop-shadow-2xl" strokeWidth={1} />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Droplets,      label: 'Humidity',  value: `${current.relative_humidity_2m}%`, color: 'text-blue-400' },
                { icon: Wind,          label: 'Wind',      value: `${current.wind_speed_10m} km/h`,   color: 'text-teal-400' },
                { icon: ThermometerSun,label: 'Daily Hi/Lo', value: `${Math.round(daily.temperature_2m_max[0])}°/${Math.round(daily.temperature_2m_min[0])}°`, color: 'text-orange-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label}
                  className="flex flex-col items-center gap-1.5 rounded-2xl py-4 bg-white/[0.03] border border-white/[0.05]">
                  <Icon size={18} className={color} />
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{label}</span>
                  <span className="text-sm font-bold text-white tracking-tight">{value}</span>
                </div>
              ))}
            </div>

            {currentAlert && (
              <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200 leading-relaxed font-medium">{currentAlert}</p>
              </div>
            )}
          </div>
        </div>

        {/* 7-Day Forecast */}
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-[0.2em] opacity-60">Upcoming Forecast</h3>
        <div className="flex flex-col gap-3">
          {daily.time.slice(1).map((date, idx) => {
            const code = daily.weather_code[idx+1];
            const Icon = WEATHER_ICONS[code] || Cloud;
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            const isToday = idx === -1; // Not used but for logic

            return (
              <div
                key={date}
                className="rounded-2xl p-4 flex items-center justify-between border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="w-12">
                  <span className="text-sm font-semibold text-gray-400">{dayName}</span>
                </div>
                
                <div className="flex items-center gap-3 flex-1 px-4">
                  <Icon size={20} className="text-leaf-400 opacity-80" />
                  <span className="text-xs text-gray-500 font-medium">
                    {code === 0 ? 'Clear' : code < 3 ? 'Clear' : 'Overcast'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{Math.round(daily.temperature_2m_max[idx+1])}°</span>
                  <span className="text-sm font-medium text-gray-600">{Math.round(daily.temperature_2m_min[idx+1])}°</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <p className="text-center text-[10px] text-gray-700 mt-8 mb-4">
          Data provided by Open-Meteo API • Coordinates: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
        </p>
      </div>
    </div>
  );
}
