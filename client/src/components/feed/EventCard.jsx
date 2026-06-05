import React from 'react';
import { motion } from 'framer-motion';
import { IoMdMore } from 'react-icons/io';
import FeedCardWrapper from './FeedCardWrapper';
import CategoryBadge from './CategoryBadge';

export default function EventCard({ data, onAction }) {
  const { event } = data;

  return (
    <FeedCardWrapper variant="EVENTS">
      <div className="flex flex-col gap-4 w-full h-full justify-between">
        <div className="flex items-center justify-between w-full z-20">
          <CategoryBadge type="EVENTS" isLive={event.isLive} />
          <button className="text-white drop-shadow-md hover:text-pink-400 transition-colors">
            <IoMdMore size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2 w-full flex-1 justify-end relative rounded-2xl overflow-hidden min-h-[220px] border border-white/[0.04] mt-2">
          {event.media && (
            <img src={event.media} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="relative z-10 p-5 flex flex-col gap-1 w-full">
            <h3 className="text-white font-black text-xl md:text-2xl tracking-tight leading-tight drop-shadow-lg">{event.title}</h3>
            <p className="text-pink-400 font-mono text-xs font-bold tracking-wider mt-1">{event.schedule}</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onAction?.('rsvp')}
          className="w-full mt-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 border border-pink-500/30 text-pink-400 font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(236,72,153,0.1)]"
        >
          ✓ GOING
        </motion.button>
      </div>
    </FeedCardWrapper>
  );
}