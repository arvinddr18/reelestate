import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#0057FF] border-t-[#00F0FF] rounded-full animate-spin mb-4" />
        <span className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase animate-pulse">Loading Feed...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50">
          <IoMdArrowBack size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">No posts found</h2>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black relative flex justify-center">
      
      {/* ─── FLOATING BACK BUTTON ─── */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-4 z-50 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white/10 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
      >
        <IoMdArrowBack size={24} />
      </button>

      {/* ─── MAIN SCROLL CONTAINER ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[450px] h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 bg-black sm:shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:border-x border-white/10"
      >
        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.match(/\.(mp4|webm|ogg)$/i));
          const isActive = index === activeIndex;

          return (
            <div key={post._id || index} className="w-full h-screen snap-start snap-always relative bg-black overflow-hidden">
              
              {/* ─── MEDIA DISPLAY WITH SEAMLESS BLUR BACKGROUND ─── */}
              <div className="absolute inset-0 w-full h-full">
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
                  <>
                    {/* Layer 1: Blurred background fills the whole screen so no black bars exist */}
                    <img src={mediaUrl} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-60 scale-125" alt="blur-bg" />
                    {/* Layer 2: Actual image fits perfectly in the center without cutting edges */}
                    <img src={mediaUrl} alt="Post" className="absolute inset-0 w-full h-full object-contain z-10" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">No Media</div>
                )}
              </div>

              {/* TALL GRADIENT FOR PREMIUM TEXT READABILITY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />

              {/* ─── BOTTOM LEFT: PREMIUM GLASS HUD ─── */}
              <div className="absolute bottom-6 left-4 right-[70px] z-20">
                
                {/* Clean User Profile Pill */}
                <div className="flex items-center gap-3 mb-3 cursor-pointer w-max p-1.5 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:bg-white/20 transition-all">
                  <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF]">
                    <img 
                      src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=0B0F19&color=fff`} 
                      alt="avatar" 
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white font-bold text-[14px] leading-tight drop-shadow-md">@{post.author?.username || 'user'}</p>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-white/50 mx-1"></span>
                  <button className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,240,255,0.4)] hover:text-white transition-colors">
                    Follow
                  </button>
                </div>

                {/* Property Title */}
                <h3 className="text-white font-black text-[22px] leading-tight mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2">
                  {post.title || 'Exclusive Listing'}
                </h3>
                
                {/* Glowing Glass Price Box */}
                <div className="inline-flex items-center bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-1.5 rounded-lg mb-2 shadow-lg">
                  <p className="text-[#00F0FF] font-black text-xl drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                    {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact for Price'}
                  </p>
                </div>

                {post.description && (
                  <p className="text-gray-200 text-[13px] font-medium line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pr-2 leading-relaxed">
                    {post.description}
                  </p>
                )}
              </div>

              {/* ─── RIGHT SIDE: CLEAN FLOATING ICONS (NO COLUMN) ─── */}
              <div className="absolute bottom-6 right-3 z-20 flex flex-col items-center gap-6">
                
                {/* Notice: No background box here. Just pure floating icons with heavy drop shadows */}
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

                {/* Share Button is a glowing glass circle */}
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