import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// EXACT SAME IMPORTS - No new icons added
import { IoMdHeart, IoMdText, IoMdBookmark, IoMdShareAlt, IoMdArrowBack } from 'react-icons/io';
import api from '../services/api';

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // EXACT SAME LOGIC
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
         <div className="w-10 h-10 border-4 border-[#0057FF] border-t-[#00F0FF] rounded-full animate-spin mb-4" />
         <span className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase animate-pulse">Loading Streams...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-screen w-full bg-[#05070A] flex flex-col items-center justify-center text-white">
        <h2 className="text-xl font-bold mb-4">No posts found</h2>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-800 rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black relative flex justify-center">
      
      {/* ─── PREMIUM BACK BUTTON ─── */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-4 z-50 p-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-[#00F0FF]/20 hover:text-[#00F0FF] transition-all shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
      >
        <IoMdArrowBack size={24} />
      </button>

      {/* ─── MAIN SCROLL CONTAINER ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[450px] h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 bg-black sm:shadow-[0_0_50px_rgba(0,240,255,0.05)]"
      >
        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || mediaUrl.match(/\.(mp4|webm|ogg)$/i);
          const isActive = index === activeIndex;

          return (
            <div key={post._id || index} className="w-full h-screen snap-start snap-always relative bg-[#05070A]">
              
              {/* 1. EDGE-TO-EDGE MEDIA */}
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

              {/* 2. HEAVY BOTTOM GRADIENT (Makes text pop) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

              {/* 3. PREMIUM BOTTOM-LEFT DATA HUD */}
              <div className="absolute bottom-6 left-4 right-[70px] z-20">
                
                {/* Modern User Profile Pill */}
                <div className="flex items-center gap-3 mb-4 p-1.5 pr-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full w-max shadow-lg cursor-pointer">
                  <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF]">
                    <img 
                      src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=0B0F19&color=00F0FF`} 
                      alt="avatar" 
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white font-black text-sm drop-shadow-md">@{post.author?.username || 'user'}</p>
                    <p className="text-[#00F0FF] text-[9px] font-black uppercase tracking-widest">{post.author?.role || 'Seller'}</p>
                  </div>
                </div>

                {/* Property Title */}
                <h3 className="text-white font-black text-xl leading-tight mb-1 line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {post.title || 'Untitled Property'}
                </h3>
                
                {/* Glowing Price Tag */}
                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.4)] mb-3">
                  {post.price ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact for Price'}
                </p>

                {post.description && (
                  <p className="text-gray-300 text-sm line-clamp-2 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {post.description}
                  </p>
                )}
              </div>

              {/* 4. PREMIUM RIGHT-SIDE ICONS (Floating without dark circles) */}
              <div className="absolute bottom-6 right-2 z-20 flex flex-col gap-6 items-center">
                
                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <IoMdHeart size={36} className="text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)] group-hover:text-red-500 transition-colors" />
                  <span className="text-white text-xs font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{post.likesCount || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <IoMdText size={34} className="text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)] group-hover:text-[#00F0FF] transition-colors" />
                  <span className="text-white text-xs font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{post.comments?.length || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <IoMdBookmark size={34} className="text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)] group-hover:text-yellow-400 transition-colors" />
                  <span className="text-white text-[10px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Save</span>
                </button>

                <button className="flex flex-col items-center gap-1 mt-2 group active:scale-90 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] flex items-center justify-center text-white shadow-[0_5px_20px_rgba(0,240,255,0.4)] border-2 border-transparent group-hover:border-white transition-all">
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