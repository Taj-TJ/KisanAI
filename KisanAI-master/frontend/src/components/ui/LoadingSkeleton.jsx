import { motion } from 'framer-motion';

export default function LoadingSkeleton({ className = '', style = {} }) {
  return (
    <motion.div
      className={`bg-white/5 rounded-xl overflow-hidden relative ${className}`}
      style={style}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      />
    </motion.div>
  );
}
