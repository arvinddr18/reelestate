import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdHeart, IoMdText, IoMdBookmark, IoMdShareAlt, IoMdArrowBack, IoMdSearch, IoMdPulse } from 'react-icons/io';
import api from '../services/api';

const CATEGORIES = ['All', 'Sale Hub', 'Hotels', 'Rents', 'Education', 'Resorts', 'Farms', 'Commercial'];

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 👇 NEW: State to control whether we are on the Wheel or the Reels
  const [mode, setMode] = useState('wheel'); // 'wheel' | 'reels'
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [activeIndex, setActiveIndex] = useState(0);
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

  useEffect(() => {
    if (!loading && posts.length > 0 && mode === 'reels') {
      const timer = setTimeout(() => setIsRevealed(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, posts.length, mode]);

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

  const displayPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(post => {
        const cat = (post.category || post.propertyType || '').toLowerCase();
        return cat === activeCategory.toLowerCase() || cat.includes(activeCategory.toLowerCase());
      });

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#05070A] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#0057FF] border-t-[#00F0FF] rounded-full animate-spin mb-4 shadow-[0_0_15px_#00F0FF]" />
        <span className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase animate-pulse">Establishing Uplink...</span>
      </div>
    );
  }

  // ─── STATE 1: THE 3D HOLOGRAPHIC GATEWAY WHEEL ───
  if (mode === 'wheel') {
    return (
      <div className="h-[100dvh] w-full bg-[#05070A] relative flex flex-col items-center justify-center overflow-hidden">
        
        {/* Custom CSS for the 3D Cylinder Spin */}
        <style>{`
          @keyframes spinCylinder {
            0% { transform: rotateX(0deg); }
            100% { transform: rotateX(-360deg); }
          }
          .cyber-cylinder {
            transform-style: preserve-3d;
            animation: spinCylinder 20s linear infinite;
          }
          .cyber-cylinder:active, .cyber-cylinder:hover {
            animation-play-state: paused;
          }
        `}</style>

        {/* Ambient Background Glows */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0057FF]/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#00F0FF] opacity-20 blur-[100px] rounded-full" />
        </div>

        {/* Top Back Button (Leaves the scroll page entirely) */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-4 z-50 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/20 transition-all shadow-lg"
        >
          <IoMdArrowBack size={24} />
        </button>

        {/* Header Text */}
        <div className="absolute top-24 flex flex-col items-center z-10 pointer-events-none">
          <IoMdPulse size={40} className="text-[#00F0FF] animate-pulse mb-2 shadow-[0_0_15px_#00F0FF] rounded-full" />
          <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">Select Sector</h1>
          <p className="text-[#00F0FF] text-[10px] font-bold tracking-widest uppercase mt-2">Tap to establish uplink</p>
        </div>

        {/* The 3D Rotating Wheel Container */}
        <div className="relative w-full h-[400px] flex items-center justify-center z-20 perspective-[1000px]">
          <div className="relative w-full h-20 cyber-cylinder">
            
            {CATEGORIES.map((cat, index) => {
              // Calculate angle for a perfect circle of 8 items
              const angle = index * (360 / CATEGORIES.length);
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveIndex(0);
                    setIsRevealed(false);
                    setMode('reels'); // Launches the reels!
                  }}
                  className="absolute top-1/2 left-1/2 w-56 h-14 -translate-x-1/2 -translate-y-1/2 bg-[#0B0F19]/90 backdrop-blur-md border border-[#00F0FF]/30 text-[#00F0FF] rounded-full flex items-center justify-center font-black tracking-[0.15em] uppercase shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:bg-[#00F0FF] hover:text-black hover:scale-110 hover:shadow-[0_0_30px_rgba(0,240,255,0.8)] transition-all duration-300"
                  style={{ transform: `rotateX(${angle}deg) translateZ(220px)` }}
                >
                  {cat}
                </button>
              );
            })}

          </div>
        </div>

        {/* Holographic grid at the bottom */}
        <div className="absolute bottom-0 w-full h-1/3 opacity-[0.05] pointer-events-none border-t border-[#00F0FF]/30" style={{ backgroundImage: 'linear-gradient(rgba(0, 240, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 1) 1px, transparent 1px)', backgroundSize: '20px 20px', transform: 'perspective(500px) rotateX(60deg)' }} />
      </div>
    );
  }

  // ─── STATE 2: THE REELS FEED ───
  return (
    <div className="h-[100dvh] w-full bg-[#05070A] relative flex justify-center overflow-hidden">
      
      {/* ─── BACK TO WHEEL BUTTON ─── */}
      <button 
        onClick={() => setMode('wheel')} // This brings you back to the spinning wheel!
        className={`absolute top-6 left-4 z-50 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-[#00F0FF] hover:border-transparent hover:text-black transition-all duration-1000 ease-out shadow-[0_4px_15px_rgba(0,0,0,0.5)] ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
      >
        <IoMdArrowBack size={24} />
      </button>

      {/* ─── CATEGORY BADGE ─── */}
      <div className={`absolute top-8 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 bg-black/40 backdrop-blur-xl border border-[#00F0FF]/30 rounded-full text-[#00F0FF] text-[10px] font-black tracking-widest uppercase shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all duration-1000 delay-200 ease-out ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
        Sector: {activeCategory}
      </div>

      {/* ─── MAIN SCROLL CONTAINER ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[450px] h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 bg-[#05070A] sm:shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:border-x border-white/10"
      >
        {displayPosts.length === 0 ? (
          
          /* EMPTY STATE CYBER-RADAR */
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 relative bg-[#05070A]">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0, 240, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#00F0FF]/30 flex items-center justify-center animate-[spin_10s_linear_infinite] mb-6">
              <IoMdSearch size={30} className="text-[#00F0FF] opacity-50 animate-[spin_5s_linear_infinite_reverse]" />
            </div>
            <h3 className="text-[#00F0FF] font-black text-xl tracking-widest uppercase drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">No Intel Found</h3>
            <p className="text-gray-400 text-sm mt-2 font-medium">No properties uploaded in the <span className="text-white">[{activeCategory}]</span> sector yet.</p>
          </div>

        ) : (
          displayPosts.map((post, index) => {
            if (!post) return null;

            const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
            const isVideo = post.mediaType === 'video' || (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.match(/\.(mp4|webm|ogg)$/i));
            const isActive = index === activeIndex;
            const showUI = isRevealed && isActive;

            return (
              <div key={post._id || index} className="w-full h-[100dvh] snap-start snap-always relative bg-[#05070A] overflow-hidden">
                
                {/* ─── TRUE FULL SCREEN MEDIA ─── */}
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

                {/* ─── RIGHT SIDE: STAGGERED SLIDE-IN ICONS ─── */}
                <div className={`absolute bottom-6 right-3 z-20 flex flex-col items-center gap-6 transition-all duration-700 ease-out delay-200 ${showUI ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                  <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                    <IoMdHeart size={36} className="text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] group-hover:text-red-500 transition-colors" />
                    <span className="text-white text-[11px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{post.likesCount || 0}</span>
                  </button>

                  <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                    <IoMdText size={34} className="text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] group-hover:text-[#00F0FF] transition-colors" />
                    <span className="text-white text-[11px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{post.comments?.length || 0}</span>
                  </button>

                  <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                    <IoMdBookmark size={34} className="text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] group-hover:text-yellow-400 transition-colors" />
                    <span className="text-white text-[10px] font-bold uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">Save</span>
                  </button>

                  <button className="flex flex-col items-center mt-2 group active:scale-90 transition-transform">
                    <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(0,0,0,0.5)] group-hover:bg-[#00F0FF] group-hover:border-transparent group-hover:text-black transition-all">
                      <IoMdShareAlt size={24} />
                    </div>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}