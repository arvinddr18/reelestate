import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, FiMessageSquare, FiSearch, FiHome, 
  FiPlus, FiMail, FiUser, FiTrendingUp, FiZap 
} from 'react-icons/fi';
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

  // Sort by engagement for the Trending Section
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
        <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#FAFAFA] flex flex-col overflow-hidden font-sans text-black">
      
      {/* ─── 1. TOP STATUS BAR AREA ─── */}
      <div className="pt-12 px-6 pb-2 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h1 className="text-2xl font-black tracking-tight">Trending Today</h1>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
           <FiSearch size={20} className="text-gray-400" />
        </div>
      </div>

      {/* ─── MAIN CONTENT SCROLL ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        
        {/* ─── 2. CATEGORY PILLS ─── */}
        <div className="px-6 py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                selectedTab === tab 
                ? 'bg-[#1C1C1E] text-white shadow-lg scale-105' 
                : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ─── 3. TRENDING CAROUSEL (Horizontal) ─── */}
        <div className="px-6 py-2">
          <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
            {trendingPosts.map((post, index) => {
              const isFirst = index === 0;
              return (
                <motion.div
                  key={post._id || index}
                  whileTap={{ scale: 0.98 }}
                  className={`relative shrink-0 snap-center rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 ${
                    isFirst ? 'w-[280px] h-[420px]' : 'w-[220px] h-[330px] mt-[45px]'
                  }`}
                >
                  {/* # Rank Badge */}
                  <div className={`absolute top-4 left-4 z-20 px-3 py-1 rounded-full font-black text-sm ${isFirst ? 'bg-white text-black' : 'bg-black/50 text-white backdrop-blur-md'}`}>
                    #{index + 1}
                  </div>

                  {/* Trending Percentage (Only on #1) */}
                  {isFirst && (
                    <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-[#FF3B30] text-white rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg shadow-red-500/40">
                      <FiZap size={10} fill="white" /> +18% Trending
                    </div>
                  )}

                  <img 
                    src={resolveMediaUrl(post.images?.[0]?.url || post.image)} 
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="trending"
                  />

                  {/* Content Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <div className="absolute bottom-5 left-5 right-5 z-20">
                    <div className="flex items-center gap-2 text-white/90 text-[11px] font-bold mb-1">
                      <FiHeart size={12} fill="white" className="text-white" />
                      {(post.likesCount / 1000).toFixed(1)}K Likes
                    </div>
                    {isFirst && (
                      <h3 className="text-white font-black text-lg leading-tight line-clamp-2">
                        {post.title}
                      </h3>
                    )}
                  </div>

                  {/* Neural Glow (Only on #1) */}
                  {isFirst && (
                    <div className="absolute inset-0 border-4 border-white/20 rounded-[32px] z-30 pointer-events-none" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── 4. FOR YOU GRID (Vertical 2-Column) ─── */}
        <div className="px-6 mt-6">
          <div className="flex items-center gap-2 mb-5">
             <span className="text-lg">🎬</span>
             <h2 className="text-xl font-black tracking-tight">For You</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {forYouPosts.map((post, index) => (
              <motion.div
                key={post._id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-sm bg-gray-100"
              >
                <img 
                  src={resolveMediaUrl(post.images?.[0]?.url || post.image)} 
                  className="w-full h-full object-cover"
                  alt="feed"
                />
                {/* Stats Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10">
                  <div className="flex items-center gap-1 text-white text-[10px] font-black drop-shadow-md">
                    <FiHeart size={12} fill="white" /> {post.likesCount || 0}
                  </div>
                  <FiMessageSquare size={14} className="text-white drop-shadow-md" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── 5. FLOATING DOCK (Bottom Navigation) ─── */}
      <div className="fixed bottom-8 left-6 right-6 h-[72px] bg-white/90 backdrop-blur-2xl rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[100] px-6 flex justify-between items-center">
        <NavIcon icon={<FiHome size={22} />} active />
        <NavIcon icon={<FiSearch size={22} />} />
        
        {/* Elevation "+" Button */}
        <div className="relative -top-6">
          <div className="absolute inset-0 bg-black blur-2xl opacity-20 scale-75" />
          <button className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center shadow-xl active:scale-90 transition-transform">
            <FiPlus size={28} />
          </button>
        </div>

        <NavIcon icon={<FiMail size={22} />} />
        <NavIcon icon={<FiUser size={22} />} />
      </div>

    </div>
  );
}

// Sub-component for Nav Icons
function NavIcon({ icon, active = false }) {
  return (
    <button className={`flex flex-col items-center justify-center transition-all ${active ? 'text-black' : 'text-gray-300 hover:text-gray-400'}`}>
      {icon}
      {active && <div className="w-1 h-1 rounded-full bg-black mt-1" />}
    </button>
  );
}