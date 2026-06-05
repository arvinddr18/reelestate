import React from 'react';
import { motion } from 'framer-motion';

export default function ActionButtons({ variant, onAction }) {
  const isSocial = variant === 'SOCIAL';

  return (
    <div className="flex items-center gap-2 md:gap-3 mt-4 w-full">
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onAction?.('primary')}
        className={`flex-1 px-2 md:px-5 py-3 md:py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 ${
          isSocial
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]'
        }`}
      >
        {isSocial ? '✨ NOD BACK' : '🎯 INTERESTED'}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
        onClick={() => onAction?.('secondary')}
        className="flex-1 px-2 md:px-5 py-3 md:py-2.5 rounded-xl border border-white/10 bg-white/5 font-black text-[10px] md:text-xs text-gray-300 uppercase tracking-wider transition-all duration-300 flex items-center justify-center"
      >
        💬 SECURE QUERY
      </motion.button>
    </div>
  );
}