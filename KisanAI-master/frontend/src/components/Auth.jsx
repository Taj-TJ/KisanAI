import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { login, signup } from '../services/api'
import toast from 'react-hot-toast'
import GlowButton from './ui/GlowButton'

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#112012]/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-leaf-400 to-leaf-700 flex items-center justify-center text-3xl shadow-lg shadow-leaf-500/20"
          >
            🌾
          </motion.div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome to KisanAI' : 'Join our Community'}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {isLogin ? 'Access your personal farming advisor' : 'Start your journey to better harvest'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex px-8 gap-4 mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-2 text-sm font-semibold transition-all border-b-2 ${isLogin ? 'text-leaf-400 border-leaf-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-2 text-sm font-semibold transition-all border-b-2 ${!isLogin ? 'text-leaf-400 border-leaf-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
          <AnimatePresence mode='wait'>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="text-[10px] uppercase tracking-widest font-bold text-leaf-500/80 px-1">Full Name</label>
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Arjun Singh"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-leaf-500/50 focus:bg-white/10 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-leaf-500/80 px-1">Email Address</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-leaf-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-leaf-500/80 px-1">Password</label>
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-leaf-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          <div className="pt-4">
            <GlowButton 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold tracking-wide"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </GlowButton>
          </div>

          <p className="text-center text-xs text-gray-500 pt-2">
            By continuing, you agree to our <span className="text-leaf-400 hover:underline cursor-pointer">Terms of Service</span>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
