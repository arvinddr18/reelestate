import React from 'react';
import { motion } from 'framer-motion';

const GLOW_MAP = {
  SOCIAL: 'hover:border-purple-500/40 shadow-[0_0_50px_rgba(0,0,0,0.4)]',
  MARKETPLACE: 'hover:border-cyan-500/40 shadow-[0_0_50px_rgba(0,0,0,0.4)]',
  REAL_ESTATE: 'hover:border-emerald-500/40 shadow-[0_0_50px_rgba(0,0,0,0.4)]',
  SERVICES: 'hover:border-amber-500/40 shadow-[0_0_50px_rgba(0,0,0,0.4)]',
  EVENTS: 'hover:border-pink-500/40 shadow-[0_0_50px_rgba(0,0,0,0.4)]'
};

export default function FeedCardWrapper({ variant, children }) {
  const glowClass = GLOW_MAP[variant] || GLOW_MAP.SOCIAL;
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6 }} whileHover={{ y: -4 }} className={`col-span-1 md:col-span-2 min-h-[300px] ${glowClass} relative w-full rounded-[2rem] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.06] backdrop-blur-xl p-5 md:p-6 flex flex-col justify-between transition-all duration-500 overflow-hidden group`}>
      <div className="relative z-10 flex flex-col h-full justify-between gap-4 w-full">
        {children}
      </div>
    </motion.div>
  );
}