import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCard from './ui/AnimatedCard';
import GlowButton from './ui/GlowButton';

const MOCK_RESULTS = [
  {
    disease: 'Late Blight (Phytophthora infestans)',
    confidence: 94,
    severity: 'High',
    treatment: 'Apply fungicide containing chlorothalonil or copper. Remove and destroy infected plant parts immediately to prevent spread.',
    fertilizer: 'Reduce nitrogen application. Ensure adequate potassium and phosphorus levels to boost plant immunity.',
    color: 'text-red-500', bg: 'bg-red-500/10'
  },
  {
    disease: 'Powdery Mildew',
    confidence: 88,
    severity: 'Moderate',
    treatment: 'Apply sulfur-based fungicides. Improve air circulation by pruning and avoid overhead watering.',
    fertilizer: 'Avoid excess nitrogen which promotes susceptible new growth. Apply balanced NPK.',
    color: 'text-amber-500', bg: 'bg-amber-500/10'
  },
  {
    disease: 'Healthy Crop',
    confidence: 98,
    severity: 'None',
    treatment: 'Continue current agricultural practices. Plant shows no visible signs of pathogenic infection or nutrient deficiency.',
    fertilizer: 'Maintain standard fertilization schedule based on crop growth stage.',
    color: 'text-emerald-500', bg: 'bg-emerald-500/10'
  }
];

export default function DiseaseDetect() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setResult(null); // Reset previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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

  const analyzeImage = () => {
    if (!image) return;
    
    setLoading(true);
    setResult(null);
    
    // Simulate AI Processing time
    setTimeout(() => {
      // Pick a random mock result
      const randomResult = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
      setResult(randomResult);
      setLoading(false);
    }, 2500);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'linear-gradient(160deg, #0d1a0e 0%, #0f1c1a 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            Crop Disease Detection <ShieldAlert size={20} className="text-leaf-400" />
          </h2>
          <p className="text-sm text-gray-400 mt-1">Upload a photo of your crop leaf for instant AI diagnostics</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Upload Section */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <AnimatedCard className="p-6 h-full flex flex-col justify-center" hover={false}>
              
              {!image ? (
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-leaf-500/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-leaf-900/5 hover:bg-leaf-900/10 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                  />
                  <div className="w-16 h-16 rounded-full bg-leaf-500/20 flex items-center justify-center mb-4">
                    <Upload size={30} className="text-leaf-400" />
                  </div>
                  <h3 className="text-white font-bold mb-2">Upload Crop Image</h3>
                  <p className="text-xs text-gray-400 max-w-xs">Drag and drop an image of the affected plant leaf, or click to browse files.</p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden group">
                  <img src={image} alt="Crop" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={reset}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold backdrop-blur-md transition-all"
                    >
                      Choose Different Image
                    </button>
                  </div>
                </div>
              )}

              {image && !result && (
                <GlowButton
                  onClick={analyzeImage}
                  disabled={loading}
                  className="w-full py-4 text-sm font-bold text-white flex items-center justify-center mt-6"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      <span className="uppercase tracking-widest">Scanning Tissues...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 uppercase tracking-widest">
                      <Sparkles size={16} /> Run Diagnostics
                    </span>
                  )}
                </GlowButton>
              )}
            </AnimatedCard>
          </div>

          {/* Results Section */}
          <div className="lg:w-1/2">
            {!image && !loading && !result && (
               <div className="h-full min-h-[300px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-white/[0.02]">
                 <ImageIcon size={48} className="text-gray-600 mb-4 opacity-50" />
                 <p className="text-gray-500 text-sm">Upload an image to see the AI diagnostic report here.</p>
               </div>
            )}

            {loading && (
              <div className="h-full min-h-[300px] border border-leaf-500/20 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-leaf-900/10 relative overflow-hidden">
                <motion.div 
                   className="absolute top-0 left-0 right-0 h-1 bg-leaf-500"
                   animate={{ x: ['-100%', '100%'] }}
                   transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                />
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-leaf-500/20 flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}>
                      <svg className="w-16 h-16 text-leaf-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
                <p className="text-leaf-400 font-bold mt-6 uppercase tracking-widest text-sm animate-pulse">Running Neural Network</p>
                <p className="text-xs text-gray-500 mt-2">Analyzing pathological markers...</p>
              </div>
            )}

            <AnimatePresence>
              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full"
                >
                  <AnimatedCard className="p-6 h-full flex flex-col gap-6" hover={false}>
                    {/* Diagnostic Header */}
                    <div className="flex items-start justify-between pb-6 border-b border-white/5">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Diagnosis</p>
                        <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{result.disease}</h3>
                      </div>
                      <div className={`flex flex-col items-center px-4 py-2 rounded-xl ${result.bg} border border-current`}>
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${result.color} opacity-80 mb-1`}>Confidence</span>
                        <span className={`text-xl font-black ${result.color}`}>{result.confidence}%</span>
                      </div>
                    </div>

                    {/* Stats */}
                    {result.severity !== 'None' && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Severity Level:</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${result.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {result.severity.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="space-y-4 flex-1">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <h4 className="text-xs text-leaf-400 uppercase font-bold tracking-widest flex items-center gap-2 mb-2">
                          <AlertTriangle size={14} /> Treatment Plan
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-light">{result.treatment}</p>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <h4 className="text-xs text-blue-400 uppercase font-bold tracking-widest flex items-center gap-2 mb-2">
                          <FlaskConical size={14} /> Fertilizer Adjustment
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-light">{result.fertilizer}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                       <CheckCircle2 size={12} className="text-leaf-500" /> AI Diagnostic Complete
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
