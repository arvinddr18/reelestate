import React from 'react';
import { MAIN_CATEGORIES, SALE_HUB_SUBS } from '../constants/categories';
import appLogo from '../assets/logo.nodexa.png';

export default function CategoryBar({ onFilterChange, activeCategory, activeSub, onSubSelect, onReelClick }) {
  return (
    <div className="w-full bg-brand-950 flex flex-col">
      
      {/* ── ROW 1: TOP BRANDING BAR ── */}
      <div className="flex items-center justify-between px-6 py-4 relative z-[70]">
        
        {/* Left: Sticker Logo */}
        <div className="relative w-16 h-16 flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:-rotate-3 cursor-pointer">
          <img 
            src={appLogo} 
            alt="App Logo" 
            className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(249,115,22,0.6)]" 
          />
        </div>

        {/* Center: App Name ONLY */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer">
          <h1 className="text-3xl font-black tracking-tighter leading-none drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">
            <span className="text-white">NODE</span>
            <span className="bg-gradient-to-r from-brand-500 to-yellow-400 bg-clip-text text-transparent">XA</span>
          </h1>
        </div>

        {/* Right: Empty spacer to balance the layout perfectly */}
        <div className="w-16 h-16" />
      </div>

      {/* ── ROW 2: NAVIGATION BAR ── */}
      <div className="flex items-center relative w-full">

        {/* LEFT: FIXED STORY CIRCLE (Now Professional Cool Blue/Cyan) */}
        <div 
          onClick={onReelClick} 
          className="sticky left-0 z-50 flex flex-col items-center min-w-[100px] px-2 py-4 cursor-pointer group bg-gradient-to-r from-brand-950 via-brand-950 to-transparent"
        >
          <div className="relative animate-in slide-in-from-left duration-700">
            {/* Professional Blue/Cyan Ring */}
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <div className="w-full h-full rounded-full bg-brand-950 flex items-center justify-center border-[3px] border-brand-950 text-white text-2xl group-active:scale-90 transition-transform">
                ⚡
              </div>
            </div>
            {/* Matching Cyan Notification Dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 border-[3px] border-brand-950 rounded-full shadow-lg animate-bounce" />
          </div>
          <span className="text-[10px] mt-3 font-black uppercase tracking-[0.2em] text-cyan-400 text-center drop-shadow-md">
            Stories
          </span>
        </div>

        {/* CENTER: SCROLLABLE CATEGORIES */}
        <div className="flex-1 flex items-center gap-6 px-4 py-4 overflow-x-auto no-scrollbar whitespace-nowrap">
          {MAIN_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <div 
                key={cat.name}
                onClick={() => onFilterChange(cat.name)}
                className="flex flex-col items-center min-w-[72px] cursor-pointer group"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 transform active:scale-90 ${
                  isActive 
                  ? 'bg-transparent border border-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]' 
                  : 'bg-brand-200/20 backdrop-blur-md border border-white/5 text-brand-100 shadow-sm'
                }`}>
                  {cat.icon}
                </div>
                <span className={`text-[10px] mt-3 font-black uppercase tracking-tighter drop-shadow-md transition-colors ${
                  isActive ? 'text-white' : 'text-brand-100/60'
                }`}>
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* RIGHT: FIXED PROFILE HUB */}
        <div 
          className="sticky right-0 z-50 flex flex-col items-center min-w-[100px] px-2 py-4 cursor-pointer group bg-gradient-to-l from-brand-950 via-brand-950 to-transparent"
        >
          <div className="relative animate-in slide-in-from-right duration-700">
            <div className="w-16 h-16 rounded-full p-[2px] bg-white/10 group-hover:bg-brand-500 transition-all duration-500 shadow-lg">
              <div className="w-full h-full rounded-full bg-brand-900 border-2 border-brand-950 flex items-center justify-center overflow-hidden">
                <span className="text-white font-black text-xl">A</span>
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-brand-950 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse" />
          </div>
          <span className="text-[10px] mt-3 font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors drop-shadow-md">
            Profile
          </span>
        </div>

      </div> {/* Ends Row 2 */}

      {/* ── ROW 3: SUB CATEGORIES (Only visible in Sale Hub) ── */}
      {activeCategory === 'Sale Hub' && (
        <div className="flex overflow-x-auto gap-3 px-6 pb-5 no-scrollbar animate-in slide-in-from-top duration-300 whitespace-nowrap">
          {SALE_HUB_SUBS.map((sub) => (
            <button
              key={sub}
              onClick={() => onSubSelect(sub)}
              className={`px-5 py-2 rounded-full text-[11px] font-black transition-all active:scale-95 ${
                activeSub === sub 
                ? 'bg-transparent border border-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]' 
                : 'bg-brand-200/40 text-brand-100 border border-white/5'
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