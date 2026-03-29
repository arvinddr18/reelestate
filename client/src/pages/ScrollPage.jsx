import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 100% SAFE IMPORTS - Unchanged
import { IoMdHeart, IoMdText, IoMdBookmark, IoMdShareAlt, IoMdArrowBack } from 'react-icons/io';
import api from '../services/api';

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

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

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#05070A] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#0057FF] border-t-[#00F0FF] rounded-full animate-spin mb-4" />
        <span className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase animate-pulse">Decrypting Feed...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-screen w-full bg-[#05070A] flex flex-col items-center justify-center text-white relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50">
          <IoMdArrowBack size={24} />
        </button>
        <h2 className="text-2xl font-black mb-4">No Streams Found</h2>
      </div>
    );
  }

  // Get active media for the desktop ambient background
  const activePost = posts[activeIndex] || posts[0];
  const activeMediaUrl = resolveMediaUrl(activePost?.images?.[0]?.url || activePost?.image);
  const isBgVideo = activeMediaUrl && typeof activeMediaUrl === 'string' && activeMediaUrl.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="h-screen w-full bg-[#05070A] relative flex justify-center overflow-hidden">
      
      {/* ─── DESKTOP AMBIENT AURA (Hidden on mobile) ─── */}
      <div className="absolute inset-0 hidden md:block z-0 pointer-events-none transition-all duration-1000">
        {activeMediaUrl && !isBgVideo && (
          <img src={activeMediaUrl} className="w-full h-full object-cover blur-[80px] opacity-30 scale-125" alt="aura" />
        )}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl" />
      </div>

      {/* ─── FLOATING BACK BUTTON ─── */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-4 md:left-8 z-50 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all shadow-lg"
      >
        <IoMdArrowBack size={24} />
      </button>

      {/* ─── MAIN SCROLL CONTAINER ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[450px] h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 md:shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-black"
      >
        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.match(/\.(mp4|webm|ogg)$/i));
          const isActive = index === activeIndex;

          return (
            <div key={post._id || index} className="w-full h-screen snap-start snap-always relative">
              
              {/* MEDIA */}
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
                <img src={mediaUrl} alt="Post" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">No Media</div>
              )}

              {/* TALL GRADIENT OVERLAY (Ensures text pops heavily) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

              {/* ─── BOTTOM LEFT: PREMIUM HUD ─── */}
              <div className="absolute bottom-6 left-4 right-[80px] z-20">
                
                {/* Frosted Glass User Pill */}
                <div className="flex items-center gap-3 mb-4 p-1.5 pr-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-max shadow-lg cursor-pointer hover:bg-white/20 transition-colors">
                  <img 
                    src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=00F0FF&color=000`} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full object-cover border border-white/40"
                  />
                  <div className="flex flex-col justify-center">
                    <p className="text-white font-bold text-[13px] leading-tight drop-shadow-md">@{post.author?.username || 'user'}</p>
                  </div>
                  <button className="ml-2 px-3 py-1 bg-[#00F0FF] text-black text-[9px] font-black uppercase rounded-full tracking-widest hover:scale-105 transition-transform">
                    Follow
                  </button>
                </div>

                {/* Property Title */}
                <h3 className="text-white font-black text-xl leading-tight mb-1 line-clamp-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  {post.title || 'Exclusive Listing'}
                </h3>
                
                {/* Glowing Neon Price */}
                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#0057FF] drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] mb-2">
                  {post.price ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Market Price'}
                </p>

                {post.description && (
                  <p className="text-gray-200 text-sm line-clamp-2 font-medium drop-shadow-md pr-4">
                    {post.description}
                  </p>
                )}
              </div>

              {/* ─── RIGHT SIDE: FROSTED GLASS ORBS ─── */}
              <div className="absolute bottom-8 right-3 z-20 flex flex-col gap-5 items-center">
                
                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white group-hover:bg-red-500/20 group-hover:border-red-500/50 group-hover:text-red-500 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                    <IoMdHeart size={22} />
                  </div>
                  <span className="text-white text-[10px] font-bold drop-shadow-md">{post.likesCount || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white group-hover:bg-[#00F0FF]/20 group-hover:border-[#00F0FF]/50 group-hover:text-[#00F0FF] transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                    <IoMdText size={22} />
                  </div>
                  <span className="text-white text-[10px] font-bold drop-shadow-md">{post.comments?.length || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white group-hover:bg-yellow-400/20 group-hover:border-yellow-400/50 group-hover:text-yellow-400 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                    <IoMdBookmark size={22} />
                  </div>
                  <span className="text-white text-[10px] font-bold drop-shadow-md">Save</span>
                </button>

                <button className="flex flex-col items-center mt-2 group active:scale-90 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,240,255,0.5)] border border-white/40 group-hover:scale-110 transition-all">
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