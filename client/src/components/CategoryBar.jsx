import React from 'react';
import { MAIN_CATEGORIES, SALE_HUB_SUBS } from '../constants/categories';

export default function CategoryBar({ onFilterChange, activeCategory, activeSub, onSubSelect }) {
  return (
    /* Changed bg-black to bg-brand-950 and removed absolute positioning to work with the FeedPage flexbox */
    <div className="w-full bg-brand-950 border-b border-white/5">
      
      {/* Main Categories Row - Forced Horizontal Scroll */}
      <div className="flex items-center overflow-x-auto gap-6 px-6 py-5 no-scrollbar whitespace-nowrap">
        {MAIN_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <div 
              key={cat.name}
              onClick={() => onFilterChange(cat.name)}
              className="flex flex-col items-center min-w-[72px] cursor-pointer group"
            >
              {/* Icon Circle: Glass effect for inactive, Orange Glow for active */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 transform active:scale-90 ${
                isActive 
                ? 'bg-brand-500 border-2 border-brand-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] text-white' 
                : 'bg-brand-200/40 backdrop-blur-md border border-white/10 text-brand-100 group-hover:border-white/20'
              }`}>
                {cat.icon}
              </div>

              {/* Category Name */}
              <span className={`text-[10px] mt-3 font-black uppercase tracking-tighter transition-colors ${
                isActive ? 'text-brand-500' : 'text-brand-100/60'
              }`}>
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sub Categories Row (Shows for Sale Hub) - Pill style matching screenshot */}
      {activeCategory === 'Sale Hub' && (
        <div className="flex overflow-x-auto gap-3 px-6 pb-5 no-scrollbar animate-in slide-in-from-top duration-300 whitespace-nowrap">
          {SALE_HUB_SUBS.map((sub) => (
            <button
              key={sub}
              onClick={() => onSubSelect(sub)}
              className={`px-5 py-2 rounded-full text-[11px] font-black transition-all active:scale-95 ${
                activeSub === sub 
                ? 'bg-brand-500 text-white shadow-lg' 
                : 'bg-brand-200/60 text-brand-100 border border-white/5'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}