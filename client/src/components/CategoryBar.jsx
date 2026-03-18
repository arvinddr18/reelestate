import React from 'react';
import { MAIN_CATEGORIES, SALE_HUB_SUBS } from '../constants/categories';
import appLogo from '../assets/logo.nodexa.png';

export default function CategoryBar({ onFilterChange, activeCategory, activeSub, onSubSelect, onReelClick }) {
  // ── MOCK USER STORIES FOR ROW 3 ──
  // Normally this would come from an API or context
  const USER_STORIES = [
    { id: 1, name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', hasNewStory: true },
    { id: 2, name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', hasNewStory: true },
    { id: 3, name: 'Charlie', avatar: 'https://randomuser.me/api/portraits/men/55.jpg', hasNewStory: false },
    { id: 4, name: 'David', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', hasNewStory: false },
    { id: 5, name: 'Eve', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', hasNewStory: false },
    { id: 6, name: 'Frank', avatar: 'https://randomuser.me/api/portraits/men/81.jpg', hasNewStory: false },
    { id: 7, name: 'Grace', avatar: 'https://randomuser.me/api/portraits/women/11.jpg', hasNewStory: false },
  ];

  return (
    // Exact Deep Navy Background from the screenshot
    <div className="w-full bg-[#0B0F19] flex flex-col border-b border-white/5">
      
      {/* ── ROW 1: TOP BRANDING BAR (Existing clean layout) ── */}
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


      {/* ── ROW 2: CATEGORIES BAR (Glow Circles from 2nd image) ── */}
      {/* We re-center this scroller below the branding bar */}
      <div className="w-full pt-1 pb-4 flex items-center justify-center">
        <div className="flex items-center gap-5 px-6 overflow-x-auto no-scrollbar whitespace-nowrap pb-2 pt-1">
          {MAIN_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <div 
                key={cat.name}
                onClick={() => onFilterChange(cat.name)}
                className="flex flex-col items-center relative min-w-[68px] cursor-pointer group pt-1"
              >
                {/* Ring Style (Cyan outline if active, Dark Grey if inactive) */}
                <div className={`w-16 h-16 rounded-full p-[2px] transition-all duration-300 transform group-hover:scale-105 group-active:scale-95 ${
                  isActive 
                  ? 'bg-gradient-to-b from-[#00F0FF] to-[#0057FF] shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                  : 'bg-[#1E2532]'
                }`}>
                  <div className={`w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center border-[3px] border-[#0B0F19] text-2xl transition-transform ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {cat.icon}
                  </div>
                </div>

                {/* Pill Badge Overlay (Overlapping the bottom) */}
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
      </div>


      {/* ── ROW 3: STORIES BAR (Separate list below categories) ── */}
      <div className="flex items-center relative w-full pt-2 pb-6 border-t border-white/5">

        {/* LEFT: FIXED STORY CIRCLE (lightning bolt, moving to index 0) */}
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
            
            {/* Pill Badge Overlay (Matches categories) */}
            <div className="absolute -bottom-2 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide border-2 border-[#0B0F19] bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white shadow-md z-10">
              Stories
            </div>
          </div>
        </div>

        {/* CENTER: SCROLLABLE USERS STORIES (Multiple avatars like Insta) */}
        <div className="flex-1 flex items-center gap-5 px-4 overflow-x-auto no-scrollbar whitespace-nowrap pb-1 pt-1">
          {USER_STORIES.map((story) => {
            const isActive = story.hasNewStory;
            return (
              <div 
                key={story.id}
                className="flex flex-col items-center relative min-w-[68px] cursor-pointer group pt-1"
              >
                {/* Ring Style (Cyan outline if active/unviewed) */}
                <div className={`w-16 h-16 rounded-full p-[2px] transition-all duration-300 transform group-hover:scale-105 group-active:scale-95 shadow-sm ${
                  isActive 
                  ? 'bg-gradient-to-b from-[#00F0FF] to-[#0057FF] shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                  : 'bg-[#1E2532]'
                }`}>
                  <div className={`w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center border-[3px] border-[#0B0F19] transition-transform ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    <img 
                      src={story.avatar} 
                      alt={story.name} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  </div>
                </div>

                {/* Pill Badge Overlay */}
                <div className={`absolute -bottom-2 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide border-2 border-[#0B0F19] shadow-md z-10 transition-all duration-300 ${
                  isActive 
                  ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white' 
                  : 'bg-[#151A25] text-gray-400 border-[#1E2532]'
                }`}>
                  {story.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: FIXED PROFILE HUB (Existing layout but integrated into the stories bar row) */}
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

      </div> {/* Ends Row 3 */}


      {/* ── ROW 4: SUB CATEGORIES (Only visible in Sale Hub) ── */}
      {activeCategory === 'Sale Hub' && (
        <div className="flex overflow-x-auto gap-3 px-6 pb-5 pt-3 no-scrollbar animate-in slide-in-from-top duration-300 whitespace-nowrap border-t border-white/5">
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