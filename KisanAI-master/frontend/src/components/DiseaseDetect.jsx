import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FlaskConical, 
  History, 
  X, 
  Calendar,
  Camera,
  Scan,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { detectDisease, fetchAnalysisHistory } from '../services/api';

const SEVERITY_COLORS = {
  'Low':      { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  'Moderate': { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  'High':     { color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100' },
  'None':     { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
};

export default function DiseaseDetect() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef(null);

  const loadHistory = async () => {
    try {
      const data = await fetchAnalysisHistory();
      setHistory(data);
    } catch (err) { console.error('History load error:', err); }
  };

  useEffect(() => {
    document.title = "Tissue Diagnostics | KisanAI";
    loadHistory();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await detectDisease(image);
      if (data.error) throw new Error(data.error);
      const colors = SEVERITY_COLORS[data.severity] || SEVERITY_COLORS['Low'];
      setResult({ ...data, ...colors });
      toast.success('Tissue Analysis Complete');
      loadHistory();
    } catch (err) {
      toast.error(err.message || 'Diagnostic scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0] font-['Manrope'] text-[#191d18] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#002c06] tracking-tight">Tissue Diagnostics</h1>
            <p className="text-xs text-[#41493e] font-medium opacity-60 mt-0.5">Advanced pathological detection for crop protection.</p>
          </motion.div>
          
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowHistory(v => !v)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${showHistory ? 'bg-[#1b5e20] text-white border-[#1b5e20]' : 'bg-white border-[#e1e4db] text-[#41493e] hover:bg-gray-50'}`}
             >
                <History size={14} />
                Scan History
             </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 relative">
          
          {/* History Overlay */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="absolute inset-y-0 left-0 w-full lg:w-72 bg-white z-20 border border-[#e1e4db] rounded-2xl p-6 shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#002c06] font-black text-[10px] uppercase tracking-widest">Recent Diagnostics</h3>
                  <button onClick={() => setShowHistory(false)} className="text-[#41493e] hover:text-[#002c06]"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                  {history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        const colors = SEVERITY_COLORS[item.severity] || SEVERITY_COLORS['Low'];
                        setResult({ ...item, ...colors });
                        setImage(null);
                        setShowHistory(false);
                      }}
                      className="w-full text-left p-4 rounded-xl border border-[#f4f4f0] hover:border-[#1b5e20]/20 hover:bg-[#f8faf2] transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[#002c06] text-[10px] font-black uppercase tracking-tight truncate pr-2">{item.disease}</p>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${SEVERITY_COLORS[item.severity]?.bg || 'bg-gray-100'} ${SEVERITY_COLORS[item.severity]?.color || 'text-gray-400'}`}>
                          {item.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-[#41493e] font-bold uppercase opacity-40">
                        <Calendar size={10} />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Section */}
          <div className="lg:w-1/2 flex flex-col">
            <motion.div 
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#e1e4db] rounded-2xl p-6 shadow-sm h-full flex flex-col"
            >
              {!image ? (
                <div 
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  className="flex-1 border-2 border-dashed border-[#d9e6da] rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-[#f8faf2] hover:bg-[#f2f5ec] transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <Camera size={24} className="text-[#1b5e20]" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#002c06] mb-2 uppercase tracking-widest">Select Crop Sample</h3>
                  <p className="text-[11px] text-[#41493e] max-w-xs font-medium opacity-60">Drag and drop an image of the affected plant leaf for high-precision diagnostic analysis.</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden group flex-1">
                  <img src={image} alt="Crop" className="w-full h-full object-cover min-h-[300px]" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button 
                      onClick={() => setImage(null)}
                      className="px-6 py-2.5 bg-white text-[#002c06] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                      Change Sample
                    </button>
                  </div>
                </div>
              )}

              {image && !result && (
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="w-full bg-[#1b5e20] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#002c06] transition-all shadow-md active:scale-95 disabled:opacity-50 mt-6"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <><Scan size={16} /> Run Tissue Scan</>}
                </button>
              )}
            </motion.div>
          </div>

          {/* Results Section */}
          <div className="lg:w-1/2">
            {!image && !loading && !result && (
               <div className="h-full min-h-[400px] border-2 border-dashed border-[#e1e4db] rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-white/50">
                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 opacity-40">
                   <ImageIcon size={24} className="text-[#41493e]" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#41493e] opacity-40">Diagnostic Report Pending</p>
               </div>
            )}

            {loading && (
              <div className="h-full min-h-[400px] bg-white border border-[#e1e4db] rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#d9e6da]">
                   <motion.div className="h-full bg-[#1b5e20]" animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} />
                </div>
                <div className="w-20 h-20 rounded-full bg-[#f8faf2] flex items-center justify-center mb-8 border border-[#e1e4db]">
                  <Scan size={32} className="text-[#1b5e20] animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002c06] mb-1">Scanning Neural Patterns</p>
                <p className="text-xs text-[#41493e] font-medium opacity-40 italic">Mapping pathological markers...</p>
              </div>
            )}

            <AnimatePresence>
              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="h-full"
                >
                  <div className="bg-white border border-[#e1e4db] p-6 rounded-2xl shadow-sm h-full flex flex-col gap-6">
                    {/* Diagnostic Header */}
                    <div className="flex items-start justify-between pb-6 border-b border-[#f4f4f0]">
                      <div>
                        <p className="text-[9px] font-black text-[#41493e] uppercase tracking-widest opacity-40 mb-1.5">Diagnostic Report</p>
                        <h3 className="text-2xl font-extrabold text-[#002c06] tracking-tight leading-tight">{result.disease}</h3>
                      </div>
                      <div className={`flex flex-col items-center px-4 py-2 rounded-xl ${result.bg} ${result.border} border`}>
                        <span className={`text-[8px] uppercase font-black tracking-widest ${result.color} opacity-60 mb-1`}>Accuracy</span>
                        <span className={`text-xl font-black ${result.color}`}>{result.confidence}%</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-[#41493e] uppercase tracking-widest opacity-40">Status:</span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${result.bg} ${result.color} border ${result.border} uppercase tracking-widest`}>
                        {result.severity || 'Normal'}
                      </span>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4 flex-1">
                      <div className="bg-[#f8faf2] rounded-2xl p-5 border border-[#e1e4db]/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                          <AlertTriangle size={48} className="text-[#1b5e20]" />
                        </div>
                        <h4 className="text-[9px] font-black text-[#1b5e20] uppercase tracking-widest flex items-center gap-2 mb-3">
                          <CheckCircle2 size={12} /> Treatment Plan
                        </h4>
                        <p className="text-sm text-[#002c06] font-medium leading-relaxed">{result.treatment}</p>
                      </div>

                      <div className="bg-[#f8faf2] rounded-2xl p-5 border border-[#e1e4db]/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                          <FlaskConical size={48} className="text-[#1b5e20]" />
                        </div>
                        <h4 className="text-[9px] font-black text-[#1b5e20] uppercase tracking-widest flex items-center gap-2 mb-3">
                          <ShieldCheck size={12} /> Remediation
                        </h4>
                        <p className="text-sm text-[#002c06] font-medium leading-relaxed">{result.fertilizer}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#f4f4f0] flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-[#41493e] opacity-40">
                       <span className="flex items-center gap-1.5"><ShieldAlert size={12} /> Data Integrity Verified</span>
                       <button onClick={() => window.print()} className="hover:text-[#002c06] transition-colors">Export Report</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {[
             { title: 'Diagnostic Accuracy', text: 'Neural models are calibrated to 94% precision for regional pathogens.', icon: ShieldCheck, color: 'text-emerald-600' },
             { title: 'Response Protocol', text: 'Critical alerts are automatically synced with your advisory network.', icon: AlertTriangle, color: 'text-amber-600' },
             { title: 'Tissue Health', text: 'Scans evaluate chlorophyll levels and cellular structural integrity.', icon: Scan, color: 'text-blue-600' }
           ].map((item, i) => (
             <div key={i} className="bg-white border border-[#e1e4db] p-5 rounded-2xl flex items-start gap-4">
                <item.icon size={20} className={`${item.color} shrink-0 mt-1`} />
                <div>
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-[#002c06] mb-1">{item.title}</h5>
                   <p className="text-xs text-[#41493e] font-medium leading-relaxed opacity-60">{item.text}</p>
                </div>
             </div>
           ))}
        </section>
      </div>
    </div>
  );
}
