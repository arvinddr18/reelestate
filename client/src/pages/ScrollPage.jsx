import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { FiHeart, FiMessageCircle, FiBookmark, FiShare2, FiMaximize } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // State for the 3D Intro
  const [showIntro, setShowIntro] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

  // State for "Clear View" (Press & Hold to hide UI)
  const [clearView, setClearView] = useState(false);
  const holdTimer = useRef(null);

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

  useEffect(() => {
    if (!loading && posts.length > 0) {
      const introTimer = setTimeout(() => {
        setShowIntro(false);
        setTimeout(() => setIsRevealed(true), 100);
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

  // ─── CLEAR VIEW LOGIC (Press & Hold to hide UI) ───
  const handlePointerDown = () => {
    holdTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
      setClearView(true);
    }, 300); // 300ms hold hides the UI
  };

  const handlePointerUpOrLeave = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (clearView) {
      if (navigator.vibrate) navigator.vibrate(20);
      setClearView(false);
    }
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
    <div className="h-[100dvh] w-full bg-black relative flex justify-center overflow-hidden select-none touch-none">
      
      {/* ─── CINEMATIC 3D SCROLL INTRO ─── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-screen"
            className="absolute inset-0 z-[100] bg-[#05070A] flex items-center justify-center overflow-hidden pointer-events-none perspective-[1200px]"
            exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <style>{`.preserve-3d { transform-style: preserve-3d; }`}</style>
            <motion.div
              initial={{ rotateX: 45, y: 600, translateZ: -300 }} animate={{ y: -1200, translateZ: 200 }}
              transition={{ duration: 2.5, ease: "linear" }}
              className="absolute flex flex-col gap-10 preserve-3d"
            >
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-[280px] h-[450px] rounded-3xl border border-[#00F0FF]/30 bg-gradient-to-b from-[#00F0FF]/10 to-transparent shadow-[0_0_40px_rgba(0,240,255,0.1)] relative">
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 blur-[1px]" />
                </div>
              ))}
            </motion.div>

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 15, delay: 0.2 }}
                className="w-20 h-20 rounded-full border-2 border-[#00F0FF] bg-black/60 backdrop-blur-xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,240,255,0.6)]"
              >
                <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                  <svg className="w-8 h-8 text-[#00F0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18"></path></svg>
                </motion.div>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-black text-white tracking-[0.3em] uppercase drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] text-center">
                Immersive<br/><span className="text-[#00F0FF] text-xl">Scrolls</span>
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── GLOBAL FLOATING BACK BUTTON ─── */}
      <AnimatePresence>
        {isRevealed && !clearView && (
          <motion.button 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-4 z-50 p-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-[#00F0FF] hover:border-transparent hover:text-black transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
          >
            <IoMdArrowBack size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── MAIN SCROLL CONTAINER ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[450px] h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 bg-black"
      >
        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.match(/\.(mp4|webm|ogg)$/i));
          const isActive = index === activeIndex;
          
          const showUI = isRevealed && isActive && !clearView;

          return (
            <div 
              key={post._id || index} 
              className="w-full h-[100dvh] snap-start snap-always relative bg-black overflow-hidden"
              // The event listeners for the "Hold to Clear Screen" effect
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUpOrLeave}
              onPointerLeave={handlePointerUpOrLeave}
              onContextMenu={(e) => e.preventDefault()}
            >
              
              {/* ─── THE CINEMATIC "BREATHING" MEDIA ─── */}
              {/* If active, it slowly scales up over 15 seconds to create a living, breathing effect */}
              <div className="absolute inset-0 w-full h-full pointer-events-none bg-black">
                <motion.div
                  initial={{ scale: 1.1 }}
                  animate={{ scale: isActive ? 1.0 : 1.1 }}
                  transition={{ duration: 15, ease: "easeOut" }}
                  className="w-full h-full"
                >
                  {isVideo && mediaUrl ? (
                    <video src={mediaUrl} className="w-full h-full object-cover" loop muted={!isActive} autoPlay={isActive} playsInline />
                  ) : mediaUrl ? (
                    <img src={mediaUrl} alt="Post" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No Media</div>
                  )}
                </motion.div>
              </div>

              {/* Seamless Vignette overlay for text readability */}
              <div className={`absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-[#05070A]/90 via-[#05070A]/30 to-transparent z-10 pointer-events-none transition-opacity duration-700 ${showUI ? 'opacity-100' : 'opacity-0'}`} />

              {/* ─── ZERO-GRAVITY HOLOGRAPHIC HUD ─── */}
              <AnimatePresence>
                {showUI && (
                  <motion.div className="absolute inset-0 z-20 w-full h-full pointer-events-none">
                    
                    {/* Bottom Info: The "Dynamic Island" Capsule */}
                    <motion.div 
                      initial={{ opacity: 0, y: 50, scale: 0.9 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 50, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                      className="absolute bottom-6 left-4 right-[75px] pointer-events-auto"
                    >
                      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3.5 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                            <img src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=0B0F19&color=fff`} alt="avatar" className="w-full h-full rounded-full object-cover border-2 border-black" />
                          </div>
                          <div className="flex flex-col flex-1">
                            <span className="text-white font-bold text-[15px] drop-shadow-md tracking-wide">@{post.author?.username || 'user'}</span>
                            <span className="text-[#00F0FF] font-black text-[9px] uppercase tracking-[0.2em] drop-shadow-md">Verified Listing</span>
                          </div>
                          <button className="px-3 py-1.5 bg-white/10 hover:bg-[#00F0FF] hover:text-black border border-white/20 hover:border-transparent rounded-full text-white text-[10px] font-black uppercase tracking-widest transition-all">
                            Follow
                          </button>
                        </div>
                        
                        <h3 className="text-white font-bold text-[16px] leading-tight line-clamp-2 drop-shadow-md">
                          {post.title || 'Exclusive Listing'}
                        </h3>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[16px] font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF] drop-shadow-md">
                            {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact for Price'}
                          </p>
                          {post.description && (
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-black/40 px-2 py-1 rounded-md cursor-pointer hover:text-white transition-colors">
                              More Info
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    {/* Right Side Icons: Staggered Spring Entrance */}
                    <div className="absolute bottom-6 right-3 flex flex-col items-center gap-5 pointer-events-auto">
                      
                      {/* Like */}
                      <motion.button 
                        initial={{ opacity: 0, x: 50, rotate: -20 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: 50 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
                        className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                      >
                        <FiHeart size={30} className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
                        <span className="text-white text-[11px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{post.likesCount || 0}</span>
                      </motion.button>

                      {/* Comment */}
                      <motion.button 
                        initial={{ opacity: 0, x: 50, rotate: -20 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: 50 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
                        className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                      >
                        <FiMessageCircle size={28} className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] group-hover:text-[#00F0FF] transition-colors" />
                        <span className="text-white text-[11px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{post.comments?.length || 0}</span>
                      </motion.button>

                      {/* Save */}
                      <motion.button 
                        initial={{ opacity: 0, x: 50, rotate: -20 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: 50 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.25 }}
                        className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                      >
                        <FiBookmark size={28} className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-all" />
                        <span className="text-white text-[9px] font-bold uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">Save</span>
                      </motion.button>

                      {/* Share */}
                      <motion.button 
                        initial={{ opacity: 0, x: 50, rotate: -20 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: 50 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
                        className="flex flex-col items-center group active:scale-90 transition-transform mt-2"
                      >
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:bg-[#00F0FF] group-hover:border-transparent group-hover:text-black transition-all">
                          <FiShare2 size={24} />
                        </div>
                      </motion.button>

                    </div>

                    {/* Hint for "Clear View" */}
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 2 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none opacity-40 mix-blend-overlay"
                    >
                      <FiMaximize size={32} className="text-white animate-pulse mb-2" />
                      <p className="text-white text-[10px] font-black tracking-[0.2em] uppercase text-center drop-shadow-md">Press & Hold<br/>To Clear Screen</p>
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