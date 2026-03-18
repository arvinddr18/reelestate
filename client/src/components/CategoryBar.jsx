import React from 'react';
import { MAIN_CATEGORIES, SALE_HUB_SUBS } from '../constants/categories';
import appLogo from '../assets/logo.nodexa.png';

export default function CategoryBar({ onFilterChange, activeCategory, activeSub, onSubSelect, onReelClick }) {
  return (
    // Exact Deep Navy Background from the screenshot
    <div className="w-full bg-[#0B0F19] flex flex-col">
      
      {/* ── ROW 1: TOP BRANDING BAR ── */}
      <div className="flex items-center justify-between px-6 py-4 relative z-[70]">
        
        {/* Left: Sticker Logo */}
        <div className="relative w-14 h-14 flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:-rotate-3 cursor-pointer">
          <img 
            src={appLogo} 
            alt="App Logo" 
            className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,240,255,0.3)]" 
          />
        </div>

        {/* Center: App Name */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer">
          <h1 className="text-3xl font-black tracking-tighter leading-none drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
            <span className="text-white">NODE</span>
            <span className="bg-gradient-to-r from-[#00F0FF] to-[#0057FF] bg-clip-text text-transparent">XA</span>
          </h1>
        </div>

        {/* Right: Empty spacer */}
        <div className="w-14 h-14" />
      </div>

      {/* ── ROW 2: NAVIGATION BAR (The Glowing Cyan Rings) ── */}
      <div className="flex items-center relative w-full pt-2 pb-4">

        {/* LEFT: FIXED STORY CIRCLE */}
        <div 
          onClick={onReelClick} 
          className="sticky left-0 z-50 flex flex-col items-center min-w-[90px] px-2 cursor-pointer group bg-gradient-to-r from-[#0B0F19] via-[#0B0F19] to-transparent"
        >
          <div className="relative flex flex-col items-center">
            {/* Electric Cyan Glowing Ring */}
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-b from-[#00F0FF] to-[#0057FF] shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center border-[3px] border-[#0B0F19] text-white text-2xl overflow-hidden group-active:scale-95 transition-transform">
                ⚡
              </div>
            </div>
            
            {/* Pill Badge Overlay (Matches your screenshot exactly) */}
            <div className="absolute -bottom-2 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide border-2 border-[#0B0F19] bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white shadow-md z-10">
              Stories
            </div>
          </div>
        </div>

        {/* CENTER: SCROLLABLE CATEGORIES */}
        <div className="flex-1 flex items-center gap-5 px-4 overflow-x-auto no-scrollbar whitespace-nowrap pb-2 pt-1">
          {MAIN_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <div 
                key={cat.name}
                onClick={() => onFilterChange(cat.name)}
                className="flex flex-col items-center relative min-w-[68px] cursor-pointer group"
              >
                {/* Ring Style (Cyan if active, Dark Grey if inactive) */}
                <div className={`w-16 h-16 rounded-full p-[2px] transition-all duration-300 ${
                  isActive 
                  ? 'bg-gradient-to-b from-[#00F0FF] to-[#0057FF] shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                  : 'bg-[#1E2532] group-hover:bg-[#2A3441]'
                }`}>
                  <div className={`w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center border-[3px] border-[#0B0F19] text-2xl overflow-hidden transition-transform group-active:scale-95 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {cat.icon}
                  </div>
                </div>

                {/* Pill Badge Overlay */}
                <div className={`absolute -bottom-2 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide border-2 border-[#0B0F19] shadow-md z-10 transition-all duration-300 ${
                  isActive 
                  ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white' 
                  : 'bg-[#151A25] text-gray-400 border-[#1E2532]'
                }`}>
                  {cat.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: FIXED PROFILE HUB */}
        <div 
          className="sticky right-0 z-50 flex flex-col items-center min-w-[90px] px-2 cursor-pointer group bg-gradient-to-l from-[#0B0F19] via-[#0B0F19] to-transparent"
        >
          <div className="relative flex flex-col items-center">
            {/* Standard Dark Ring */}
            <div className="w-16 h-16 rounded-full p-[2px] bg-[#1E2532] group-hover:bg-[#00F0FF] transition-all duration-500 shadow-lg">
              <div className="w-full h-full rounded-full bg-[#151A25] border-[3px] border-[#0B0F19] flex items-center justify-center overflow-hidden">
                <span className="text-white font-black text-xl">A</span>
              </div>
            </div>
            
            {/* Notification Dot */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-[#0B0F19] rounded-full shadow-[0_0_8px_#ef4444]" />

            {/* Pill Badge Overlay */}
            <div className="absolute -bottom-2 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide border-2 border-[#0B0F19] bg-[#151A25] text-gray-400 shadow-md z-10 group-hover:text-white transition-colors">
              Profile
            </div>
          </div>
        </div>

      </div> {/* Ends Row 2 */}

      {/* ── ROW 3: SUB CATEGORIES (Matches the Gold/Orange gradient from the image) ── */}
      {activeCategory === 'Sale Hub' && (
        <div className="flex overflow-x-auto gap-3 px-6 pb-5 pt-3 no-scrollbar animate-in slide-in-from-top duration-300 whitespace-nowrap">
          {SALE_HUB_SUBS.map((sub) => (
            <button
              key={sub}
              onClick={() => onSubSelect(sub)}
              className={`px-5 py-2 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                activeSub === sub 
                ? 'bg-gradient-to-r from-[#F5A623] to-[#F76B1C] text-white shadow-[0_4px_10px_rgba(245,166,35,0.4)]' 
                : 'bg-[#151A25] text-gray-400 border border-[#1E2532] hover:bg-[#1E2532]'
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