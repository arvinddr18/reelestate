import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { FiHeart, FiSearch, FiVideo, FiMessageSquare, FiUser, FiPlusCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../services/api';

const TABS = ['All', 'Food', 'Fitness', 'Travel', 'Tech'];

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
        // Handle potentially non-array data gracefully
        const postsArray = Array.isArray(data) ? data : (data.length > 0 ? Array.from(data) : []);
        setPosts(postsArray);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // 👇 LOGIC: Sorting posts dynamically for the "Trending" section (Bonus) 👇
  const sortedPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    // Sort by likes count (descending) as a proxy for trending
    return [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
  }, [posts]);

  // Utility to resolve media URL
  const resolveMediaUrl = (source) => {
    if (!source) return '';
    if (typeof source === 'object' && source.url) return source.url;
    if (source.startsWith('http') || source.startsWith('data:')) return source;
    const base = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';
    return `${base}${source.startsWith('/') ? '' : '/'}${source}`;
  };

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#05070A] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#0057FF] border-t-[#00F0FF] rounded-full animate-spin mb-4 shadow-[0_0_15px_#00F0FF]" />
        <span className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase animate-pulse">Establishing Uplink...</span>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#F5F7FA] relative flex flex-col overflow-hidden text-[#1C1C1E] font-sans">
      
      {/* ─── 1. DYNAMIC TOP NAVIGATION (iOS Mobile-First Style) ─── */}
      <div className="bg-white/90 backdrop-blur-xl pt-14 pb-4 px-6 flex justify-between items-center border-b border-gray-100 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 active:scale-95 transition-transform"
          >
            <IoMdArrowBack size={22} />
          </button>
          <div className="flex flex-col">
            <span className="text-gray-400 text-[11px] font-medium uppercase tracking-wider">Feed Explorer</span>
            <h1 className="text-gray-950 font-black text-2xl tracking-tighter leading-none">🔥 Trending Today</h1>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 active:scale-95 transition-transform">
          <FiSearch size={22} />
        </button>
      </div>

      {/* ─── MAIN VERTICAL SCROLL AREA (The Whole Dashboard) ─── */}
      <div className="flex-1 overflow-y-scroll pb-[100px] no-scrollbar">

        {/* ─── 2. CATEGORY TABS (Scrollable) ─── */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl py-4 border-b border-gray-100 z-40 px-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory">
            {TABS.map((tab) => (
              <button 
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`snap-center shrink-0 px-5 py-2.5 rounded-full font-extrabold text-[12px] uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  selectedTab === tab 
                    ? 'bg-gray-950 text-white scale-105 shadow-xl shadow-gray-950/20' 
                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {selectedTab === tab && <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_5px_#00F0FF]" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ─── 3. HORIZONTAL TRENDING REELS CAROUSEL (Top Priority) ─── */}
        <div className="py-6 px-6">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2 px-1">
            {sortedPosts.slice(0, 5).map((post, index) => {
              if (!post) return null;
              const isFirst = index === 0;
              const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);

              return (
                /* 👇 FIX: Added shrink-0 and min-w to prevent flex squash and ensure snap scrolling 👇 */
                <motion.div
                  key={post._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  onClick={() => navigate(`/posts/${post._id}`)}
                  className={`snap-center relative shrink-0 rounded-[28px] overflow-hidden cursor-pointer shadow-2xl transition-all duration-500 ease-out border-4 border-white ${
                    isFirst 
                      ? 'w-[320px] h-[480px] shadow-[#00F0FF]/20 border-[#00F0FF]/30' // The large featured card with glow
                      : 'w-[260px] h-[390px] shadow-gray-300/30'
                  }`}
                >
                  {/* Rank Badge (#1, #2, #3, etc.) */}
                  <div className={`absolute top-5 left-5 z-20 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-1.5 ${isFirst ? 'bg-[#00F0FF] text-black shadow-lg shadow-[#00F0FF]/40' : 'bg-gray-950 text-white'}`}>
                    {isFirst && <FiVideo size={14} />}
                    #{index + 1}
                  </div>

                  {/* 🔥 +18% Trending label on Top Reel */}
                  {isFirst && (
                    <div className="absolute top-5 right-5 z-20 px-3 py-1 bg-white text-black rounded-full font-extrabold text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-1">
                      <span>🔥</span> +18% Trending
                    </div>
                  )}
                  
                  {/* Media Content */}
                  <div className="absolute inset-0 w-full h-full pointer-events-none">
                     <img src={mediaUrl} alt="prop" className="w-full h-full object-cover" />
                  </div>

                  {/* Glassmorphism Info Overlay (Bottom) */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 z-10 pointer-events-none">
                    <h3 className="text-white font-extrabold text-[16px] leading-tight line-clamp-2 drop-shadow-md mb-2">
                       {post.title || 'Exclusive Modern Property'}
                    </h3>
                    
                    <div className="flex justify-between items-center gap-2">
                       <p className="text-[#00F0FF] font-black text-[11px] uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full drop-shadow-md">
                           ₹{(post.price / 10000000).toFixed(1)} Cr
                       </p>
                       <div className="flex items-center gap-1.5 text-white/90 font-bold text-[12px] drop-shadow-md">
                          <FiHeart className="fill-white" /> {(post.likesCount / 1000000).toFixed(1)}M
                       </div>
                    </div>
                  </div>
                  
                  {/* 👇 GLOW & SHADOW EFFECTS (Only on featured #1 card) 👇 */}
                  {isFirst && (
                    <div className="absolute -inset-1 rounded-[32px] border-4 border-[#00F0FF]/30 shadow-[0_0_60px_rgba(0,240,255,0.25)] pointer-events-none z-0" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── 4. "FOR YOU" SECTION (Below Trending Section) ─── */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4 mt-2">
            <div className="flex items-center gap-3">
                <FiVideo size={24} className="text-[#0057FF]" />
                <h2 className="text-gray-950 font-black text-xl tracking-tight leading-none">🎬 For You</h2>
            </div>
            <button className="text-gray-500 font-bold text-[11px] uppercase tracking-widest hover:text-[#0057FF]">See More</button>
          </div>
          
          {/* 👇 FIX: Vertical Scrolling 2-Column Grid 👇 */}
          <div className="grid grid-cols-2 gap-4">
            {posts.slice(5).map((post, index) => {
              if (!post) return null;
              const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
              
              return (
                <motion.div 
                  key={post._id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.5 }}
                  onClick={() => navigate(`/posts/${post._id}`)}
                  className="w-full h-[280px] rounded-[24px] overflow-hidden relative border border-gray-100 shadow-xl shadow-gray-200/50 cursor-pointer active:scale-95 transition-all"
                >
                  <img src={mediaUrl} alt="prop" className="w-full h-full object-cover" />
                  
                  {/* Floating Like Icon and Count */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-1 pointer-events-none">
                     <div className="flex items-center gap-1 text-white text-[11px] font-extrabold drop-shadow-md">
                         <FiHeart className="fill-white" size={12}/> {post.likesCount || 0}
                     </div>
                     <div className="text-white drop-shadow-md">
                        <FiMessageSquare size={14} />
                     </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ─── 5. ELEVATED BOTTOM NAVIGATION (iOS Native Style) ─── */}
      <div className="absolute bottom-6 left-6 right-6 h-[80px] bg-white/80 backdrop-blur-2xl rounded-full shadow-[0_15px_60px_rgba(0,0,0,0.15)] border border-gray-100 z-50 px-5 flex justify-between items-center transition-all duration-1000 ease-out delay-500">
        {[
          { icon: <FiVideo />, label: 'Feed' },
          { icon: <FiSearch />, label: 'Explore' },
          { icon: <FiPlusCircle />, label: 'Create', center: true },
          { icon: <FiMessageSquare />, label: 'Inbox' },
          { icon: <FiUser />, label: 'Profile' },
        ].map((item, index) => (
          <button 
            key={index} 
            className={`flex flex-col items-center justify-center gap-1.5 transition-all ${
              item.center 
                ? 'w-16 h-16 rounded-full bg-gray-950 text-[#00F0FF] shadow-xl shadow-gray-950/20 active:scale-90 -translate-y-4' 
                : 'text-gray-400 hover:text-gray-950'
            }`}
          >
            {React.cloneElement(item.icon, { size: item.center ? 30 : 22 })}
            {!item.center && <span className="text-[10px] font-bold tracking-wide">{item.label}</span>}
          </button>
        ))}
      </div>

    </div>
  );
}