import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiSearch, FiHome, FiCompass, FiPlus, FiMail, FiUser 
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import api from '../services/api';

const TABS = ['All', 'Food', 'Fitness', 'Travel', 'Luxury'];

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

  // 👇 FIX: Grab exactly TWO posts for the "For You" overlapping section
  const forYouPosts = useMemo(() => {
    return posts.slice(5, 7); 
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
        <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#FAFAFA] flex flex-col overflow-hidden font-sans text-black">
      
      {/* ─── 1. TOP STATUS BAR AREA ─── */}
      <div className="pt-12 px-6 pb-2 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <h1 className="text-[22px] font-black tracking-tight text-gray-900">Trending Today</h1>
        </div>
      </div>

      {/* ─── MAIN CONTENT SCROLL ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        
        {/* ─── 2. CATEGORY PILLS ─── */}
        <div className="px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-5 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                selectedTab === tab 
                ? 'bg-[#1C1C1E] text-white shadow-md' 
                : 'bg-white text-gray-400 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ─── 3. TRENDING CAROUSEL (Unchanged - Perfect!) ─── */}
        <div className="pl-6 py-4">
          <div className="flex items-start gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pr-6 pb-4">
            {trendingPosts.map((post, index) => {
              const isFirst = index === 0;
              return (
                <motion.div
                  key={post._id || index}
                  whileTap={{ scale: 0.98 }}
                  className={`relative shrink-0 snap-center rounded-[28px] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-all cursor-pointer ${
                    isFirst ? 'w-[260px] h-[380px]' : 'w-[140px] h-[210px]'
                  }`}
                  onClick={() => navigate(`/posts/${post._id}`)}
                >
                  <div className={`absolute top-4 left-4 z-20 rounded-full font-black flex items-center justify-center ${isFirst ? 'text-white text-[32px] drop-shadow-md' : 'bg-black/60 text-white text-[16px] px-3 py-1 backdrop-blur-md'}`}>
                    #{index + 1}
                  </div>

                  {isFirst && (
                    <div className="absolute top-4 right-4 z-20 px-2.5 py-1 bg-gradient-to-r from-[#FF3B30] to-[#FF9500] text-white rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg">
                      🔥 +18% Trending
                    </div>
                  )}

                  <img 
                    src={resolveMediaUrl(post.images?.[0]?.url || post.image)} 
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="trending"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  
                  <div className={`absolute bottom-4 left-4 z-20 flex items-center gap-1.5 text-white ${isFirst ? 'font-bold text-[14px]' : 'font-semibold text-[11px]'}`}>
                    <FaHeart size={isFirst ? 16 : 12} />
                    {(post.likesCount / 1000000).toFixed(1)}M Likes
                  </div>

                  {isFirst && (
                    <div className="absolute inset-0 border-[3px] border-[#00F0FF]/40 rounded-[28px] z-30 pointer-events-none shadow-[inset_0_0_20px_rgba(0,240,255,0.3)]" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── 4. FOR YOU: THE EXACT OVERLAPPING COLLAGE ─── */}
        <div className="px-6 mt-4 pb-8">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-xl">🎬</span>
             <h2 className="text-[20px] font-black tracking-tight text-gray-900">For You</h2>
          </div>

          {/* 👇 FIX: Exactly ONE container holding ONLY two videos. No repeating maps! 👇 */}
          <div className="relative w-full h-[300px]">
            
            {/* ─── BACK CARD (Right Side) ─── */}
            {forYouPosts[1] && (
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/posts/${forYouPosts[1]._id}`)}
                className="absolute right-0 top-0 w-[52%] h-full rounded-[24px] overflow-hidden z-10 cursor-pointer shadow-md bg-gray-200"
              >
                <img 
                  src={resolveMediaUrl(forYouPosts[1].images?.[0]?.url || forYouPosts[1].image)} 
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="feed-back"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                
                {/* Back Card Icons */}
                <div className="absolute right-3 bottom-4 flex flex-col items-center gap-3 z-20">
                  <div className="flex flex-col items-center gap-0.5">
                    <FaHeart size={18} className="text-white drop-shadow-md" />
                    <span className="text-white text-[11px] font-bold drop-shadow-md">
                      {forYouPosts[1].likesCount || 0}
                    </span>
                  </div>
                  <div className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center shadow-lg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.6127 20 9.29749 19.6841 8.13677 19.123L3.81802 20.203C3.50424 20.2815 3.2045 19.9818 3.28299 19.668L4.36302 15.3492C3.8019 14.1885 3.486 12.8733 3.486 11.5C3.486 6.80558 7.51543 3 12.486 3C17.4566 3 21 6.80558 21 11.5Z" />
                      <circle cx="8" cy="11.5" r="1.5" fill="white" />
                      <circle cx="12" cy="11.5" r="1.5" fill="white" />
                      <circle cx="16" cy="11.5" r="1.5" fill="white" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── FRONT CARD (Left Side, Overlapping) ─── */}
            {forYouPosts[0] && (
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/posts/${forYouPosts[0]._id}`)}
                className="absolute left-0 top-0 w-[55%] h-full rounded-[24px] overflow-hidden z-20 cursor-pointer shadow-[15px_0_30px_rgba(0,0,0,0.3)] bg-gray-900"
              >
                <img 
                  src={resolveMediaUrl(forYouPosts[0].images?.[0]?.url || forYouPosts[0].image)} 
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="feed-front"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                
                {/* Front Card Icons (Mockup Match: Pink Circle) */}
                <div className="absolute right-3 bottom-4 flex flex-col items-center gap-3 z-20">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#FF4D67] flex items-center justify-center shadow-lg border border-white/20">
                      <FaHeart size={14} className="text-white" />
                    </div>
                    <span className="text-white text-[11px] font-bold drop-shadow-md">
                      {forYouPosts[0].likesCount > 1000 ? `${(forYouPosts[0].likesCount / 1000).toFixed(1)}K` : forYouPosts[0].likesCount || 0}
                    </span>
                  </div>
                  <div className="w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center shadow-lg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.6127 20 9.29749 19.6841 8.13677 19.123L3.81802 20.203C3.50424 20.2815 3.2045 19.9818 3.28299 19.668L4.36302 15.3492C3.8019 14.1885 3.486 12.8733 3.486 11.5C3.486 6.80558 7.51543 3 12.486 3C17.4566 3 21 6.80558 21 11.5Z" />
                      <circle cx="8" cy="11.5" r="1.5" fill="white" />
                      <circle cx="12" cy="11.5" r="1.5" fill="white" />
                      <circle cx="16" cy="11.5" r="1.5" fill="white" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>

      {/* ─── 5. ELEVATED BOTTOM NAVIGATION DOCK ─── */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-2 pb-6 flex justify-between items-center z-[100]">
        <NavIcon icon={<FiHome size={22} />} label="Home" active />
        <NavIcon icon={<FiCompass size={22} />} label="Explore" />
        
        {/* Massive Elevated "+" Button */}
        <div className="relative -top-5 flex justify-center">
          <button className="w-[56px] h-[56px] bg-[#1C1C1E] rounded-full flex items-center justify-center text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] active:scale-90 transition-transform">
            <FiPlus size={28} />
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
    <button className={`flex flex-col items-center justify-center gap-1 transition-all ${active ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}>
      {active ? React.cloneElement(icon, { fill: 'black' }) : icon}
      <span className={`text-[10px] ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
    </button>
  );
}