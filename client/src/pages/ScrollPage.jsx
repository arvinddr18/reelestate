import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack, IoMdHeart } from 'react-icons/io';
import { FiMessageCircle, FiBookmark, FiShare2, FiMoreHorizontal } from 'react-icons/fi';
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
    if (!likedPosts[index] && navigator.vibrate) navigator.vibrate([10, 30, 10]);
  };

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border border-white/5 animate-ping absolute inset-0" />
          <div className="w-16 h-16 rounded-full border-t-2 border-white animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black relative flex justify-center overflow-hidden">
      
      {/* ─── NATIVE-FEEL TOP NAVIGATION ─── */}
      <div className="absolute top-12 left-0 right-0 px-8 flex justify-between items-center z-[60] pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-white"
        >
          <IoMdArrowBack size={22} />
        </button>
        <div className="flex flex-col items-end">
           <span className="text-white font-black text-[10px] uppercase tracking-[0.4em] drop-shadow-2xl">Neural Feed</span>
           <div className="w-8 h-[2px] bg-[#00F0FF] mt-1 shadow-[0_0_10px_#00F0FF]" />
        </div>
      </div>

      {/* ─── LIQUID SCROLL ENGINE ─── */}
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
            <div key={post._id || index} className="w-full h-[100dvh] snap-start snap-always relative overflow-hidden bg-black flex items-center justify-center">
              
              {/* ─── VIDEO BACKGROUND WITH SPATIAL DEPTH ─── */}
              <motion.div 
                animate={{ 
                  scale: isActive ? 1 : 0.8, 
                  opacity: isActive ? 1 : 0,
                  rotateY: isActive ? 0 : index < activeIndex ? -20 : 20,
                  filter: isActive ? 'blur(0px)' : 'blur(40px)'
                }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 w-full h-full"
              >
                {isVideo ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" loop muted={!isActive} autoPlay={isActive} playsInline />
                ) : (
                  <img src={mediaUrl} alt="prop" className="w-full h-full object-cover" />
                )}
                {/* Liquid Mist Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
              </motion.div>

              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 pointer-events-none"
                  >
                    
                    {/* ─── HOLOGRAPHIC ACTION STACK ─── */}
                    <div className="absolute right-6 bottom-32 flex flex-col gap-8 items-center pointer-events-auto">
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="w-14 h-14 rounded-2xl p-[1.5px] bg-gradient-to-tr from-white/40 to-transparent mb-2 shadow-2xl"
                      >
                         <img src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username}`} className="w-full h-full rounded-[14px] object-cover" alt="u" />
                      </motion.div>
                      
                      <button onClick={() => toggleLike(index)} className="flex flex-col items-center group">
                        <motion.div whileTap={{ scale: 1.5 }} className="relative">
                          <IoMdHeart size={34} className={`transition-all duration-500 ${isLiked ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)]' : 'text-white/80'}`} />
                        </motion.div>
                        <span className="text-white/60 font-black text-[10px] mt-1">{post.likesCount || 0}</span>
                      </button>

                      <button className="flex flex-col items-center group">
                        <FiMessageCircle size={30} className="text-white/80 hover:text-white transition-all" />
                        <span className="text-white/60 font-black text-[10px] mt-1">{post.comments?.length || 0}</span>
                      </button>

                      <button>
                        <FiBookmark size={30} className="text-white/80" />
                      </button>

                      <button>
                        <FiShare2 size={30} className="text-white/80" />
                      </button>
                    </div>

                    {/* ─── SPATIAL PROPERTY INFO (NO BOXES) ─── */}
                    <motion.div 
                      initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute bottom-12 left-8 right-24 pointer-events-auto"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="h-[1px] w-8 bg-[#00F0FF]" />
                           <span className="text-[#00F0FF] text-[10px] font-black uppercase tracking-[0.2em]">Live Listing</span>
                        </div>
                        
                        <h2 className="text-white font-black text-4xl tracking-tighter leading-none mb-2 drop-shadow-2xl">
                          {post.title}
                        </h2>
                        
                        <div className="flex items-baseline gap-3 mb-6">
                           <p className="text-white font-light text-2xl tracking-tight opacity-90">
                              {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Request Price'}
                           </p>
                           <span className="text-white/30 text-xs font-bold uppercase tracking-widest">@{post.author?.username}</span>
                        </div>

                        <div className="flex gap-3">
                          <button className="h-14 px-8 bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-full shadow-[0_15px_30px_rgba(255,255,255,0.2)] active:scale-95 transition-transform">
                            Invest Now
                          </button>
                          <button className="w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-3xl rounded-full border border-white/10 text-white">
                            <FiMoreHorizontal size={22} />
                          </button>
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

      {/* ─── BACKGROUND AMBIENCE (REALTIME GLOW) ─── */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#00F0FF] blur-[180px] rounded-full animate-pulse" />
      </div>

    </div>
  );
}