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

  // Split the remaining posts into pairs (chunks of 2) for the overlapping layout
  const forYouPairs = useMemo(() => {
    const remaining = posts.slice(5);
    const pairs = [];
    for (let i = 0; i < remaining.length; i += 2) {
      pairs.push([remaining[i], remaining[i + 1]]);
    }
    return pairs;
  }, [posts]);

  const resolveMediaUrl = (source) => {
    if (!source) return '';
    if (typeof source === 'object' && source.url) return source.url;
    const base = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';
    return source.startsWith('http') ? source : `${base}${source.startsWith('/') ? '' : '/'}${source}`;
  };

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#080B12] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-[#00F0FF] rounded-full animate-spin shadow-[0_0_15px_#00F0FF]" />
      </div>
    );
  }

  return (
    // 👇 CHANGED: Background matched to Nodexa Deep Space Blue (#080B12)
    <div className="h-[100dvh] w-full bg-[#080B12] flex flex-col overflow-hidden font-sans text-white relative">
      
      {/* ─── MAIN CONTENT SCROLL ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        
        {/* ─── 1. TOP HEADER (Dark Theme) ─── */}
        <div className="pt-12 px-6 pb-2 flex justify-between items-center bg-[#080B12]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-2 mb-2 mt-2">
            <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,100,0,0.8)]">🔥</span>
            <h1 className="text-[22px] font-black tracking-tight text-white drop-shadow-md">Trending Today</h1>
          </div>
        </div>
        
        {/* ─── 2. CATEGORY PILLS (Glass & Cyan Glow) ─── */}
        <div className="px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Container is now dark frosted glass */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-[#121826]/80 backdrop-blur-md rounded-full p-1 border border-white/5 w-max">
            {TABS.map((tab, index) => (
              <React.Fragment key={tab}>
                <button
                  onClick={() => setSelectedTab(tab)}
                  className={`px-5 py-1.5 rounded-full text-[12px] font-bold transition-all duration-300 ${
                    selectedTab === tab 
                    ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-105' 
                    : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
                {/* Divider between inactive tabs */}
                {index < TABS.length - 1 && selectedTab !== tab && selectedTab !== TABS[index + 1] && (
                  <div className="w-[1px] h-3 bg-white/10 mx-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ─── 3. TRENDING CAROUSEL (Structure exact, UI Darkened) ─── */}
        <div className="pl-6 py-4">
          <div className="flex items-start gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pr-6 pb-4">
            {trendingPosts.map((post, index) => {
              const isFirst = index === 0;
              return (
                <motion.div
                  key={post._id || index}
                  whileTap={{ scale: 0.98 }}
                  // Exact structure sizes, added dark borders and dark shadows
                  className={`relative shrink-0 snap-center rounded-[28px] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.8)] border border-white/5 transition-all cursor-pointer ${
                    isFirst ? 'w-[260px] h-[380px]' : 'w-[140px] h-[210px]'
                  }`}
                  onClick={() => navigate(`/posts/${post._id}`)}
                >
                  {/* # Rank Badge */}
                  <div className={`absolute top-4 left-4 z-20 rounded-full font-black flex items-center justify-center ${isFirst ? 'text-white text-[32px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]' : 'bg-[#121826]/80 border border-white/10 text-white text-[16px] px-3 py-1 backdrop-blur-md'}`}>
                    #{index + 1}
                  </div>

                  {isFirst && (
                    <div className="absolute top-4 right-4 z-20 px-2.5 py-1 bg-gradient-to-r from-[#FF3B30] to-[#FF9500] text-white rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-[0_5px_15px_rgba(255,59,48,0.5)]">
                      🔥 +18%
                    </div>
                  )}

                  <img 
                    src={resolveMediaUrl(post.images?.[0]?.url || post.image)} 
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="trending"
                  />

                  {/* Dark mode bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-transparent to-transparent z-10 opacity-90" />
                  
                  <div className={`absolute bottom-4 left-4 z-20 flex items-center gap-1.5 text-white ${isFirst ? 'font-bold text-[14px]' : 'font-semibold text-[11px]'}`}>
                    <FaHeart size={isFirst ? 16 : 12} className={isFirst ? 'text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''} />
                    <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{(post.likesCount / 1000000).toFixed(1)}M Likes</span>
                  </div>

                  {/* Cyan Glow around #1 */}
                  {isFirst && (
                    <div className="absolute inset-0 border-[2px] border-[#00F0FF]/40 rounded-[28px] z-30 pointer-events-none shadow-[inset_0_0_20px_rgba(0,240,255,0.3)]" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── 4. FOR YOU: OVERLAPPING COLLAGE FEED (Dark Theme) ─── */}
        <div className="px-6 mt-4 pb-8">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">🎬</span>
             <h2 className="text-[20px] font-black tracking-tight text-white">For You</h2>
          </div>

          <div className="flex flex-col gap-5">
            {forYouPairs.map((pair, index) => {
              const [post1, post2] = pair;
              
              return (
                // Exact same overlapping structure! 
                <div key={index} className="relative w-full h-[300px]">
                  
                  {/* ─── BACK CARD (Right Side) ─── */}
                  {post2 && (
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/posts/${post2._id}`)}
                      // Dark theme: added border-white/5 and dark shadow
                      className="absolute right-0 top-0 w-[52%] h-full rounded-[24px] overflow-hidden z-10 cursor-pointer shadow-[0_10px_20px_rgba(0,0,0,0.6)] border border-white/5 bg-[#121826]"
                    >
                      <img 
                        src={resolveMediaUrl(post2.images?.[0]?.url || post2.image)} 
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="feed-back"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-transparent to-transparent pointer-events-none opacity-80" />
                      
                      <div className="absolute right-3 bottom-4 flex flex-col items-center gap-3 z-20">
                        <div className="flex flex-col items-center gap-0.5">
                          <FaHeart size={18} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
                          <span className="text-white text-[11px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            {post2.likesCount || 0}
                          </span>
                        </div>
                        <div className="w-[30px] h-[30px] rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.6127 20 9.29749 19.6841 8.13677 19.123L3.81802 20.203C3.50424 20.2815 3.2045 19.9818 3.28299 19.668L4.36302 15.3492C3.8019 14.1885 3.486 12.8733 3.486 11.5C3.486 6.80558 7.51543 3 12.486 3C17.4566 3 21 6.80558 21 11.5Z" />
                            <circle cx="8" cy="11.5" r="1.5" fill="black" />
                            <circle cx="12" cy="11.5" r="1.5" fill="black" />
                            <circle cx="16" cy="11.5" r="1.5" fill="black" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ─── FRONT CARD (Left Side) ─── */}
                  {post1 && (
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/posts/${post1._id}`)}
                      // Dark theme heavy shadow to separate from back card
                      className="absolute left-0 top-0 w-[55%] h-full rounded-[24px] overflow-hidden z-20 cursor-pointer shadow-[15px_0_30px_rgba(0,0,0,0.8)] border border-white/5 bg-[#080B12]"
                    >
                      <img 
                        src={resolveMediaUrl(post1.images?.[0]?.url || post1.image)} 
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="feed-front"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-transparent to-transparent pointer-events-none opacity-80" />
                      
                      <div className="absolute right-3 bottom-4 flex flex-col items-center gap-3 z-20">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-[30px] h-[30px] rounded-full bg-[#FF4D67]/20 border border-[#FF4D67]/50 backdrop-blur-md flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                            <FaHeart size={14} className="text-[#FF4D67] drop-shadow-[0_0_8px_rgba(255,77,103,0.8)]" />
                          </div>
                          <span className="text-white text-[11px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            {post1.likesCount > 1000 ? `${(post1.likesCount / 1000).toFixed(1)}K` : post1.likesCount || 0}
                          </span>
                        </div>
                        <div className="w-[30px] h-[30px] rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-[0_5px_10px_rgba(0,0,0,0.5)]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.6127 20 9.29749 19.6841 8.13677 19.123L3.81802 20.203C3.50424 20.2815 3.2045 19.9818 3.28299 19.668L4.36302 15.3492C3.8019 14.1885 3.486 12.8733 3.486 11.5C3.486 6.80558 7.51543 3 12.486 3C17.4566 3 21 6.80558 21 11.5Z" />
                            <circle cx="8" cy="11.5" r="1.5" fill="black" />
                            <circle cx="12" cy="11.5" r="1.5" fill="black" />
                            <circle cx="16" cy="11.5" r="1.5" fill="black" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ─── 5. BOTTOM NAVIGATION DOCK (Dark Mode) ─── */}
      <div className="fixed bottom-0 w-full bg-[#080B12]/95 backdrop-blur-2xl border-t border-white/5 px-6 py-2 pb-6 flex justify-between items-center z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <NavIcon icon={<FiHome size={22} />} label="Home" active />
        <NavIcon icon={<FiCompass size={22} />} label="Explore" />
        
        {/* 👇 FIX: Glowing Nodexa Cyan Button ! 👇 */}
        <div className="relative -top-5 flex justify-center">
          <div className="absolute inset-0 bg-[#00F0FF] rounded-full blur-[10px] opacity-40" />
          <button className="w-[56px] h-[56px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] rounded-full flex items-center justify-center text-black shadow-[0_5px_15px_rgba(0,240,255,0.4)] active:scale-95 transition-transform z-10 border border-white/20">
            <FiPlus size={28} strokeWidth={2.5} />
          </button>
        </div>

        <NavIcon icon={<FiMail size={22} />} label="Messages" />
        <NavIcon icon={<FiUser size={22} />} label="Profile" />
      </div>

    </div>
  );
}

function NavIcon({ icon, label, active = false }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-1 transition-all ${active ? 'text-[#00F0FF]' : 'text-gray-500 hover:text-white'}`}>
      {active ? React.cloneElement(icon, { strokeWidth: 2.5 }) : icon}
      <span className={`text-[10px] ${active ? 'font-bold tracking-wide' : 'font-semibold'}`}>{label}</span>
    </button>
  );
}