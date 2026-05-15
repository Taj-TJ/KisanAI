import { motion } from 'framer-motion';

export default function AnimatedCard({ children, className = '', delay = 0, hover = true, style = {}, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -3, scale: 1.01 } : {}}
      className={`rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#1a2e1b]/80 to-[#0d1a0e]/90 backdrop-blur-sm shadow-xl ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
