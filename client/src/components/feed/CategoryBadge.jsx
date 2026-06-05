import React from 'react';
import { motion } from 'framer-motion';

export const CATEGORIES = {
  SOCIAL: { label: 'SOCIAL', color: 'from-purple-500 to-indigo-500', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]', border: 'border-purple-500/30' },
  SALE_HUB: { label: 'SALE HUB', color: 'from-emerald-500 to-teal-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]', border: 'border-emerald-500/30' },
  RENTS: { label: 'RENTS', color: 'from-teal-500 to-emerald-600', glow: 'shadow-[0_0_15px_rgba(20,184,166,0.4)]', border: 'border-teal-500/30' },
  PGS: { label: 'PGs & HOSTELS', color: 'from-cyan-500 to-teal-500', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]', border: 'border-cyan-500/30' },
  SERVICES: { label: 'SERVICES', color: 'from-amber-500 to-orange-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]', border: 'border-amber-500/30' },
  JOBS: { label: 'JOBS', color: 'from-blue-500 to-indigo-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]', border: 'border-blue-500/30' },
  EDUCATION: { label: 'EDUCATION', color: 'from-indigo-500 to-purple-500', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.4)]', border: 'border-indigo-500/30' },
  MARKETPLACE: { label: 'MARKETPLACE', color: 'from-cyan-500 to-blue-500', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]', border: 'border-cyan-500/30' },
  MOTORS: { label: 'MOTORS', color: 'from-red-500 to-rose-600', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]', border: 'border-red-500/30' },
  FOOD: { label: 'FOOD', color: 'from-orange-500 to-red-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]', border: 'border-orange-500/30' },
  EVENTS: { label: 'EVENTS', color: 'from-pink-500 to-rose-500', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.4)]', border: 'border-pink-500/30' },
  CINEMA: { label: 'CINEMA', color: 'from-rose-500 to-pink-600', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]', border: 'border-rose-500/30' },
  TRAVEL: { label: 'TRAVEL', color: 'from-sky-500 to-blue-500', glow: 'shadow-[0_0_15px_rgba(14,165,233,0.4)]', border: 'border-sky-500/30' },
  FITNESS: { label: 'FITNESS', color: 'from-lime-500 to-green-500', glow: 'shadow-[0_0_15px_rgba(132,204,22,0.4)]', border: 'border-lime-500/30' },
  SPORTS: { label: 'SPORTS', color: 'from-blue-400 to-indigo-500', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.4)]', border: 'border-blue-400/30' },
  FASHION: { label: 'FASHION', color: 'from-fuchsia-500 to-pink-500', glow: 'shadow-[0_0_15px_rgba(217,70,239,0.4)]', border: 'border-fuchsia-500/30' },
  BEAUTY: { label: 'BEAUTY', color: 'from-pink-400 to-rose-400', glow: 'shadow-[0_0_15px_rgba(244,114,182,0.4)]', border: 'border-pink-400/30' },
  TECH: { label: 'TECH', color: 'from-slate-500 to-gray-600', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.4)]', border: 'border-slate-500/30' },
  PETS: { label: 'PETS', color: 'from-yellow-500 to-amber-500', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]', border: 'border-yellow-500/30' },
  KIDS: { label: 'KIDS', color: 'from-teal-400 to-emerald-400', glow: 'shadow-[0_0_15px_rgba(45,212,191,0.4)]', border: 'border-teal-400/30' }
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