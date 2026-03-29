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
            <div key={post._id || index} className="w-full h-screen snap-start snap-always relative bg-black overflow-hidden">
              
              {/* ─── AMBIENT BLUR BACKGROUND (Fills empty space for images) ─── */}
              {mediaUrl && !isVideo && (
                <img src={mediaUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[40px] scale-110" alt="blur" />
              )}

              {/* ─── MEDIA CONTENT ─── */}
              {isVideo && mediaUrl ? (
                <video 
                  src={mediaUrl} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  loop 
                  muted={!isActive} 
                  autoPlay={isActive} 
                  playsInline 
                />
              ) : mediaUrl ? (
                // 👇 THIS IS THE FIX: Changed 'object-cover' to 'object-contain'
                <img src={mediaUrl} alt="Post" className="absolute inset-0 w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">No Media</div>
              )}

              {/* TALL GRADIENT FOR PREMIUM TEXT READABILITY */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent pointer-events-none" />

              {/* ─── BOTTOM LEFT: PREMIUM HUD ─── */}
              <div className="absolute bottom-6 left-4 right-[80px] z-20">
                
                <div className="flex items-center gap-3 mb-4 p-1.5 pr-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-max shadow-lg cursor-pointer hover:bg-white/20 transition-colors">
                  <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF]">
                    <img 
                      src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=0B0F19&color=fff`} 
                      alt="avatar" 
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white font-bold text-[13px] leading-tight drop-shadow-md">@{post.author?.username || 'user'}</p>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-white/40 mx-1"></span>
                  <button className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                    Follow
                  </button>
                </div>

                <h3 className="text-white font-black text-2xl leading-tight mb-2 drop-shadow-lg line-clamp-2">
                  {post.title || 'Exclusive Listing'}
                </h3>
                
                <div className="inline-flex items-center bg-[#00F0FF]/10 border border-[#00F0FF]/30 backdrop-blur-md px-3 py-1 rounded-lg mb-2">
                  <p className="text-[#00F0FF] font-black text-xl drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                    {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact for Price'}
                  </p>
                </div>

                {post.description && (
                  <p className="text-gray-300 text-sm font-medium line-clamp-2 drop-shadow-md pr-4">
                    {post.description}
                  </p>
                )}
              </div>

              {/* ─── RIGHT SIDE: UNIFIED FROSTED DOCK ─── */}
              <div className="absolute bottom-8 right-3 z-20 flex flex-col items-center gap-6 bg-black/40 backdrop-blur-2xl border border-white/10 py-5 px-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                
                <button className="flex flex-col items-center gap-1 group w-12 active:scale-90 transition-transform">
                  <IoMdHeart size={28} className="text-white drop-shadow-lg group-hover:text-red-500 transition-colors" />
                  <span className="text-white text-[10px] font-bold mt-1 opacity-90">{post.likesCount || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group w-12 active:scale-90 transition-transform">
                  <IoMdText size={26} className="text-white drop-shadow-lg group-hover:text-[#00F0FF] transition-colors" />
                  <span className="text-white text-[10px] font-bold mt-1 opacity-90">{post.comments?.length || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group w-12 active:scale-90 transition-transform">
                  <IoMdBookmark size={26} className="text-white drop-shadow-lg group-hover:text-yellow-400 transition-colors" />
                  <span className="text-white text-[9px] font-bold mt-1 opacity-90 uppercase">Save</span>
                </button>

                <button className="flex flex-col items-center mt-1 group active:scale-90 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-[#00F0FF] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,240,255,0.5)] group-hover:bg-white transition-all">
                    <IoMdShareAlt size={24} className="ml-[-2px]" />
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