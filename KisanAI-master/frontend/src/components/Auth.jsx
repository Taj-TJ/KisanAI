import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { login, signup } from '../services/api'
import toast from 'react-hot-toast'

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Set dynamic page title
  useEffect(() => {
    document.title = isLogin ? "Login | KisanAI" : "Create Account | KisanAI";
  }, [isLogin]);

  // Load external fonts for this component to match provided design exactly
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password || (!isLogin && !name)) {
      return toast.error('Please fill all fields')
    }

    setLoading(true)
    try {
      const data = isLogin 
        ? await login(email, password)
        : await signup(email, password, name)
      
      localStorage.setItem('kisanai_token', data.token)
      localStorage.setItem('kisanai_user', JSON.stringify(data.user))
      toast.success(isLogin ? 'Welcome back!' : 'Account created!')
      onAuthSuccess(data.user)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col font-['Manrope'] bg-[#faf9f5] overflow-y-auto">
      {/* Background Imagery */}
      <div className="fixed inset-0 -z-10 bg-[#faf9f5] overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1b5e20]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#d9e6da]/10 rounded-full blur-3xl"></div>
        <img 
          className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIGDic1LYBrpJ4lFxmHQau8dDOp7SZuyrT2l_KApLRpWnomSGyqsOEUx6IAqDqZotZaceQvHt-JamCU_-IE-nTqNO-UXwGkCdU-6mGE_jj64zYg-Lzun6_66dxzPjWpZeoHva69BFF1ANhW_ja-W6tOi9tgNd9ppWW_sDgIdHIcCoKc4ZO8BPj7pkwYOa8-7z_tQLSrk_meVnCMlS47TBjNPlhPIrI0IEQgBhdMXni0EErtA46DlvCWCH5OiMAFWjDTObVHcdr5w" 
          alt="Farm landscape"
        />
      </div>

      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px] bg-white border border-[#c0c9bb] rounded-xl shadow-[0px_4px_24px_rgba(46,107,47,0.04)] overflow-hidden flex flex-col p-8"
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-[#1b5e20] rounded-lg flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#90d689] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>agriculture</span>
            </div>
            <h1 className="text-[20px] font-bold text-[#002c06] mb-2 leading-7">
              {isLogin ? 'Welcome back' : 'Join our Community'}
            </h1>
            <p className="text-[16px] text-[#41493e] leading-6">
              {isLogin ? 'Enter your credentials to access your advisory dashboard.' : 'Start your journey to better harvests.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode='wait'>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[12px] font-bold text-[#41493e] block uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-12 px-4 rounded-lg bg-[#faf9f5] border border-[#c0c9bb] focus:border-[#002c06] focus:ring-1 focus:ring-[#002c06] outline-none transition-all text-[16px]"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#41493e] block uppercase tracking-wider">Email Address</label>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full h-12 px-4 rounded-lg bg-[#faf9f5] border border-[#c0c9bb] focus:border-[#002c06] focus:ring-1 focus:ring-[#002c06] outline-none transition-all text-[16px]"
              />
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-bold text-[#41493e] block uppercase tracking-wider">Password</label>
                {isLogin && <a href="#" className="text-[12px] font-bold text-[#002c06] hover:underline">Forgot?</a>}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-lg bg-[#faf9f5] border border-[#c0c9bb] focus:border-[#002c06] focus:ring-1 focus:ring-[#002c06] outline-none transition-all text-[16px] pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#717a6d] hover:text-[#002c06] transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-[#002c06] text-white rounded-lg font-bold text-[16px] hover:bg-[#1b5e20] transition-all shadow-sm active:scale-[0.98]"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-4 border-t border-[#e1e4db] text-center">
            <p className="text-[14px] text-[#41493e]">
              {isLogin ? "Don't have an account?" : "Already have an account?"} 
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-[#002c06] font-bold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-8 px-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#faf9f5] border-t border-[#e1e4db]">
        <div className="text-[14px] text-[#41493e]">
          © 2024 AgriConsult Advisory Services. All rights reserved.
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-[14px] text-[#41493e] hover:text-[#002c06] transition-colors" href="#">Privacy Policy</a>
          <a className="text-[14px] text-[#41493e] hover:text-[#002c06] transition-colors" href="#">Terms of Service</a>
          <a className="text-[14px] text-[#41493e] hover:text-[#002c06] transition-colors" href="#">Cookie Policy</a>
          <a className="text-[14px] text-[#41493e] hover:text-[#002c06] transition-colors" href="#">Support</a>
        </div>
      </footer>
    </div>
  )
}
