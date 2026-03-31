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
      <div className="h-[100dvh] w-full bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-white flex flex-col overflow-hidden font-sans text-black relative">
      
      {/* ─── MAIN CONTENT SCROLL ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        
        {/* ─── 1. TOP HEADER ─── */}
        <div className="pt-12 px-5 bg-white">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[22px]">🔥</span>
            <h1 className="text-[22px] font-extrabold tracking-tight text-black">Trending Today</h1>
          </div>

          {/* ─── 2. CATEGORY PILLS ─── */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-gray-50/50 rounded-full p-1 w-max border border-gray-100">
            {TABS.map((tab, index) => (
              <React.Fragment key={tab}>
                <button
                  onClick={() => setSelectedTab(tab)}
                  className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                    selectedTab === tab 
                    ? 'bg-[#1C1C1E] text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
                {/* Divider between inactive tabs */}
                {index < TABS.length - 1 && selectedTab !== tab && selectedTab !== TABS[index + 1] && (
                  <div className="w-[1px] h-3 bg-gray-300 mx-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ─── 3. TRENDING CAROUSEL (Smaller Proportions to match mockup) ─── */}
        <div className="pl-5 py-5">
          {/* items-start aligns the smaller cards to the top of the big card perfectly */}
          <div className="flex items-start gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pr-5 pb-2">
            {trendingPosts.map((post, index) => {
              const isFirst = index === 0;
              return (
                <motion.div
                  key={post._id || index}
                  whileTap={{ scale: 0.98 }}
                  // 👇 FIX: Much tighter proportions so it fits on screen (190x280 for #1, 120x170 for rest)
                  className={`relative shrink-0 snap-center rounded-[24px] overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.12)] cursor-pointer ${
                    isFirst ? 'w-[190px] h-[280px]' : 'w-[120px] h-[170px]'
                  }`}
                  onClick={() => navigate(`/posts/${post._id}`)}
                >
                  {/* # Rank Badge */}
                  <div className={`absolute top-3 left-3 z-20 ${isFirst ? 'text-white text-[38px] font-black leading-none drop-shadow-md tracking-tighter' : 'bg-black/80 backdrop-blur-md text-white text-[14px] font-bold px-2.5 py-1 rounded-[10px] leading-none'}`}>
                    #{index + 1}
                  </div>

                  {/* +18% Trending Tag (Only on #1) */}
                  {isFirst && (
                    <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-gradient-to-r from-[#FF3B30] to-[#FF9500] text-white rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      🔥 +18% Trending
                    </div>
                  )}

                  <img 
                    src={resolveMediaUrl(post.images?.[0]?.url || post.image)} 
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="trending"
                  />

                  {/* Gradient bottom for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-80" />
                  
                  {/* Likes Count (Bottom) */}
                  <div className={`absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-white ${isFirst ? 'font-bold text-[13px]' : 'font-semibold text-[10px]'}`}>
                    <FaHeart size={isFirst ? 14 : 10} />
                    {(post.likesCount / 1000000).toFixed(1)}M Likes
                  </div>

                  {/* Soft Neon Glow around #1 */}
                  {isFirst && (
                    <div className="absolute inset-0 border-[2px] border-[#00F0FF]/50 rounded-[24px] z-30 pointer-events-none shadow-[inset_0_0_15px_rgba(0,240,255,0.4)]" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── 4. FOR YOU GRID (Massive, Tall, Attractive Reels) ─── */}
        <div className="px-5 mt-2">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-[20px]">🎬</span>
             <h2 className="text-[20px] font-extrabold tracking-tight text-black">For You</h2>
          </div>

          {/* 👇 FIX: 2-Column Grid with TALL beautiful cards 👇 */}
          <div className="grid grid-cols-2 gap-2.5">
            {forYouPosts.map((post, index) => (
              <motion.div
                key={post._id || index}
                onClick={() => navigate(`/posts/${post._id}`)}
                // 👇 FIX: Fixed tall height (300px) so they look big and attractive!
                className="relative w-full h-[300px] rounded-[20px] overflow-hidden shadow-sm cursor-pointer active:scale-95 transition-transform"
              >
                <img 
                  src={resolveMediaUrl(post.images?.[0]?.url || post.image)} 
                  className="w-full h-full object-cover"
                  alt="feed"
                />
                {/* Gradient for icon visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                
                {/* ─── STACKED ICONS (Exact Mockup Match) ─── */}
                <div className="absolute right-2 bottom-3 flex flex-col items-center gap-3 z-20">
                  
                  {/* Heart Icon & Count */}
                  <div className="flex flex-col items-center gap-0.5">
                    {/* Pink heart for the first one, White heart for the rest (just like your image) */}
                    <FaHeart size={22} className={index % 2 === 0 ? "text-[#FF4D67] drop-shadow-md" : "text-white drop-shadow-md"} />
                    <span className="text-white text-[11px] font-bold drop-shadow-md">
                      {post.likesCount > 1000 ? `${(post.likesCount / 1000).toFixed(1)}K` : post.likesCount || 0}
                    </span>
                  </div>

                  {/* Comment Bubble Icon & Count */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center shadow-md">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.6127 20 9.29749 19.6841 8.13677 19.123L3.81802 20.203C3.50424 20.2815 3.2045 19.9818 3.28299 19.668L4.36302 15.3492C3.8019 14.1885 3.486 12.8733 3.486 11.5C3.486 6.80558 7.51543 3 12.486 3C17.4566 3 21 6.80558 21 11.5Z" />
                        <circle cx="8" cy="11.5" r="1.5" fill="white" />
                        <circle cx="12" cy="11.5" r="1.5" fill="white" />
                        <circle cx="16" cy="11.5" r="1.5" fill="white" />
                      </svg>
                    </div>
                    <span className="text-white text-[11px] font-bold drop-shadow-md">
                      {post.comments?.length || 0}
                    </span>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── 5. ELEVATED BOTTOM NAVIGATION DOCK ─── */}
      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-2 pb-6 flex justify-between items-center z-[100]">
        <NavIcon icon={<FiHome size={24} />} label="Home" active />
        <NavIcon icon={<FiCompass size={24} />} label="Explore" />
        
        {/* Elevated "+" Button */}
        <div className="relative -top-5 flex justify-center">
          <button className="w-[56px] h-[56px] bg-[#1C1C1E] rounded-full flex items-center justify-center text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] active:scale-95 transition-transform">
            <FiPlus size={28} />
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
    <button className={`flex flex-col items-center justify-center gap-1 transition-all ${active ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}>
      {active ? React.cloneElement(icon, { fill: 'black' }) : icon}
      <span className={`text-[10px] ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
    </button>
  );
}