import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { FiHeart, FiMessageCircle, FiBookmark, FiShare2, FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// ─── THE CONCEPT RADIAL MENU (Dark & Sleek) ───
const RadialMenu = ({ isOpen, onClose, onAction }) => {
  const [hoveredAction, setHoveredAction] = useState(null);

  const ACTIONS = [
    { id: 'like', icon: <FiHeart size={24} />, label: 'Like', angle: 270 },
    { id: 'save', icon: <FiBookmark size={24} />, label: 'Save', angle: 0 },
    { id: 'share', icon: <FiShare2 size={24} />, label: 'Share', angle: 90 },
    { id: 'hide', icon: <IoMdArrowBack size={24} className="rotate-180" />, label: 'Not Interested', angle: 180 },
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
        if (angle >= 315 || angle < 45) active = 'save';
        else if (angle >= 45 && angle < 135) active = 'share';
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md"
        >
          {/* The dark conceptual wheel background */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
            className="absolute w-[220px] h-[220px] rounded-full bg-[#1A1A1A]/80 backdrop-blur-2xl border border-white/5 shadow-2xl"
          />

          <div className="relative w-[220px] h-[220px] flex items-center justify-center">
            {/* Thumb indicator */}
            <div className="absolute w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shadow-inner">
              <div className="w-2 h-2 rounded-full bg-white/50" />
            </div>

            {ACTIONS.map((action, index) => {
              const isHovered = hoveredAction === action.id;
              const RADIUS = 75;
              const rad = (action.angle * Math.PI) / 180;
              const x = Math.cos(rad) * RADIUS;
              const y = Math.sin(rad) * RADIUS;

              return (
                <motion.div
                  key={action.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: isHovered ? 1.1 : 1, x, y, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.05 }}
                  className="absolute flex flex-col items-center justify-center pointer-events-none"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${isHovered ? (action.id === 'like' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-white text-black shadow-xl') : 'text-gray-300'}`}>
                    {action.icon}
                  </div>
                  <span className={`absolute ${action.angle === 270 ? '-bottom-5' : action.angle === 90 ? '-top-5' : action.angle === 0 ? '-bottom-5' : '-bottom-5'} text-[10px] font-bold tracking-wide whitespace-nowrap ${isHovered ? 'text-white' : 'text-gray-400'}`}>
                    {action.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
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
  
  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const pressTimer = useRef(null);

  // Mock states for UI interactivity
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
    if (action === 'like') {
      setLikedPosts(prev => ({ ...prev, [activeIndex]: !prev[activeIndex] }));
    }
  };

  const toggleLike = (index) => {
    setLikedPosts(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#05070A] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-gray-600 border-t-white rounded-full animate-spin mb-4" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black relative flex justify-center overflow-hidden select-none touch-none">
      
      <RadialMenu isOpen={radialMenuOpen} onClose={() => setRadialMenuOpen(false)} onAction={handleRadialAction} />

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
          const isLiked = likedPosts[index];

          return (
            <div 
              key={post._id || index} 
              className="w-full h-[100dvh] snap-start snap-always relative bg-black overflow-hidden"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUpOrLeave}
              onPointerLeave={handlePointerUpOrLeave}
              onContextMenu={(e) => e.preventDefault()}
            >
              
              {/* ─── 100% EDGE TO EDGE MEDIA ─── */}
              <div className="absolute inset-0 w-full h-full">
                {isVideo && mediaUrl ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" loop muted={!isActive} autoPlay={isActive} playsInline />
                ) : mediaUrl ? (
                  <img src={mediaUrl} alt="Post" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">No Media</div>
                )}
              </div>

              {/* Seamless Dark Gradient Overlay for text readability */}
              <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
              
              {/* Top Gradient for header */}
              <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

              {/* ─── TOP HEADER (Like the mockup) ─── */}
              <div className="absolute top-12 left-0 right-0 px-6 flex justify-between items-start pointer-events-none z-20">
                <button onClick={() => navigate(-1)} className="pointer-events-auto flex items-center gap-1 text-white/90 font-semibold drop-shadow-md">
                  <IoMdArrowBack size={20} />
                  <span className="text-[13px] tracking-wide">Back</span>
                </button>
                <div className="flex flex-col items-end">
                  <span className="text-white/90 font-semibold text-[13px] drop-shadow-md">Scroll Down</span>
                  <span className="text-white/60 text-[11px] flex items-center gap-1">for Next <FiChevronUp className="rotate-180"/></span>
                </div>
              </div>

              {/* ─── BOTTOM DETAILS PANEL (The "Concept" Card) ─── */}
              <div className="absolute bottom-8 left-4 right-[75px] z-20 pointer-events-auto">
                <div className="bg-[#1C1C1E]/85 backdrop-blur-2xl border border-white/10 rounded-[28px] p-5 shadow-2xl">
                  
                  {/* Top Bar of Card */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-bold text-[15px] tracking-wide">More Details</span>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <FiChevronUp className="text-white/70" size={14} />
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-white/10 my-3" />
                  
                  {/* Content */}
                  <h3 className="text-white font-bold text-[18px] leading-tight mb-1 truncate">
                    {post.title || 'Modern Apartment'}
                  </h3>
                  
                  <p className="text-gray-300 text-[14px] font-medium mb-1">
                    {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact for Price'}
                  </p>

                  <p className="text-gray-400 text-[12px] line-clamp-1 mb-4">
                    {post.description || 'Great Location with a Pool & Balcony'}
                  </p>

                  {/* Action Button inside card */}
                  <button className="w-full py-3.5 bg-white/10 hover:bg-white/20 transition-colors border border-white/5 rounded-2xl text-white font-semibold text-[14px]">
                    Learn More
                  </button>

                </div>
              </div>

              {/* ─── FLOATING ACTION STACK (Right Side) ─── */}
              <div className="absolute bottom-12 right-3 z-20 flex flex-col items-center gap-5 pointer-events-auto">
                
                <div className="flex flex-col items-center gap-4">
                  
                  {/* Circular Avatar */}
                  <div className="relative w-[46px] h-[46px] rounded-full border-2 border-white/20 p-[2px] shadow-lg overflow-hidden">
                    <img src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=0B0F19&color=fff`} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  </div>

                  {/* Like Button (Pops RED when liked, just like the concept) */}
                  <button onClick={() => toggleLike(index)} className="flex flex-col items-center group active:scale-90 transition-transform">
                    <div className={`w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isLiked ? 'bg-red-500 text-white' : 'bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60'}`}>
                      <FiHeart size={22} className={isLiked ? 'fill-white' : ''} />
                    </div>
                  </button>

                  {/* Save Button */}
                  <button className="flex flex-col items-center group active:scale-90 transition-transform">
                    <div className="w-[46px] h-[46px] rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-lg hover:bg-black/60 transition-colors">
                      <FiBookmark size={22} />
                    </div>
                  </button>

                  {/* Share Button */}
                  <button className="flex flex-col items-center group active:scale-90 transition-transform">
                    <div className="w-[46px] h-[46px] rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-lg hover:bg-black/60 transition-colors">
                      <FiShare2 size={22} />
                    </div>
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