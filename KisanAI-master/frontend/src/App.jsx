import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import Weather from './components/Weather';
import CropPrices from './components/CropPrices';
import CropRecommend from './components/CropRecommend';
import DiseaseDetect from './components/DiseaseDetect';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('kisanai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setChecking(false);
  }, []);

  if (checking) return null;

  return (
    <div className="flex bg-[#0d1a0e] text-gray-100 min-h-screen">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a2e1b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      {!user && <Auth onAuthSuccess={setUser} />}
      
      <Navbar user={user} onLogout={() => { setUser(null); localStorage.clear(); }} />
      
      <main className="flex-1 w-full pt-14 pb-16 md:pt-0 md:pb-0 md:ml-20 lg:ml-64 transition-all duration-300">
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/chat" element={<Chat user={user} />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/prices" element={<CropPrices />} />
          <Route path="/recommend" element={<CropRecommend />} />
          <Route path="/disease" element={<DiseaseDetect />} />
        </Routes>
      </main>
    </div>
  );
}
