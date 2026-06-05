import React from 'react';
import { motion } from 'framer-motion';
import { IoMdMore } from 'react-icons/io';
import FeedCardWrapper from './FeedCardWrapper';
import CategoryBadge from './CategoryBadge';

export default function ServiceCard({ data, onAction }) {
  const { user, service } = data;

  return (
    <FeedCardWrapper variant="SERVICES">
      <div className="flex flex-col gap-4 w-full h-full justify-between">
        <div className="flex items-center justify-between w-full">
          <CategoryBadge type="SERVICES" isLive={service.isLive} />
          <button className="text-gray-400 hover:text-white transition-colors">
            <IoMdMore size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3 w-full flex-1 justify-center py-2">
          <div className="flex items-center gap-3 mb-1">
            <img src={user.avatar} className="w-8 h-8 rounded-full border border-amber-500/50" alt="" />
            <span className="text-amber-400 font-mono text-xs font-bold tracking-wider">@{user.handle}</span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-white font-black text-lg md:text-xl tracking-tight leading-snug">{service.title}</h3>
            <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed">{service.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/[0.04] pt-4 w-full mt-2">
          <span className="text-white font-black text-lg">{service.rate}</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction?.('hire')}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            HIRE NODE
          </motion.button>
        </div>
      </div>
    </FeedCardWrapper>
  );
}