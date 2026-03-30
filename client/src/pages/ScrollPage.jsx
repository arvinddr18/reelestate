import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { FiHeart, FiMessageCircle, FiBookmark, FiShare2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// ─── THE LONG-PRESS RADIAL MENU ───
const RadialMenu = ({ isOpen, onClose, onAction }) => {
  const [hoveredAction, setHoveredAction] = useState(null);

  const ACTIONS = [
    { id: 'like', icon: <FiHeart size={28} />, label: 'Like', color: 'text-red-500', bg: 'bg-red-500/20', angle: 270 },
    { id: 'share', icon: <FiShare2 size={28} />, label: 'Share', color: 'text-[#00F0FF]', bg: 'bg-[#00F0FF]/20', angle: 0 },
    { id: 'save', icon: <FiBookmark size={28} />, label: 'Save', color: 'text-yellow-400', bg: 'bg-yellow-400/20', angle: 90 },
    { id: 'hide', icon: <IoMdArrowBack size={28} className="rotate-180" />, label: 'Hide', color: 'text-gray-400', bg: 'bg-gray-400/20', angle: 180 },
  ];

  useEffect(() => {
    if (!isOpen) return;

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 40) {
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        let active = null;
        if (angle >= 315 || angle < 45) active = 'share';
        else if (angle >= 45 && angle < 135) active = 'save';
        else if (angle >= 135 && angle < 225) active = 'hide';
        else if (angle >= 225 && angle < 315) active = 'like';

        setHoveredAction(active);
        if (active !== hoveredAction && navigator.vibrate) navigator.vibrate(10);
      } else {
        setHoveredAction(null);
      }
    };

    const handleUp = () => {
      if (hoveredAction) onAction(hoveredAction);
      onClose();
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isOpen, hoveredAction, onAction, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <div className="relative w-[280px] h-[280px] flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] z-10"
            >
              <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse shadow-[0_0_10px_#00F0FF]" />
            </motion.div>

            {ACTIONS.map((action, index) => {
              const isHovered = hoveredAction === action.id;
              const RADIUS = 100;
              const rad = (action.angle * Math.PI) / 180;
              const x = Math.cos(rad) * RADIUS;
              const y = Math.sin(rad) * RADIUS;

              return (
                <motion.div
                  key={action.id}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                  animate={{ scale: isHovered ? 1.2 : 1, x, y, opacity: 1 }}
                  exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.05 }}
                  className="absolute flex flex-col items-center justify-center pointer-events-none"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border border-white/20 shadow-xl transition-all duration-200 ${isHovered ? `${action.bg} ${action.color} border-${action.color.split('-')[1]}/50 shadow-[0_0_20px_currentColor]` : 'bg-[#151A25]/90 text-white backdrop-blur-md'}`}>
                    {action.icon}
                  </div>
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                        className={`absolute -bottom-6 text-[11px] font-black uppercase tracking-widest drop-shadow-lg ${action.color}`}
                      >
                        {action.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-20 text-gray-400 text-xs font-bold tracking-widest uppercase">
            Drag to select
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const [showIntro, setShowIntro] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const pressTimer = useRef(null);

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

  // ─── RADIAL MENU TRIGGERS ───
  const handlePointerDown = () => {
    pressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      setRadialMenuOpen(true);
    }, 400); 
  };

  const handlePointerUpOrLeave = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleRadialAction = (action) => {
    console.log(`Action triggered on Post ${activeIndex}:`, action);
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
    <div className="h-[100dvh] w-full bg-black relative flex justify-center overflow-hidden touch-none select-none">
      
      <RadialMenu isOpen={radialMenuOpen} onClose={() => setRadialMenuOpen(false)} onAction={handleRadialAction} />

      {/* ─── THE CINEMATIC 3D INTRO ─── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-screen"
            className="absolute inset-0 z-[100] bg-[#05070A] flex items-center justify-center overflow-hidden pointer-events-none perspective-[1200px]"
            exit={{ opacity: 0, scale: 1.3, filter: "blur(15px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
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

      <button onClick={() => navigate(-1)} className={`absolute top-6 left-4 z-50 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-[#00F0FF] hover:border-transparent hover:text-black transition-all duration-1000 ease-out shadow-[0_4px_15px_rgba(0,0,0,0.5)] ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
        <IoMdArrowBack size={24} />
      </button>

      {/* ─── THE SPATIAL AURA FEED (Vertical Scroll) ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[450px] h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 bg-black"
      >
        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.match(/\.(mp4|webm|ogg)$/i));
          const isActive = index === activeIndex;
          const showUI = isRevealed && isActive;

          return (
            <div 
              key={post._id || index} 
              className="w-full h-[100dvh] snap-start snap-always relative flex items-center justify-center overflow-hidden"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUpOrLeave}
              onPointerLeave={handlePointerUpOrLeave}
              onContextMenu={(e) => e.preventDefault()}
            >
              
              {/* 1. THE AMBILIGHT AURA BACKGROUND */}
              {/* This scales up the video, blurs it out, and drops opacity to make the whole phone glow with the video's colors! */}
              <div className="absolute inset-0 w-full h-full z-0">
                {isVideo && mediaUrl ? (
                  <video src={mediaUrl} className="w-full h-full object-cover scale-[1.3] blur-[60px] opacity-40" loop muted autoPlay playsInline />
                ) : mediaUrl ? (
                  <img src={mediaUrl} alt="Aura" className="w-full h-full object-cover scale-[1.3] blur-[60px] opacity-40" />
                ) : null}
              </div>

              {/* 2. THE FLOATING SPATIAL GLASS PANE */}
              {/* This is the actual video, floating in the center of the screen with massive rounded corners and drop shadow */}
              <div className={`relative z-10 w-[94%] h-[88%] rounded-[36px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 transition-transform duration-[1200ms] ease-out ${showUI ? 'scale-100' : 'scale-95 opacity-50'}`}>
                
                {isVideo && mediaUrl ? (
                  <video src={mediaUrl} className="w-full h-full object-cover pointer-events-none" loop muted={!isActive} autoPlay={isActive} playsInline />
                ) : mediaUrl ? (
                  <img src={mediaUrl} alt="Post" className="w-full h-full object-cover pointer-events-none" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 bg-[#0B0F19]">No Media</div>
                )}
                
                <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* 3. THE FLOATING UI (Inside the Glass Pane) */}
                <div className={`absolute bottom-6 left-5 right-[70px] flex flex-col gap-1 transition-all duration-700 ease-out delay-100 pointer-events-none ${showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  
                  <div className="flex items-center gap-3 mb-2 cursor-pointer w-max pointer-events-auto">
                    <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                      <img src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=0B0F19&color=fff`} alt="avatar" className="w-full h-full rounded-full object-cover border-2 border-black" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-[15px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">@{post.author?.username || 'user'}</span>
                      <span className="text-[#00F0FF] font-black text-[9px] uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">Verified Agent</span>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-[16px] leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2">
                    {post.title || 'Exclusive Listing'}
                  </h3>
                  
                  <p className="text-[16px] font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                    {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact for Price'}
                  </p>

                  {post.description && (
                    <p className="text-gray-200 text-[13px] font-medium line-clamp-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] pr-2 mt-1 leading-snug">
                      {post.description}
                    </p>
                  )}
                </div>

                {/* THE TRANSPARENT OUTLINE ICONS */}
                <div className={`absolute top-1/2 -translate-y-1/2 right-4 flex flex-col items-center gap-6 transition-all duration-700 ease-out delay-200 pointer-events-auto ${showUI ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                  
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

            </div>
          );
        })}
      </div>

    </div>
  );
}