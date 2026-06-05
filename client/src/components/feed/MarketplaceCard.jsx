import React from 'react';
import { motion } from 'framer-motion';
import { IoMdMore } from 'react-icons/io';
import FeedCardWrapper from './FeedCardWrapper';
import CategoryBadge from './CategoryBadge';
import ActionButtons from './ActionButtons';

export default function MarketplaceCard({ data, onAction }) {
  const { user, product, size } = data;
  const isGridItem = size === 'small';

  return (
    <FeedCardWrapper variant="MARKETPLACE" size={size}>
      <div className="flex flex-col gap-4 w-full h-full justify-between">
        <div className="flex items-center justify-between w-full">
          <CategoryBadge type="MARKETPLACE" isLive={product.isLive} />
          <button className="text-gray-400 hover:text-white"><IoMdMore size={20} /></button>
        </div>

        <div className={`flex ${isGridItem ? 'flex-col' : 'flex-col md:flex-row'} gap-8 items-start justify-between w-full mt-2`}>
          <div className="flex flex-col flex-1 min-w-0 w-full">
            <div className="flex items-center gap-3 mb-5">
              <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-cyan-500/30" alt="" />
              <div className="flex flex-col min-w-0">
                <span className="text-white font-black text-base">{user.name}</span>
                <span className="text-gray-500 text-xs">@{user.handle} • {product.time} • {product.location}</span>
              </div>
            </div>
            
            <h3 className="text-white font-black text-2xl tracking-tight leading-snug">{product.title}</h3>
            {!isGridItem && <p className="text-gray-400 text-sm mt-3">{product.description}</p>}
            
            <div className="flex flex-col mt-4 mb-6">
              <span className="text-[#00F0FF] text-3xl font-black drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">{product.price}</span>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{product.paymentType || 'Negotiable'}</span>
            </div>

            {!isGridItem && <ActionButtons variant="MARKETPLACE" onAction={onAction} />}
          </div>

          {product.media && (
             <div className={`${isGridItem ? 'w-full aspect-video' : 'w-full md:w-[55%] aspect-video md:aspect-[4/3]'} rounded-[2rem] overflow-hidden relative shadow-[0_0_60px_rgba(6,182,212,0.2)] border-[3px] border-cyan-500/30 shrink-0`}>
               <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.7 }} src={product.media} className="w-full h-full object-cover" />
             </div>
          )}
        </div>

        {/* 🚨 EXACT TARGET DESIGN METADATA BAR */}
        {!isGridItem && product.metadata && (
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/5 mt-6 pt-6 w-full">
            {Object.entries(product.metadata).map(([key, val]) => (
              <div key={key} className="flex flex-col items-center justify-center py-2 md:py-0 px-2 min-w-0">
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                  {key === 'price' && '💰'} {key === 'condition' && '✨'} {key === 'location' && '📍'} {key === 'security' && '🛡️'} {key}
                </span>
                <span className={`text-sm font-bold truncate w-full text-center ${key === 'security' ? 'text-emerald-400 drop-shadow-[0_0_8px_#34d399]' : 'text-white'}`}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </FeedCardWrapper>
  );
}