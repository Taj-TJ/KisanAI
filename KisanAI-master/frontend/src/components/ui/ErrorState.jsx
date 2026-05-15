import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 bg-red-900/10 border border-red-500/20 rounded-3xl text-center max-w-sm mx-auto"
    >
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-white font-semibold mb-2">Something went wrong</h3>
      <p className="text-red-200/70 text-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-bold transition-colors"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}
