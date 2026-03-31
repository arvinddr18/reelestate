import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiHome, FiCompass, FiPlus, FiMail, FiUser, FiMessageCircle } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import api from '../services/api';

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
    return [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0)).slice(0, 3);
  }, [posts]);

  const forYouPosts = useMemo(() => {
    return posts.slice(3);
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
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#1C1C1E] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-white flex flex-col font-sans text-[#1C1C1E] overflow-hidden relative">
      
      {/* ─── SCROLLABLE CONTENT AREA ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[90px]">
        
        {/* ─── HEADER & TABS ─── */}
        <div className="pt-12 px-5 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔥</span>
            <h1 className="text-[22px] font-bold tracking-tight text-black">Trending Today</h1>
          </div>

          {/* Exact Match Tabs */}
          <div className="inline-flex items-center bg-[#F2F2F7] rounded-full p-1">
            <button
              onClick={() => setSelectedTab('All')}
              className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${selectedTab === 'All' ? 'bg-[#1C1C1E] text-white shadow-sm' : 'text-gray-500'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedTab('Food')}
              className={`px-4 py-1.5 text-[13px] font-medium transition-colors ${selectedTab === 'Food' ? 'bg-[#1C1C1E] text-white rounded-full shadow-sm' : 'text-gray-500'}`}
            >
              Food
            </button>
            <div className="w-[1px] h-3 bg-gray-300 mx-1" />
            <button
              onClick={() => setSelectedTab('Fitness')}
              className={`px-4 py-1.5 text-[13px] font-medium transition-colors ${selectedTab === 'Fitness' ? 'bg-[#1C1C1E] text-white rounded-full shadow-sm' : 'text-gray-500'}`}
            >
              Fitness
            </button>
            <div className="w-[1px] h-3 bg-gray-300 mx-1" />
            <button
              onClick={() => setSelectedTab('Travel')}
              className={`px-4 py-1.5 text-[13px] font-medium transition-colors ${selectedTab === 'Travel' ? 'bg-[#1C1C1E] text-white rounded-full shadow-sm' : 'text-gray-500'}`}
            >
              Travel
            </button>
          </div>
        </div>

        {/* ─── HORIZONTAL TRENDING CAROUSEL ─── */}
        <div className="pl-5 py-6">
          <div className="flex items-start gap-4 overflow-x-auto no-scrollbar pr-5">
            {/* FEATURED CARD (#1) */}
            {trendingPosts[0] && (
              <div 
                onClick={() => navigate(`/posts/${trendingPosts[0]._id}`)}
                className="shrink-0 w-[240px] h-[340px] rounded-[24px] overflow-hidden relative shadow-[0_15px_30px_rgba(0,0,0,0.15)] cursor-pointer"
              >
                <img 
                  src={resolveMediaUrl(trendingPosts[0].images?.[0]?.url || trendingPosts[0].image)} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="Trending 1" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
                
                <div className="absolute top-4 left-4 flex flex-col items-start gap-1">
                  <div className="bg-gradient-to-r from-[#FF3B30] to-[#FF9500] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-md">
                    🔥 + 18% Trending
                  </div>
                  <span className="text-white text-[56px] font-black leading-none drop-shadow-lg">#1</span>
                </div>

                <div className="absolute bottom-5 left-5 flex items-center gap-1.5 text-white">
                  <FaHeart size={14} className="drop-shadow-md" />
                  <span className="text-[13px] font-bold drop-shadow-md">{(trendingPosts[0].likesCount / 1000000).toFixed(1)}M Likes</span>
                </div>
              </div>
            )}

            {/* SMALLER CARDS (#2, #3) */}
            {trendingPosts.slice(1).map((post, index) => (
              <div 
                key={post._id || index}
                onClick={() => navigate(`/posts/${post._id}`)}
                className="shrink-0 w-[130px] h-[190px] rounded-[20px] overflow-hidden relative shadow-lg cursor-pointer mt-4"
              >
                <img 
                  src={resolveMediaUrl(post.images?.[0]?.url || post.image)} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt={`Trending ${index + 2}`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                
                <span className="absolute top-3 left-3 text-white text-[22px] font-bold leading-none drop-shadow-md">
                  #{index + 2}
                </span>

                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white">
                  <FaHeart size={10} className="drop-shadow-md" />
                  <span className="text-[10px] font-bold drop-shadow-md">{(post.likesCount / 1000000).toFixed(1)}M Likes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FOR YOU GRID ─── */}
        <div className="px-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎬</span>
            <h2 className="text-[20px] font-bold tracking-tight text-black">For You</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {forYouPosts.map((post, index) => (
              <div 
                key={post._id || index}
                onClick={() => navigate(`/posts/${post._id}`)}
                className="w-full aspect-[3/4] rounded-[20px] overflow-hidden relative shadow-sm cursor-pointer"
              >
                <img 
                  src={resolveMediaUrl(post.images?.[0]?.url || post.image)} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="For You" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Stacked Icons on the Right */}
                <div className="absolute right-3 bottom-3 flex flex-col items-center gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <FaHeart size={20} className={index % 2 === 0 ? "text-[#FF3B30] drop-shadow-md" : "text-white drop-shadow-md"} />
                    <span className="text-white text-[11px] font-bold drop-shadow-md">
                      {post.likesCount > 1000 ? `${(post.likesCount / 1000).toFixed(1)}K` : post.likesCount || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-[22px] h-[22px] bg-white rounded-full flex items-center justify-center shadow-md">
                      <FiMessageCircle size={13} className="text-black fill-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── EXACT BOTTOM NAVIGATION DOCK ─── */}
      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-2 pb-6 flex justify-between items-center z-50">
        
        <button className="flex flex-col items-center gap-1 text-black">
          <FiHome size={22} className="fill-black" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-black">
          <FiCompass size={22} />
          <span className="text-[10px] font-semibold">Explore</span>
        </button>

        {/* Center + Button */}
        <div className="relative -top-5 flex justify-center">
          <button className="w-14 h-14 bg-[#1C1C1E] rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform">
            <FiPlus size={26} />
          </button>
        </div>

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-black">
          <FiMail size={22} />
          <span className="text-[10px] font-semibold">Messages</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-black">
          <FiUser size={22} />
          <span className="text-[10px] font-semibold">Profile</span>
        </button>

      </div>

    </div>
  );
}