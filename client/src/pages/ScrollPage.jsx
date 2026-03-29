import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdHeart, IoMdText, IoMdBookmark, IoMdShareAlt, IoMdArrowBack } from 'react-icons/io';
import api from '../services/api';

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // 👇 NEW: State to trigger the grand entrance animation
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

  // 👇 NEW: Trigger the animation 100ms after the loading screen finishes
  useEffect(() => {
    if (!loading && posts.length > 0) {
      const timer = setTimeout(() => setIsRevealed(true), 100);
      return () => clearTimeout(timer);
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
      <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#0057FF] border-t-[#00F0FF] rounded-full animate-spin mb-4" />
        <span className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase animate-pulse">Establishing Uplink...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center text-white relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50">
          <IoMdArrowBack size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">No posts found</h2>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black relative flex justify-center">
      
      {/* ─── GLOBAL FLOATING BACK BUTTON (Animates in once) ─── */}
      <button 
        onClick={() => navigate(-1)} 
        className={`absolute top-6 left-4 z-50 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white/10 transition-all duration-1000 ease-out shadow-[0_4px_15px_rgba(0,0,0,0.5)] ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
      >
        <IoMdArrowBack size={24} />
      </button>

      {/* ─── MAIN SCROLL CONTAINER ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[450px] h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 bg-black sm:shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:border-x border-white/10"
      >
        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.match(/\.(mp4|webm|ogg)$/i));
          const isActive = index === activeIndex;
          
          // 👇 NEW: This controls the cinematic slide-in for EACH post when it comes on screen
          const showUI = isRevealed && isActive;

          return (
            <div key={post._id || index} className="w-full h-[100dvh] snap-start snap-always relative bg-black overflow-hidden">
              
              {/* ─── TRUE FULL SCREEN MEDIA (Smooth Zoom-in Effect) ─── */}
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

              {/* HEAVY GRADIENT */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none transition-opacity duration-1000 ${showUI ? 'opacity-100' : 'opacity-0'}`} />

              {/* ─── BOTTOM LEFT: DYNAMIC SLIDE-IN HUD ─── */}
              <div className={`absolute bottom-16 left-4 right-[70px] z-20 flex flex-col gap-1 transition-all duration-700 ease-out delay-100 ${showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                
                {/* Clean User Profile */}
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

                {/* Property Title */}
                <h3 className="text-white font-bold text-[15px] leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2 mt-1">
                  {post.title || 'Exclusive Listing'}
                </h3>
                
                {/* Glowing Floating Price */}
                <p className="text-[15px] font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                  {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact for Price'}
                </p>

                {/* Description */}
                {post.description && (
                  <p className="text-gray-200 text-[13px] font-medium line-clamp-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] pr-2 leading-relaxed mt-0.5">
                    {post.description}
                  </p>
                )}
              </div>

              {/* ─── RIGHT SIDE: STAGGERED SLIDE-IN ICONS ─── */}
              <div className={`absolute bottom-16 right-3 z-20 flex flex-col items-center gap-6 transition-all duration-700 ease-out delay-200 ${showUI ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                
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
        })}
      </div>

    </div>
  );
}