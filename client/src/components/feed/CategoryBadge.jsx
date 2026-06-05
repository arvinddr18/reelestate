import React from 'react';
import { motion } from 'framer-motion';

export const CATEGORIES = {
  SOCIAL: { label: 'SOCIAL', color: 'from-purple-500 to-indigo-500', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]', border: 'border-purple-500/30' },
  MARKETPLACE: { label: 'MARKETPLACE', color: 'from-cyan-500 to-blue-500', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]', border: 'border-cyan-500/30' },
  REAL_ESTATE: { label: 'REAL ESTATE', color: 'from-emerald-500 to-teal-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]', border: 'border-emerald-500/30' },
  SERVICES: { label: 'SERVICES', color: 'from-amber-500 to-orange-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]', border: 'border-amber-500/30' },
  EVENTS: { label: 'EVENTS', color: 'from-pink-500 to-rose-500', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.4)]', border: 'border-pink-500/30' }
};

export default function CategoryBadge({ type, isLive }) {
  const config = CATEGORIES[type] || CATEGORIES.SOCIAL;
  return (
    <div className="flex items-center gap-2">
      <motion.div whileHover={{ scale: 1.05 }} className={`px-3 py-1 rounded-full bg-gradient-to-r ${config.color} ${config.glow} text-white text-[10px] font-black tracking-widest uppercase flex items-center justify-center border ${config.border}`}>
        {config.label}
      </motion.div>
      {isLive && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-[9px] font-black tracking-wider text-emerald-400 uppercase">LIVE LINK</span>
        </div>
      )}
    </div>
  );
}