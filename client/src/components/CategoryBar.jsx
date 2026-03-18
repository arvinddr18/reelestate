// FORCE UPDATE TO SUPER APP
import React, { useState } from 'react';
import { MAIN_CATEGORIES, SALE_HUB_SUBS, RENT_SUBS } from '../../constants/categories';
import appLogo from '../../assets/logo.nodexa.png';

export default function CategoryBar({ onFilterChange, activeCategory, activeSub, onSubSelect, onReelClick }) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  // ── MOCK USER STORIES FOR ROW 3 ──
  const USER_STORIES = [
    { id: 1, name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', hasNewStory: true },
    { id: 2, name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', hasNewStory: true },
    { id: 3, name: 'Charlie', avatar: 'https://randomuser.me/api/portraits/men/55.jpg', hasNewStory: false },
    { id: 4, name: 'David', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', hasNewStory: false },
    { id: 5, name: 'Eve', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', hasNewStory: false },
  ];

  // We only show the first 7 categories in the main scroll bar
  const TOP_CATEGORIES = MAIN_CATEGORIES.slice(0, 7);

  const handleCategoryClick = (catName) => {
    onFilterChange(catName);
    setShowAllCategories(false); // Close the grid if it's open
  };

  return (
    <div className="w-full bg-[#0B0F19] flex flex-col border-b border-[#1E2532] relative z-40">
      
      {/* ── ROW 1: TOP BRANDING BAR ── */}
      <div className="flex items-center justify-between px-6 py-4 relative z-[70]">
        <div className="relative w-14 h-14 flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:-rotate-3 cursor-pointer">
          <img src={appLogo} alt="App Logo" className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,240,255,0.3)]" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer">
          <h1 className="text-3xl font-black tracking-tighter leading-none drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
            <span className="text-white">NODE</span>
            <span className="bg-gradient-to-r from-[#00F0FF] to-[#0057FF] bg-clip-text text-transparent">XA</span>
          </h1>
        </div>
        <div className="w-14 h-14" />
      </div>

      {/* ── ROW 2: CATEGORY TEXT PILLS (Smart Scroll) ── */}
      <div className="w-full pt-1 pb-4 flex items-center relative">
        <div className="flex items-center gap-3 px-6 overflow-x-auto no-scrollbar whitespace-nowrap w-full">
          
          {/* Default 'All' Button */}
          <button 
            onClick={() => handleCategoryClick('All')}
            className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 backdrop-blur-md active:scale-95 ${
              activeCategory === 'All' || !activeCategory
              ? 'bg-gradient-to-r from-[#0057FF]/20 to-[#00F0FF]/20 border border-[#00F0FF]/50 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
              : 'bg-[#151A25]/80 border border-[#1E2532] text-gray-400 hover:text-white hover:bg-[#1E2532]'
            }`}
          >
            All
          </button>

          {/* Top 7 Categories */}
          {TOP_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button 
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 backdrop-blur-md active:scale-95 ${
                  isActive 
                  ? 'bg-gradient-to-r from-[#0057FF]/20 to-[#00F0FF]/20 border border-[#00F0FF]/50 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                  : 'bg-[#151A25]/80 border border-[#1E2532] text-gray-400 hover:text-white hover:bg-[#1E2532]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          {/* ✨ The "More" Button that triggers the Grid ✨ */}
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className={`px-4 py-2.5 rounded-full text-[13px] font-black transition-all duration-300 backdrop-blur-md active:scale-95 flex items-center gap-2 ${
              showAllCategories 
              ? 'bg-[#00F0FF] text-[#0B0F19] shadow-[0_0_15px_rgba(0,240,255,0.5)]' 
              : 'bg-[#151A25] border border-[#1E2532] text-white hover:border-[#00F0FF]/50'
            }`}
          >
            ⊞ More
          </button>
        </div>

        {/* ── THE "ALL CATEGORIES" DROPDOWN GRID (Glassmorphism) ── */}
        {showAllCategories && (
          <div className="absolute top-full left-0 w-full bg-[#0B0F19]/95 backdrop-blur-3xl border-b border-[#1E2532] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[100] animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black tracking-widest uppercase text-sm">Explore Hubs</h3>
              <button onClick={() => setShowAllCategories(false)} className="text-gray-500 hover:text-red-400 transition-colors">✕ Close</button>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {MAIN_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 ${
                    activeCategory === cat.name 
                    ? 'bg-[#00F0FF]/10 border-[#00F0FF]/50 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                    : 'bg-[#151A25] border-[#1E2532] text-gray-400 hover:bg-[#1E2532] hover:text-white'
                  }`}
                >
                  <span className="text-2xl drop-shadow-md">{cat.icon}</span>
                  <span className="text-[10px] font-bold text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── ROW 3: STORIES BAR (Avatar Circles ONLY) ── */}
      <div className="flex items-center relative w-full pt-2 pb-6 border-t border-[#1E2532]">
        <div onClick={onReelClick} className="sticky left-0 z-50 flex flex-col items-center min-w-[90px] px-2 cursor-pointer group bg-gradient-to-r from-[#0B0F19] via-[#0B0F19] to-transparent">
          <div className="relative flex flex-col items-center">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-b from-[#00F0FF] to-[#0057FF] shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center border-[3px] border-[#0B0F19] text-white text-2xl overflow-hidden group-active:scale-95 transition-transform">
                ⚡
              </div>
            </div>
            <div className="absolute -bottom-2 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide border-2 border-[#0B0F19] bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white shadow-md z-10">
              Stories
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-5 px-4 overflow-x-auto no-scrollbar whitespace-nowrap pb-1 pt-1">
          {USER_STORIES.map((story) => {
            const isActive = story.hasNewStory;
            return (
              <div key={story.id} className="flex flex-col items-center relative min-w-[68px] cursor-pointer group pt-1">
                <div className={`w-16 h-16 rounded-full p-[2px] transition-all duration-300 transform group-hover:scale-105 group-active:scale-95 shadow-sm ${isActive ? 'bg-gradient-to-b from-[#00F0FF] to-[#0057FF] shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-[#1E2532]'}`}>
                  <div className={`w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center border-[3px] border-[#0B0F19] transition-transform ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    <img src={story.avatar} alt={story.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                <div className={`absolute -bottom-2 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide border-2 border-[#0B0F19] shadow-md z-10 transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white' : 'bg-[#151A25] text-gray-400 border-[#1E2532]'}`}>
                  {story.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ROW 4: SUB CATEGORIES (Dynamic based on Selection) ── */}
      {activeCategory === 'Sale Hub' && (
        <div className="flex overflow-x-auto gap-3 px-6 pb-5 pt-3 no-scrollbar animate-in slide-in-from-top duration-300 whitespace-nowrap border-t border-[#1E2532]">
          {SALE_HUB_SUBS.map((sub) => (
            <button key={sub} onClick={() => onSubSelect(sub)} className={`px-5 py-2 rounded-full text-[11px] font-bold transition-all active:scale-95 ${activeSub === sub ? 'bg-gradient-to-r from-[#F5A623] to-[#F76B1C] text-white shadow-[0_4px_10px_rgba(245,166,35,0.4)]' : 'bg-[#151A25] text-gray-400 border border-[#1E2532] hover:bg-[#1E2532]'}`}>
              {sub}
            </button>
          ))}
        </div>
      )}
      
      {activeCategory === 'Rents' && (
        <div className="flex overflow-x-auto gap-3 px-6 pb-5 pt-3 no-scrollbar animate-in slide-in-from-top duration-300 whitespace-nowrap border-t border-[#1E2532]">
          {RENT_SUBS.map((sub) => (
            <button key={sub} onClick={() => onSubSelect(sub)} className={`px-5 py-2 rounded-full text-[11px] font-bold transition-all active:scale-95 ${activeSub === sub ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white shadow-[0_4px_10px_rgba(0,240,255,0.4)]' : 'bg-[#151A25] text-gray-400 border border-[#1E2532] hover:bg-[#1E2532]'}`}>
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}