import React from 'react';
import { motion } from 'framer-motion';

const GLOW_MAP = {
  SOCIAL: 'hover:border-purple-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  SALE_HUB: 'hover:border-emerald-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  RENTS: 'hover:border-teal-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  PGS: 'hover:border-cyan-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  SERVICES: 'hover:border-amber-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  JOBS: 'hover:border-blue-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  EDUCATION: 'hover:border-indigo-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  MARKETPLACE: 'hover:border-cyan-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  MOTORS: 'hover:border-red-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  FOOD: 'hover:border-orange-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  EVENTS: 'hover:border-pink-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  CINEMA: 'hover:border-rose-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  TRAVEL: 'hover:border-sky-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  FITNESS: 'hover:border-lime-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  SPORTS: 'hover:border-blue-400/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  FASHION: 'hover:border-fuchsia-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  BEAUTY: 'hover:border-pink-400/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  TECH: 'hover:border-slate-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  PETS: 'hover:border-yellow-500/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]',
  KIDS: 'hover:border-teal-400/50 shadow-[0_0_40px_rgba(0,0,0,0.6)]'
};

const BENTO_MAP = {
  small: 'col-span-1 min-h-[250px]',
  tall: 'col-span-1 row-span-2 min-h-[500px]',
  // 🚨 REMOVED md:max-h so the cards fit their content perfectly!
  large: 'col-span-1 md:col-span-2 xl:col-span-4 min-h-[200px]', 
};

export default function FeedCardWrapper({ variant, size = 'large', children }) {
  const glowClass = GLOW_MAP[variant] || GLOW_MAP.SOCIAL;
  const bentoClass = BENTO_MAP[size] || BENTO_MAP.large;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: '-20px' }} 
      transition={{ duration: 0.5 }} 
      whileHover={{ y: -4 }} 
      className={`${bentoClass} ${glowClass} relative w-full rounded-[1.5rem] md:rounded-[2.5rem] bg-[#0d121f]/90 border border-white/[0.08] backdrop-blur-2xl p-4 md:p-8 flex flex-col justify-between transition-all duration-500 overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none rounded-[1.5rem] md:rounded-[2.5rem]" />
      <div className="relative z-10 flex flex-col h-full justify-between gap-4 w-full">
        {children}
      </div>
    </motion.div>
  );
}