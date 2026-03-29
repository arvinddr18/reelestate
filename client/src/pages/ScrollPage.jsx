import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 100% SAFE IMPORTS: Only using your proven working icons
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

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#00F0FF] rounded-full animate-spin mb-4" />
        <span className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase animate-pulse">Connecting to Matrix...</span>
      </div>
    );
  }

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
          <img src={activeMediaUrl} alt="ambient" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[120px] scale-150 transition-opacity duration-1000" />
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />
        {/* Subtle dot matrix overlay */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      {/* ─── TOP BAR (Ultra Minimal) ─── */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 md:p-8 flex items-center justify-between pointer-events-none">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all pointer-events-auto shadow-[0_4px_20px_rgba(0,0,0,0.5)] group">
          <IoMdArrowBack size={22} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="px-5 py-2 rounded-full bg-black/30 backdrop-blur-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] pointer-events-auto flex items-center gap-2.5">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
           <span className="text-[10px] font-black tracking-widest text-white uppercase opacity-90">Live</span>
        </div>
      </div>

      {/* ─── MAIN EDGE-TO-EDGE SCROLL CONTAINER ─── */}
      <div 
        onScroll={handleScroll} 
        className="w-full sm:max-w-[420px] h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 bg-black sm:shadow-[0_0_80px_rgba(0,0,0,0.9)]"
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
                    <div className="absolute inset-0 flex items-center justify-center text-white/30 font-medium text-sm">No Signal</div>
                  )
                )}

                {/* Massive smooth gradient for flawless text readability */}
                <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-[#05070A] via-[#05070A]/60 to-transparent pointer-events-none" />
              </div>

              {/* ─── BOTTOM LEFT: THE DATA CONSOLE ─── */}
              <div className="absolute bottom-8 left-5 right-[80px] z-20 flex flex-col gap-3 pointer-events-auto">
                
                {/* Sleek Frosted User Pill */}
                <div className="flex items-center gap-2.5 p-1 pr-5 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full w-max shadow-[0_4px_15px_rgba(0,0,0,0.3)] cursor-pointer hover:bg-black/60 transition-colors">
                  <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF]">
                    <img src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=000&color=fff`} alt="avatar" className="w-full h-full rounded-full object-cover border-2 border-black" />
                  </div>
                  <span className="text-white font-bold text-[14px] tracking-wide">@{post.author?.username || 'user'}</span>
                  <span className="w-1 h-1 rounded-full bg-white/30 mx-1"></span>
                  {/* Glowing text button instead of solid block */}
                  <button className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                    Follow
                  </button>
                </div>

                {/* Title & Price Block */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <h3 className="text-white font-black text-[22px] leading-tight drop-shadow-lg line-clamp-2">
                    {post.title || 'Classified Asset'}
                  </h3>
                  
                  <div className="flex items-center gap-3">
                    {/* Modern App Tag Price */}
                    <div className="inline-flex items-center bg-[#00F0FF]/10 border border-[#00F0FF]/30 backdrop-blur-md px-3 py-1 rounded-lg">
                      <span className="text-[#00F0FF] font-black text-xl drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                        {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact'}
                      </span>
                    </div>
                    
                    {/* Location Badge with pure SVG */}
                    {post.location && (
                      <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/5">
                        <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-200 text-[11px] font-bold tracking-wide">{post.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {post.description && (
                  <p className="text-gray-300 text-sm font-medium line-clamp-2 mt-1 drop-shadow-md pr-4 leading-relaxed">
                    {post.description}
                  </p>
                )}
              </div>

              {/* ─── RIGHT SIDE: UNIFIED ACTION DOCK ─── */}
              <div className="absolute bottom-8 right-3 z-20 flex flex-col items-center gap-6 bg-black/40 backdrop-blur-2xl border border-white/10 py-5 px-1.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)] pointer-events-auto">
                
                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform w-12">
                  <IoMdHeart size={28} className="text-white drop-shadow-lg group-hover:text-red-500 transition-colors" />
                  <span className="text-white text-[11px] font-bold mt-1 opacity-90">{post.likesCount || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform w-12">
                  <IoMdText size={26} className="text-white drop-shadow-lg group-hover:text-[#00F0FF] transition-colors" />
                  <span className="text-white text-[11px] font-bold mt-1 opacity-90">{post.comments?.length || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform w-12">
                  <IoMdBookmark size={26} className="text-white drop-shadow-lg group-hover:text-yellow-400 transition-colors" />
                  <span className="text-white text-[10px] font-bold mt-1 opacity-90 uppercase">Save</span>
                </button>

                {/* Cyan Glowing Action Button */}
                <button className="flex flex-col items-center mt-1 group active:scale-90 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-[#00F0FF] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,240,255,0.5)] group-hover:bg-white group-hover:shadow-[0_0_25px_rgba(255,255,255,0.8)] transition-all">
                    <IoMdShareAlt size={22} className="ml-[-2px]" />
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