import React from 'react';
import { motion } from 'framer-motion';
import { IoMdMore } from 'react-icons/io';
import FeedCardWrapper from './FeedCardWrapper';
import CategoryBadge from './CategoryBadge';

export default function PropertyCard({ data, onAction }) {
  const { user, property } = data;

  return (
    <FeedCardWrapper variant="REAL_ESTATE">
      <div className="flex flex-col gap-4 w-full h-full justify-between">
        <div className="flex items-center justify-between w-full">
          <CategoryBadge type="REAL_ESTATE" isLive={property.isLive} />
          <button className="text-gray-400 hover:text-white transition-colors">
            <IoMdMore size={20} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-5 items-start justify-between w-full h-full">
          <div className="flex flex-col flex-1 justify-between h-full min-w-0 w-full">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-emerald-500 to-teal-500">
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover border border-black" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-black text-sm truncate">{user.name}</span>
                  <span className="text-gray-500 text-xs truncate">{property.location}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <h3 className="text-white font-black text-lg md:text-xl tracking-tight">{property.title}</h3>
                <span className="text-[#34d399] text-xl font-black tracking-tight mt-1">{property.price}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => onAction?.('view')}
                className="flex-1 w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              >
                📥 SECURE CONNECT
              </motion.button>
            </div>
          </div>

          {property.media && (
            <div className="w-full md:w-[42%] aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden relative shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-emerald-500/20 shrink-0">
              <motion.img
                whileHover={{ scale: 1.06 }}
                src={property.media}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {property.specs && (
          <div className="grid grid-cols-4 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-center gap-1 w-full mt-2">
            {Object.entries(property.specs).map(([key, val]) => (
              <div key={key} className="flex flex-col items-center min-w-0">
                <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider truncate w-full">{key}</span>
                <span className={`text-xs font-bold truncate w-full ${key === 'security' ? 'text-emerald-400' : 'text-gray-200'}`}>
                  {key === 'security' ? `🛡️ ${val}` : val}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </FeedCardWrapper>
  );
}