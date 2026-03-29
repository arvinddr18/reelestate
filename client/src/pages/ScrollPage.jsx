import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdHeart, IoMdText, IoMdBookmark, IoMdShareAlt, IoMdArrowBack } from 'react-icons/io';
import api from '../services/api';

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // EXACT SAME WORKING LOGIC
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
        className="absolute top-6 left-4 z-50 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white/10 transition-all shadow-lg"
      >
        <IoMdArrowBack size={24} />
      </button>

      {/* ─── MAIN SCROLL CONTAINER ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[420px] h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 sm:border-x border-white/10 bg-black"
      >
        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.match(/\.(mp4|webm|ogg)$/i));
          const isActive = index === activeIndex;

          return (
            <div key={post._id || index} className="w-full h-screen snap-start snap-always relative bg-black">
              
              {/* MEDIA CONTENT */}
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

              {/* TALL GRADIENT FOR PREMIUM TEXT READABILITY */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent pointer-events-none" />

              {/* ─── BOTTOM LEFT: PREMIUM HUD ─── */}
              <div className="absolute bottom-6 left-4 right-[70px] z-20">
                
                {/* Clean User Profile Info */}
                <div className="flex items-center gap-3 mb-3 cursor-pointer w-max">
                  <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                    <img 
                      src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=0B0F19&color=fff`} 
                      alt="avatar" 
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-[15px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">@{post.author?.username || 'user'}</p>
                      <button className="px-2 py-0.5 border border-white/40 rounded-full text-[9px] font-black uppercase text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
                        Follow
                      </button>
                    </div>
                    <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {post.author?.role || 'Seller'}
                    </p>
                  </div>
                </div>

                {/* Property Title */}
                <h3 className="text-white font-black text-[22px] leading-tight mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2">
                  {post.title || 'Exclusive Listing'}
                </h3>
                
                {/* Glowing Price */}
                <p className="text-[#00F0FF] font-black text-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mb-2">
                  {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact for Price'}
                </p>

                {post.description && (
                  <p className="text-gray-200 text-sm font-medium line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pr-2">
                    {post.description}
                  </p>
                )}
              </div>

              {/* ─── RIGHT SIDE: CLEAN FLOATING ICONS ─── */}
              <div className="absolute bottom-6 right-3 z-20 flex flex-col items-center gap-6">
                
                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <IoMdHeart size={36} className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover:text-red-500 transition-colors" />
                  <span className="text-white text-[11px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{post.likesCount || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <IoMdText size={34} className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover:text-[#00F0FF] transition-colors" />
                  <span className="text-white text-[11px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{post.comments?.length || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                  <IoMdBookmark size={34} className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover:text-yellow-400 transition-colors" />
                  <span className="text-white text-[10px] font-bold uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Save</span>
                </button>

                {/* Share Button (Clean Glass Circle) */}
                <button className="flex flex-col items-center mt-2 group active:scale-90 transition-transform">
                  <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(0,0,0,0.4)] group-hover:bg-white group-hover:text-black transition-all">
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