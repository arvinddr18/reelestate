import React from 'react';
import { MAIN_CATEGORIES, SALE_HUB_SUBS } from '../constants/categories';

export default function CategoryBar({ onFilterChange, activeCategory, activeSub, onSubSelect }) {
  return (
    <div className="w-full bg-black border-b border-zinc-900 sticky top-0 z-50">
      {/* Main Categories Row */}
      <div className="flex overflow-x-auto gap-5 px-4 py-4 no-scrollbar">
        {MAIN_CATEGORIES.map((cat) => (
          <div 
            key={cat.name}
            onClick={() => onFilterChange(cat.name)}
            className="flex flex-col items-center min-w-[70px] cursor-pointer"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl border-2 transition-all ${
              activeCategory === cat.name 
              ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)] bg-zinc-800' 
              : 'border-zinc-700 bg-zinc-900'
            }`}>
              {cat.icon}
            </div>
            <span className={`text-[10px] mt-2 font-bold uppercase ${
              activeCategory === cat.name ? 'text-orange-500' : 'text-zinc-500'
            }`}>
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      {/* Sub Categories Row (Shows only for Sale Hub) */}
      {activeCategory === 'Sale Hub' && (
        <div className="flex overflow-x-auto gap-3 px-4 pb-4 no-scrollbar animate-in slide-in-from-top duration-300">
          {SALE_HUB_SUBS.map((sub) => (
            <button
              key={sub}
              onClick={() => onSubSelect(sub)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                activeSub === sub 
                ? 'bg-orange-500 text-white' 
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
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