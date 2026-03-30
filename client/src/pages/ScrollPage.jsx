import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { FiHeart, FiMessageCircle, FiBookmark, FiShare2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// ─── RADIAL MENU COMPONENT ───
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
  
  // Custom Touch tracking for the Z-Axis Dive
  const touchStartY = useRef(0);

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

  const resolveMediaUrl = (source) => {
    if (!source) return '';
    if (typeof source === 'object' && source.url) return source.url;
    if (typeof source !== 'string') return '';
    if (source.startsWith('http') || source.startsWith('data:')) return source;
    const base = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';
    return `${base}${source.startsWith('/') ? '' : '/'}${source}`;
  };

  // ─── THE Z-AXIS NAVIGATION ENGINE ───
  // Swiping up = Dive Forward (Next post)
  // Swiping down = Pull Back (Previous post)
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    
    // Radial Menu Long Press Logic
    pressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      setRadialMenuOpen(true);
    }, 400); 
  };

  const handleTouchMove = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleTouchEnd = (e) => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    // Trigger the Z-Axis dive on swipe
    if (deltaY > 50 && activeIndex < posts.length - 1) {
      setActiveIndex(prev => prev + 1); // Dive Forward
    } else if (deltaY < -50 && activeIndex > 0) {
      setActiveIndex(prev => prev - 1); // Pull Back
    }
  };

  const handleWheel = (e) => {
    if (e.deltaY > 50 && activeIndex < posts.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else if (e.deltaY < -50 && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
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
    <div 
      className="h-[100dvh] w-full bg-[#05070A] relative flex justify-center overflow-hidden touch-none select-none"
      onWheel={handleWheel} // Desktop scroll support
    >
      
      {/* ─── RADIAL COMMAND MENU ─── */}
      <RadialMenu isOpen={radialMenuOpen} onClose={() => setRadialMenuOpen(false)} onAction={handleRadialAction} />

      {/* ─── CINEMATIC 3D SCROLL INTRO ─── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-screen"
            className="absolute inset-0 z-[100] bg-[#05070A] flex items-center justify-center overflow-hidden pointer-events-none perspective-[1200px]"
            exit={{ opacity: 0, scale: 1.3, filter: "blur(15px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div
              initial={{ rotateX: 45, y: 600, translateZ: -300 }} animate={{ y: -1200, translateZ: 200 }}
              transition={{ duration: 2.5, ease: "linear" }}
              className="absolute flex flex-col gap-10 preserve-3d"
            >
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-[280px] h-[450px] rounded-3xl border border-[#00F0FF]/30 bg-gradient-to-b from-[#00F0FF]/10 to-transparent shadow-[0_0_40px_rgba(0,240,255,0.1)] relative">
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 blur-[1px]" />
                  <div className="absolute bottom-10 left-4 w-3/4 h-4 bg-white/10 blur-[1px] rounded-full" />
                  <div className="absolute bottom-4 left-4 w-1/2 h-3 bg-white/10 blur-[1px] rounded-full" />
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

      {/* ─── THE Z-AXIS HOLOGRAPHIC TUNNEL ─── */}
      <div 
        className="w-full max-w-[450px] h-[100dvh] relative z-10 perspective-[1000px] overflow-hidden bg-[#05070A]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Radar Effect */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full border border-[#00F0FF]/20 animate-[spin_20s_linear_infinite] border-t-[#00F0FF]/50" />
        </div>

        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.match(/\.(mp4|webm|ogg)$/i));
          
          // Z-AXIS MATH LOGIC
          const offset = index - activeIndex; 
          const isActive = offset === 0;
          const isVisible = offset >= -1 && offset <= 3; // Only render a few at a time for performance

          if (!isVisible) return null;

          return (
            <motion.div 
              key={post._id || index} 
              // The 2050 Z-Axis 3D Animation!
              animate={{
                // If it's active, it's normal. 
                // If it's next, it's smaller and higher up in the distance.
                // If it's past, it explodes past the camera to scale 1.5.
                scale: isActive ? 1 : offset > 0 ? 1 - (offset * 0.2) : 1.5,
                y: isActive ? 0 : offset > 0 ? offset * -80 : 200,
                opacity: isActive ? 1 : offset > 0 ? 1 - (offset * 0.3) : 0,
                filter: isActive ? 'blur(0px)' : `blur(${Math.abs(offset) * 4}px)`,
                zIndex: posts.length - index // Future posts render behind current posts
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`absolute inset-0 w-full h-[100dvh] bg-black overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] origin-bottom ${!isActive && 'rounded-3xl border border-[#00F0FF]/30'}`}
            >
              
              {/* ─── MEDIA ─── */}
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                {isVideo && mediaUrl ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" loop muted={!isActive} autoPlay={isActive} playsInline />
                ) : mediaUrl ? (
                  <img src={mediaUrl} alt="Post" className="absolute inset-0 w-full h-full object-cover z-10" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">No Media</div>
                )}
              </div>

              <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />

              {/* ─── UI (ONLY SHOWS ON THE ACTIVE VIDEO) ─── */}
              <AnimatePresence>
                {isActive && isRevealed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full pointer-events-none">
                    
                    {/* Bottom Left Info */}
                    <div className="absolute bottom-6 left-4 right-[70px] z-20 flex flex-col gap-1 pointer-events-auto">
                      <div className="flex items-center gap-3 mb-1 cursor-pointer w-max">
                        <div className="relative w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                          <img src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=0B0F19&color=fff`} alt="avatar" className="w-full h-full rounded-full object-cover border-2 border-black" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-[15px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">@{post.author?.username || 'user'}</span>
                          <span className="w-1 h-1 rounded-full bg-white/70 shadow-md mx-0.5"></span>
                          <button className="text-[#00F0FF] font-black text-[11px] uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] hover:text-white transition-colors">Follow</button>
                        </div>
                      </div>
                      <h3 className="text-white font-bold text-[15px] leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2 mt-1">{post.title || 'Exclusive Listing'}</h3>
                      <p className="text-[15px] font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">{post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact for Price'}</p>
                      {post.description && <p className="text-gray-200 text-[13px] font-medium line-clamp-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] pr-2 leading-relaxed mt-0.5">{post.description}</p>}
                    </div>

                    {/* Center Right Icons */}
                    <div className="absolute top-1/2 -translate-y-1/2 right-3 z-20 flex flex-col items-center gap-6 pointer-events-auto">
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

                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}