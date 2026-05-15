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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('kisanai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setChecking(false);
  }, []);

  if (checking) return null;

  return (
    <div className="flex bg-[#f4f4f0] text-[#191d18] min-h-screen">
      <Toaster position="top-center" />
      
      {!user && <Auth onAuthSuccess={setUser} />}
      
      <Navbar 
        user={user} 
        onLogout={() => { setUser(null); localStorage.clear(); }} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
      />
      
      <main className={`flex-1 w-full pt-16 pb-16 md:pt-0 md:pb-0 transition-all duration-300 ${user ? (collapsed ? 'md:ml-20' : 'md:ml-64') : ''}`}>
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
