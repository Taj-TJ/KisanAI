import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import Weather from './components/Weather';
import CropPrices from './components/CropPrices';
import CropRecommend from './components/CropRecommend';

export default function App() {
  return (
    <div className="flex bg-[#0d1a0e] text-gray-100 min-h-screen">
      <Navbar />
      <main className="flex-1 w-full pt-14 pb-16 md:pt-0 md:pb-0 md:ml-20 lg:ml-64 transition-all duration-300">
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/prices" element={<CropPrices />} />
          <Route path="/recommend" element={<CropRecommend />} />
        </Routes>
      </main>
    </div>
  );
}
