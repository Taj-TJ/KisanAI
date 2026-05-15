import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/[0.05] rounded-3xl bg-white/[0.02]"
    >
      <div className="w-20 h-20 rounded-full bg-leaf-900/20 flex items-center justify-center mb-6">
        <Icon size={40} className="text-leaf-600" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">{description}</p>
    </motion.div>
  );
}
