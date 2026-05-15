import { motion } from 'framer-motion';

export default function GlowButton({ children, onClick, className = '', disabled = false, type = "button" }) {
  return (
    <motion.button
      type={type}
      whileHover={!disabled ? { scale: 1.02, boxShadow: '0 0 20px rgba(97, 166, 93, 0.4)' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        background: 'linear-gradient(135deg, #2d6e2a, #3f8a3b)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-10 transition-opacity" />
      {children}
    </motion.button>
  );
}
