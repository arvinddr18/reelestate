import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiSearch, FiHome, FiCompass, FiPlus, FiMail, FiUser 
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import api from '../services/api';

const TABS = ['All', 'Food', 'Fitness', 'Travel'];

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('All');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts');
        const data = res.data?.data || res.data || [];
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const trendingPosts = useMemo(() => {
    return [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0)).slice(0, 5);
  }, [posts]);

  const forYouPosts = useMemo(() => {
    return posts.slice(5);
  }, [posts]);

  const resolveMediaUrl = (source) => {
    if (!source) return '';
    if (typeof source === 'object' && source.url) return source.url;
    const base = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';
    return source.startsWith('http') ? source : `${base}${source.startsWith('/') ? '' : '/'}${source}`;
  };

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#05070A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#00F0FF] rounded-full animate-spin shadow-[0_0_15px_#00F0FF]" />
      </div>
    );
  }

  return (
    // 👇 DARK THEME: Changed bg-white to bg-[#05070A] and text-black to text-white 👇
    <div className="h-[100dvh] w-full bg-[#05070A] flex flex-col overflow-hidden font-sans text-white relative">
      
      {/* ─── MAIN CONTENT SCROLL ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        
        {/* ─── 1. TOP HEADER ─── */}
        <div className="pt-12 px-5 bg-[#05070A]/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[22px] drop-shadow-[0_0_10px_rgba(255,100,0,0.8)]">🔥</span>
            <h1 className="text-[22px] font-extrabold tracking-tight text-white drop-shadow-md">Trending Today</h1>
          </div>

          {/* ─── 2. CATEGORY PILLS ─── */}
          {/* DARK THEME: Replaced gray backgrounds with frosted glass (bg-white/5) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-white/5 backdrop-blur-md rounded-full p-1 w-max border border-white/10 mb-2">
            {TABS.map((tab, index) => (
              <React.Fragment key={tab}>
                <button
                  onClick={() => setSelectedTab(tab)}
                  className={`px-5 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 ${
                    selectedTab === tab 
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.5)]' // Glowing active state
                    : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
                {/* Divider */}
                {index < TABS.length - 1 && selectedTab !== tab && selectedTab !== TABS[index + 1] && (
                  <div className="w-[1px] h-3 bg-white/20 mx-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ─── 3. TRENDING CAROUSEL (EXACT SIZES PRESERVED) ─── */}
        <div className="pl-5 py-3">
          <div className="flex items-start gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pr-5 pb-2">
            {trendingPosts.map((post, index) => {
              const isFirst = index === 0;
              return (
                <motion.div
                  key={post._id || index}
                  whileTap={{ scale: 0.98 }}
                  // EXACT STRUCTURE: Maintained exact sizing 190x280 and 120x170
                  className={`relative shrink-0 snap-center rounded-[24px] overflow-hidden cursor-pointer border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.8)] ${
                    isFirst ? 'w-[190px] h-[280px]' : 'w-[120px] h-[170px]'
                  }`}
                  onClick={() => navigate(`/posts/${post._id}`)}
                >
                  {/* # Rank Badge */}
                  <div className={`absolute top-3 left-3 z-20 ${isFirst ? 'text-white text-[38px] font-black leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] tracking-tighter' : 'bg-black/60 backdrop-blur-md text-white text-[14px] font-bold px-2.5 py-1 rounded-[10px] leading-none border border-white/10'}`}>
                    #{index + 1}
                  </div>

                  {/* +18% Trending Tag (Only on #1) */}
                  {isFirst && (
                    <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-gradient-to-r from-[#FF3B30] to-[#FF9500] text-white rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_5px_15px_rgba(255,59,48,0.5)]">
                      🔥 +18%
                    </div>
                  )}

                  <img 
                    src={resolveMediaUrl(post.images?.[0]?.url || post.image)} 
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="trending"
                  />

                  {/* DARK THEME: Heavier bottom gradient to match dark mode */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-black/20 to-transparent z-10 opacity-90" />
                  
                  {/* Likes Count */}
                  <div className={`absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-white ${isFirst ? 'font-bold text-[13px]' : 'font-semibold text-[10px]'}`}>
                    <FaHeart size={isFirst ? 14 : 10} className={isFirst ? "text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" : ""} />
                    <span className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]">{(post.likesCount / 1000000).toFixed(1)}M Likes</span>
                  </div>

                  {/* Neon Glow around #1 */}
                  {isFirst && (
                    <div className="absolute inset-0 border-[2px] border-[#00F0FF]/50 rounded-[24px] z-30 pointer-events-none shadow-[inset_0_0_20px_rgba(0,240,255,0.4)]" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── 4. FOR YOU GRID (EXACT 2-COLUMN TALL LAYOUT PRESERVED) ─── */}
        <div className="px-5 mt-2">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-[20px] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">🎬</span>
             <h2 className="text-[20px] font-extrabold tracking-tight text-white">For You</h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {forYouPosts.map((post, index) => (
              <motion.div
                key={post._id || index}
                onClick={() => navigate(`/posts/${post._id}`)}
                // EXACT STRUCTURE: Kept the exact h-[300px] height from the perfect layout
                className="relative w-full h-[300px] rounded-[20px] overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.6)] cursor-pointer active:scale-95 transition-transform border border-white/5"
              >
                <img 
                  src={resolveMediaUrl(post.images?.[0]?.url || post.image)} 
                  className="w-full h-full object-cover"
                  alt="feed"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-transparent opacity-90" />
                
                {/* ─── STACKED ICONS (EXACT POSITIONING PRESERVED) ─── */}
                <div className="absolute right-2 bottom-3 flex flex-col items-center gap-3 z-20">
                  
                  <div className="flex flex-col items-center gap-0.5">
                    {/* Kept the exact Pink/White heart logic from the mockup */}
                    <FaHeart size={22} className={index % 2 === 0 ? "text-[#FF4D67] drop-shadow-[0_2px_10px_rgba(255,77,103,0.8)]" : "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"} />
                    <span className="text-white text-[11px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {post.likesCount > 1000 ? `${(post.likesCount / 1000).toFixed(1)}K` : post.likesCount || 0}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    {/* Kept the exact White Comment Bubble */}
                    <div className="w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.6127 20 9.29749 19.6841 8.13677 19.123L3.81802 20.203C3.50424 20.2815 3.2045 19.9818 3.28299 19.668L4.36302 15.3492C3.8019 14.1885 3.486 12.8733 3.486 11.5C3.486 6.80558 7.51543 3 12.486 3C17.4566 3 21 6.80558 21 11.5Z" />
                        <circle cx="8" cy="11.5" r="1.5" fill="white" />
                        <circle cx="12" cy="11.5" r="1.5" fill="white" />
                        <circle cx="16" cy="11.5" r="1.5" fill="white" />
                      </svg>
                    </div>
                    <span className="text-white text-[11px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {post.comments?.length || 0}
                    </span>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── 5. ELEVATED BOTTOM NAVIGATION DOCK (DARK THEME) ─── */}
      <div className="absolute bottom-0 w-full bg-[#0A0E17]/95 backdrop-blur-2xl border-t border-white/5 px-6 py-2 pb-6 flex justify-between items-center z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <NavIcon icon={<FiHome size={24} />} label="Home" active />
        <NavIcon icon={<FiCompass size={24} />} label="Explore" />
        
        {/* EXACT STRUCTURE: Massive Elevated "+" Button, but now Glowing Premium */}
        <div className="relative -top-5 flex justify-center">
          <div className="absolute inset-0 bg-[#00F0FF] rounded-full blur-[10px] opacity-30" />
          <button className="w-[56px] h-[56px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] rounded-full flex items-center justify-center text-black shadow-[0_5px_15px_rgba(0,240,255,0.4)] active:scale-95 transition-transform z-10 border border-white/20">
            <FiPlus size={28} strokeWidth={3} />
          </button>
        </div>

        <NavIcon icon={<FiMail size={24} />} label="Messages" />
        <NavIcon icon={<FiUser size={24} />} label="Profile" />
      </div>

    </div>
  );
}

function NavIcon({ icon, label, active = false }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-1 transition-all ${active ? 'text-[#00F0FF]' : 'text-gray-500 hover:text-white'}`}>
      {active ? React.cloneElement(icon, { strokeWidth: 2.5 }) : icon}
      <span className={`text-[10px] ${active ? 'font-black tracking-wider text-[#00F0FF]' : 'font-semibold text-gray-500'}`}>{label}</span>
    </button>
  );
}