import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { FiHeart, FiMessageCircle, FiBookmark, FiShare2 } from 'react-icons/fi';
// 👇 NEW: Importing Framer Motion for the 3D Cinematic Intro
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // 👇 NEW: States for the Cinematic Intro Sequence
  const [showIntro, setShowIntro] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

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

  // 👇 NEW: The Intro Timing Logic
  useEffect(() => {
    if (!loading && posts.length > 0) {
      // Let the 3D intro animation play for 2.5 seconds
      const introTimer = setTimeout(() => {
        setShowIntro(false);
        // Delay the UI slide-in slightly so it overlaps perfectly with the intro fading out
        setTimeout(() => setIsRevealed(true), 400);
      }, 2500);
      
      return () => clearTimeout(introTimer);
    }
  }, [loading, posts.length]);

  const handleScroll = (e) => {
    const container = e.target;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const resolveMediaUrl = (source) => {
    if (!source) return '';
    if (typeof source === 'object' && source.url) return source.url;
    if (typeof source !== 'string') return '';
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

  if (posts.length === 0) {
    return (
      <div className="h-[100dvh] w-full bg-[#05070A] flex flex-col items-center justify-center text-center px-6 relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50">
          <IoMdArrowBack size={24} />
        </button>
        <h3 className="text-[#00F0FF] font-black text-xl tracking-widest uppercase drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">No Intel Found</h3>
        <p className="text-gray-400 text-sm mt-2 font-medium">No properties uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black relative flex justify-center overflow-hidden">
      
      {/* Required CSS for 3D Perspective */}
      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .perspective-container { perspective: 1200px; }
      `}</style>

      {/* ─── CINEMATIC 3D SCROLL INTRO OVERLAY ─── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-screen"
            className="absolute inset-0 z-[100] bg-[#05070A] flex items-center justify-center perspective-container overflow-hidden pointer-events-none"
            exit={{ opacity: 0, scale: 1.3, filter: "blur(15px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* The 3D Flying Reel Cards */}
            <motion.div
              initial={{ rotateX: 45, y: 600, translateZ: -300 }}
              animate={{ y: -1200, translateZ: 200 }}
              transition={{ duration: 2.5, ease: "linear" }}
              className="absolute flex flex-col gap-10 preserve-3d"
            >
              {/* Fake Wireframe Cards to simulate scrolling */}
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-[280px] h-[450px] rounded-3xl border border-[#00F0FF]/30 bg-gradient-to-b from-[#00F0FF]/10 to-transparent shadow-[0_0_40px_rgba(0,240,255,0.1)] relative">
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 blur-[1px]" />
                  <div className="absolute bottom-10 left-4 w-3/4 h-4 bg-white/10 blur-[1px] rounded-full" />
                  <div className="absolute bottom-4 left-4 w-1/2 h-3 bg-white/10 blur-[1px] rounded-full" />
                </div>
              ))}
            </motion.div>

            {/* Glowing Center Badge & Typography */}
            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15, delay: 0.2 }}
                className="w-20 h-20 rounded-full border-2 border-[#00F0FF] bg-black/60 backdrop-blur-xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,240,255,0.6)]"
              >
                {/* Animated Scroll Arrow */}
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg className="w-8 h-8 text-[#00F0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18"></path></svg>
                </motion.div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-black text-white tracking-[0.3em] uppercase drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] text-center"
              >
                Immersive<br/><span className="text-[#00F0FF] text-xl">Reels</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-[#00F0FF] text-[10px] tracking-[0.3em] font-bold uppercase mt-4 animate-pulse"
              >
                Entering Feed...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── GLOBAL FLOATING BACK BUTTON ─── */}
      <button 
        onClick={() => navigate(-1)} 
        className={`absolute top-6 left-4 z-50 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-[#00F0FF] hover:border-transparent hover:text-black transition-all duration-1000 ease-out shadow-[0_4px_15px_rgba(0,0,0,0.5)] ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
      >
        <IoMdArrowBack size={24} />
      </button>

      {/* ─── MAIN SCROLL CONTAINER (Vertical) ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[450px] h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 bg-black sm:shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:border-x border-white/10"
      >
        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.match(/\.(mp4|webm|ogg)$/i));
          const isActive = index === activeIndex;
          
          // Only show the UI elements once the intro screen has vanished
          const showUI = isRevealed && isActive;

          return (
            <div key={post._id || index} className="w-full h-[100dvh] snap-start snap-always relative bg-black overflow-hidden">
              
              {/* ─── TRUE FULL SCREEN MEDIA ─── */}
              {/* Note: The scale-105 to scale-100 creates a beautiful snap-in effect when the intro finishes! */}
              <div className={`absolute inset-0 w-full h-full transition-transform duration-[1200ms] ease-out ${showUI ? 'scale-100' : 'scale-105'}`}>
                {isVideo && mediaUrl ? (
                  <video 
                    src={mediaUrl} 
                    className="w-full h-full object-cover" 
                    loop 
                    muted={!isActive} 
                    autoPlay={isActive} 
                    playsInline 
                  />
                ) : mediaUrl ? (
                  <img src={mediaUrl} alt="Post" className="absolute inset-0 w-full h-full object-cover z-10" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">No Media</div>
                )}
              </div>

              <div className={`absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10 pointer-events-none transition-opacity duration-1000 ${showUI ? 'opacity-100' : 'opacity-0'}`} />

              {/* ─── BOTTOM LEFT: DYNAMIC SLIDE-IN HUD ─── */}
              <div className={`absolute bottom-6 left-4 right-[70px] z-20 flex flex-col gap-1 transition-all duration-700 ease-out delay-100 ${showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                
                <div className="flex items-center gap-3 mb-1 cursor-pointer w-max">
                  <div className="relative w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    <img 
                      src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=0B0F19&color=fff`} 
                      alt="avatar" 
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-[15px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      @{post.author?.username || 'user'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/70 shadow-md mx-0.5"></span>
                    <button className="text-[#00F0FF] font-black text-[11px] uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] hover:text-white transition-colors">
                      Follow
                    </button>
                  </div>
                </div>

                <h3 className="text-white font-bold text-[15px] leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2 mt-1">
                  {post.title || 'Exclusive Listing'}
                </h3>
                
                <p className="text-[15px] font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                  {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact for Price'}
                </p>

                {post.description && (
                  <p className="text-gray-200 text-[13px] font-medium line-clamp-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] pr-2 leading-relaxed mt-0.5">
                    {post.description}
                  </p>
                )}
              </div>

              {/* ─── RIGHT SIDE: TRANSPARENT OUTLINE ICONS ─── */}
              <div className={`absolute top-1/2 -translate-y-1/2 right-3 z-20 flex flex-col items-center gap-6 transition-all duration-700 ease-out delay-200 ${showUI ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                
                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <FiHeart size={32} className="text-white/90 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
                  <span className="text-white text-[12px] font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{post.likesCount || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <FiMessageCircle size={32} className="text-white/90 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] group-hover:text-[#00F0FF] transition-colors" />
                  <span className="text-white text-[12px] font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{post.comments?.length || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <FiBookmark size={32} className="text-white/90 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-all" />
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">Save</span>
                </button>

                <button className="flex flex-col items-center mt-2 group active:scale-90 transition-transform">
                  <FiShare2 size={32} className="text-white/90 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)] group-hover:text-[#00F0FF] transition-colors" />
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mt-1">Share</span>
                </button>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}