import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 100% SAFE IMPORTS: Only using the exact 5 icons from your working code!
import { IoMdHeart, IoMdText, IoMdBookmark, IoMdShareAlt, IoMdArrowBack } from 'react-icons/io';
import api from '../services/api';

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts');
        if (isMounted) {
          const fetchedData = res.data?.data || res.data || [];
          setPosts(Array.isArray(fetchedData) ? fetchedData : []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setPosts([]);
          setLoading(false);
        }
      }
    };
    fetchPosts();
    return () => { isMounted = false; };
  }, []);

  const handleScroll = (e) => {
    const container = e.target;
    const clientHeight = container.clientHeight || 1;
    const index = Math.round(container.scrollTop / clientHeight);
    if (index !== activeIndex && index >= 0 && index < posts.length) {
      setActiveIndex(index);
    }
  };

  // Safe Media Resolver
  const resolveMediaUrl = (source) => {
    if (!source) return '';
    let url = '';
    if (typeof source === 'object' && source.url) url = source.url;
    else if (typeof source === 'string') url = source;
    
    if (typeof url !== 'string' || !url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    const base = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // 1. SAFE LOADING STATE
  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0057FF] border-t-[#00F0FF] rounded-full animate-spin mb-4" />
        <span className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase animate-pulse">Loading Feed...</span>
      </div>
    );
  }

  // 2. SAFE EMPTY STATE
  if (posts.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center p-6 text-center relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50">
          <IoMdArrowBack size={24} />
        </button>
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-6">🎬</div>
        <h2 className="text-2xl font-black text-white mb-2">No Streams Found</h2>
      </div>
    );
  }

  const activePost = posts[activeIndex] || posts[0];
  const activeMediaUrl = resolveMediaUrl(activePost?.images?.[0]?.url || activePost?.image);
  const isBgVideo = typeof activeMediaUrl === 'string' && (activeMediaUrl.includes('.mp4') || activeMediaUrl.includes('.webm') || activeMediaUrl.includes('.ogg'));

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden flex justify-center">
      
      {/* ─── DESKTOP AMBIENT BACKGROUND ─── */}
      <div className="absolute inset-0 hidden md:block z-0 pointer-events-none overflow-hidden">
        {activeMediaUrl && !isBgVideo && (
          <img src={activeMediaUrl} alt="ambient" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[100px] scale-125 transition-opacity duration-1000" />
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />
      </div>

      {/* ─── TOP BACK BUTTON (Floating over video) ─── */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 md:p-8 flex items-center justify-between pointer-events-none">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all pointer-events-auto shadow-lg">
          <IoMdArrowBack size={24} />
        </button>
        <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg pointer-events-auto flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
           <span className="text-[10px] font-black tracking-widest text-white uppercase drop-shadow-md">Live</span>
        </div>
      </div>

      {/* ─── MAIN EDGE-TO-EDGE SCROLL CONTAINER ─── */}
      <div 
        onScroll={handleScroll} 
        className="w-full sm:max-w-[450px] h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 bg-black sm:shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        {posts.map((post, index) => {
          if (!post) return null;
          
          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || (typeof mediaUrl === 'string' && mediaUrl.match(/\.(mp4|webm|ogg)$/i));
          const isActive = index === activeIndex;

          return (
            <div key={post._id || index} className="w-full h-screen snap-start snap-always relative">
              
              {/* TRUE FULL SCREEN MEDIA */}
              <div className="w-full h-full relative overflow-hidden bg-black">
                {isVideo && mediaUrl ? (
                  <video 
                    src={mediaUrl} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    loop 
                    muted={!isActive} 
                    autoPlay={isActive} 
                    playsInline 
                  />
                ) : (
                  mediaUrl ? (
                    <img src={mediaUrl} alt="Post" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50 font-bold">No Signal</div>
                  )
                )}

                {/* HEAVY BOTTOM GRADIENT FOR TEXT READABILITY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 pointer-events-none" />
              </div>

              {/* ─── BOTTOM LEFT HUD ─── */}
              <div className="absolute bottom-6 left-4 right-[70px] z-20 flex flex-col gap-2 pointer-events-auto">
                
                {/* Modern User Profile Row */}
                <div className="flex items-center gap-3 mb-2 cursor-pointer w-max">
                  <div className="relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_2px_10px_rgba(0,240,255,0.3)]">
                    <img src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=0B0F19&color=fff`} alt="avatar" className="w-full h-full rounded-full object-cover border-2 border-black" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-[15px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-2">
                      @{post.author?.username || 'user'}
                      <button className="px-2 py-0.5 border border-white/40 rounded-full text-[9px] font-black uppercase text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
                        Follow
                      </button>
                    </span>
                    <span className="text-gray-300 text-[11px] font-medium drop-shadow-md">{post.author?.role || 'Seller'}</span>
                  </div>
                </div>

                {/* Location Badge (Using pure SVG instead of imported icon) */}
                {post.location && (
                  <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md w-max shadow-sm">
                    <svg className="w-3 h-3 text-[#00F0FF]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white text-[10px] font-bold tracking-wide drop-shadow-md">{post.location}</span>
                  </div>
                )}

                <h3 className="text-white font-black text-xl leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] line-clamp-2">
                  {post.title || 'Exclusive Listing'}
                </h3>
                
                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF] drop-shadow-[0_2px_10px_rgba(0,240,255,0.5)] mb-1">
                  {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Market Value'}
                </p>

                {post.description && (
                  <p className="text-gray-200 text-sm font-medium line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {post.description}
                  </p>
                )}
              </div>

              {/* ─── RIGHT ACTION ICONS (Floating) ─── */}
              <div className="absolute bottom-6 right-2 z-20 flex flex-col gap-6 items-center pointer-events-auto">
                
                <button className="flex flex-col items-center gap-1 group">
                  <IoMdHeart size={34} className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover:text-red-500 transition-colors group-active:scale-90" />
                  <span className="text-white text-xs font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{post.likesCount || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                  <IoMdText size={32} className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover:text-[#00F0FF] transition-colors group-active:scale-90" />
                  <span className="text-white text-xs font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{post.comments?.length || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                  <IoMdBookmark size={32} className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover:text-yellow-400 transition-colors group-active:scale-90" />
                  <span className="text-white text-[10px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Save</span>
                </button>

                <button className="flex flex-col items-center mt-2 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-[0_5px_15px_rgba(0,0,0,0.5)] group-hover:bg-[#00F0FF] group-hover:text-black group-hover:border-transparent transition-all group-active:scale-90">
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