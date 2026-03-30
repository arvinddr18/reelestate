import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { FiHeart, FiMessageCircle, FiBookmark, FiShare2, FiChevronUp, FiMoreHorizontal } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedPosts, setLikedPosts] = useState({});

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

  const handleScroll = (e) => {
    const container = e.target;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const resolveMediaUrl = (source) => {
    if (!source) return '';
    if (typeof source === 'object' && source.url) return source.url;
    if (source.startsWith('http') || source.startsWith('data:')) return source;
    const base = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';
    return `${base}${source.startsWith('/') ? '' : '/'}${source}`;
  };

  const toggleLike = (index) => {
    setLikedPosts(prev => ({ ...prev, [index]: !prev[index] }));
    if (!likedPosts[index] && navigator.vibrate) navigator.vibrate(50);
  };

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-black flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-[#00F0FF] font-black tracking-[0.3em] text-xs uppercase"
        >
          Loading Universe
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black relative flex justify-center overflow-hidden">
      
      {/* ─── MINIMALIST GLOBAL NAVIGATION ─── */}
      <div className="absolute top-10 left-0 right-0 px-6 flex justify-between items-center z-[60] pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="pointer-events-auto p-2 bg-black/10 backdrop-blur-md rounded-full border border-white/5 text-white/80 hover:text-white transition-colors"
        >
          <IoMdArrowBack size={22} />
        </button>
        <div className="px-4 py-1.5 bg-black/10 backdrop-blur-md rounded-full border border-white/5 pointer-events-auto">
          <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Explore Mode</span>
        </div>
      </div>

      {/* ─── SCROLL ENGINE ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[500px] h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 bg-black"
      >
        {posts.map((post, index) => {
          const isActive = index === activeIndex;
          const isLiked = likedPosts[index];
          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || (mediaUrl && mediaUrl.match(/\.(mp4|webm|ogg)$/i));

          return (
            <div key={post._id || index} className="w-full h-[100dvh] snap-start snap-always relative overflow-hidden flex items-center justify-center bg-black">
              
              {/* ─── THE VIDEO BACKGROUND ─── */}
              <motion.div 
                animate={{ scale: isActive ? 1 : 1.1, opacity: isActive ? 1 : 0.4, filter: isActive ? 'blur(0px)' : 'blur(20px)' }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full"
              >
                {isVideo ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" loop muted={!isActive} autoPlay={isActive} playsInline />
                ) : (
                  <img src={mediaUrl} alt="prop" className="w-full h-full object-cover" />
                )}
              </motion.div>

              {/* ─── PREMIUM OVERLAYS (NO BOXES) ─── */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none z-10" />

              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 pointer-events-none"
                  >
                    
                    {/* ─── ACTION STACK (RIGHT SIDE) ─── */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 items-center pointer-events-auto">
                      <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-b from-white/20 to-transparent mb-2">
                         <img src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username}`} className="w-full h-full rounded-full object-cover border border-black/50" alt="u" />
                      </div>
                      
                      <button onClick={() => toggleLike(index)} className="flex flex-col items-center gap-1 group">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-500 ${isLiked ? 'bg-red-500 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                          <FiHeart size={26} className={isLiked ? 'fill-white text-white' : 'text-white'} />
                        </div>
                        <span className="text-white font-bold text-[10px] drop-shadow-md">{post.likesCount || 0}</span>
                      </button>

                      <button className="flex flex-col items-center gap-1 group">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all">
                          <FiMessageCircle size={26} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-[10px] drop-shadow-md">{post.comments?.length || 0}</span>
                      </button>

                      <button className="flex flex-col items-center gap-1 group">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all">
                          <FiBookmark size={26} className="text-white" />
                        </div>
                      </button>

                      <button className="flex flex-col items-center group mt-2">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all">
                          <FiShare2 size={24} className="text-white" />
                        </div>
                      </button>
                    </div>

                    {/* ─── PROPERTY PANEL (BOTTOM) ─── */}
                    <motion.div 
                      initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                      className="absolute bottom-10 left-4 right-20 pointer-events-auto"
                    >
                      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-2xl overflow-hidden relative group">
                        {/* Animated background flare */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00F0FF]/10 blur-[60px] rounded-full group-hover:bg-[#00F0FF]/20 transition-all duration-1000" />
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-[#00F0FF] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Premium</span>
                            <span className="text-white/40 text-[10px] font-bold">@{post.author?.username}</span>
                          </div>

                          <h2 className="text-white font-black text-2xl tracking-tighter leading-none mb-1">
                            {post.title}
                          </h2>
                          <p className="text-[#00F0FF] font-bold text-lg mb-3">
                             {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact'}
                          </p>
                          
                          <div className="flex gap-2">
                            <button className="flex-1 py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-transform">
                              Get Information
                            </button>
                            <button className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl text-white">
                              <FiMoreHorizontal size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          );
        })}
      </div>

    </div>
  );
}