import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdHeart, IoMdBookmark, IoMdShareAlt, IoMdArrowBack, IoMdPin } from 'react-icons/io';
import api from '../services/api';

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [systemError, setSystemError] = useState(null); // 👈 NEW: Error Catcher

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts');
        let fetchedData = res?.data?.data || res?.data || [];
        if (!Array.isArray(fetchedData)) fetchedData = [];
        setPosts(fetchedData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setSystemError(`API Fetch Failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ─── SAFE INTERSECTION OBSERVER ───
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    try {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = Number(entry.target.getAttribute('data-index'));
              if (!isNaN(index)) setActiveIndex(index);
              
              const video = entry.target.querySelector('video');
              if (video) {
                video.play().catch(() => {}); 
              }
            } else {
              const video = entry.target.querySelector('video');
              if (video) video.pause();
            }
          });
        },
        { threshold: 0.6 } 
      );

      const postElements = document.querySelectorAll('.snap-post');
      postElements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    } catch (e) {
      console.error("Observer Error:", e);
    }
  }, [posts]);

  // ─── PARANOID MEDIA RESOLVER ───
  const resolveMediaUrl = (source) => {
    try {
      if (!source) return '';
      let urlStr = '';
      if (typeof source === 'object' && source.url) urlStr = String(source.url);
      else if (typeof source === 'string') urlStr = source;
      else return '';

      if (urlStr.startsWith('http') || urlStr.startsWith('data:')) return urlStr;
      const base = import.meta.env.VITE_API_URL || '';
      const cleanBase = base.endsWith('/api') ? base.replace('/api', '') : base;
      return `${cleanBase}${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
    } catch (err) {
      return '';
    }
  };

  const isVideoCheck = (url, type) => {
    try {
      if (type === 'video') return true;
      if (!url) return false;
      const lowerUrl = String(url).toLowerCase();
      return lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('.ogg');
    } catch (e) {
      return false;
    }
  };

  // 1. IF A SYSTEM ERROR OCCURRED (Shows red screen instead of black)
  if (systemError) {
    return (
      <div className="h-screen w-full bg-red-900 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-white text-3xl font-black mb-4">CRITICAL SYSTEM ERROR</h1>
        <p className="text-white font-mono">{systemError}</p>
        <button onClick={() => navigate(-1)} className="mt-8 bg-white text-red-900 px-6 py-2 rounded-full font-bold">Go Back</button>
      </div>
    );
  }

  // 2. SAFE LOADING STATE
  if (loading) {
    return (
      <div className="h-screen w-full bg-[#05070A] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0057FF] border-t-[#00F0FF] rounded-full animate-spin mb-4" />
        <span className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase animate-pulse">Syncing...</span>
      </div>
    );
  }

  // 3. SAFE EMPTY STATE
  if (!posts || posts.length === 0) {
    return (
      <div className="h-screen w-full bg-[#05070A] flex flex-col items-center justify-center p-6 text-center relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 w-12 h-12 rounded-full bg-[#151A25] border border-white/10 flex items-center justify-center text-white hover:text-[#00F0FF] transition-colors z-50">
          <IoMdArrowBack size={24} />
        </button>
        <div className="w-24 h-24 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-4xl mb-6 shadow-lg">🎬</div>
        <h2 className="text-2xl font-black text-white mb-2">No Streams Found</h2>
        <p className="text-sm text-gray-400 font-bold max-w-xs">There are no posts available to scroll right now.</p>
      </div>
    );
  }

  // 4. CALCULATE MAIN VARIABLES SAFELY
  let activePost = null;
  let activeMediaUrl = '';
  let isActiveVideo = false;

  try {
    activePost = posts[activeIndex] || posts[0];
    activeMediaUrl = activePost ? resolveMediaUrl(activePost.images?.[0]?.url || activePost.image) : '';
    isActiveVideo = isVideoCheck(activeMediaUrl, activePost?.mediaType);
  } catch (err) {
    setSystemError(`Render Variable Crash: ${err.message}`);
    return null;
  }

  return (
    <div className="h-screen w-full bg-[#05070A] relative overflow-hidden flex justify-center">
      
      {/* ─── DESKTOP AMBIENT VOID ─── */}
      <div className="absolute inset-0 hidden md:block z-0 pointer-events-none overflow-hidden bg-[#05070A]">
        {activeMediaUrl && !isActiveVideo && (
          <img src={activeMediaUrl} alt="ambient" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[80px] scale-125 transition-opacity duration-1000" />
        )}
      </div>

      {/* ─── GLOBAL TOP BAR ─── */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 md:p-8 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 rounded-full bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:text-[#00F0FF] transition-all shadow-lg pointer-events-auto"
        >
          <IoMdArrowBack size={24} />
        </button>
      </div>

      {/* ─── THE SNAP SCROLL CONTAINER ─── */}
      <div className="w-full max-w-[450px] h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 md:py-10">
        {posts.map((post, index) => {
          // Wrapped every post in its own safety net
          try {
            if (!post) return null;

            const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
            const isVideo = isVideoCheck(mediaUrl, post.mediaType);
            const isActive = index === activeIndex;

            return (
              <div 
                key={post._id || `post-${index}`} 
                data-index={index}
                className="snap-post w-full h-screen md:h-[calc(100vh-80px)] snap-start snap-always relative flex items-center justify-center md:px-4"
              >
                <div className={`w-full h-full relative overflow-hidden md:rounded-[40px] bg-[#151A25] transition-all duration-500 ${isActive ? 'md:scale-100 md:border border-white/10 md:shadow-[0_0_40px_rgba(0,240,255,0.1)]' : 'md:scale-95 md:opacity-50'}`}>
                  
                  {/* MEDIA */}
                  {isVideo && mediaUrl ? (
                    <video src={mediaUrl} loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    mediaUrl ? (
                      <img src={mediaUrl} alt="Post" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-bold text-sm">No Signal</div>
                    )
                  )}

                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

                  {/* BOTTOM LEFT: DATA HUD */}
                  <div className="absolute bottom-6 md:bottom-10 left-4 md:left-8 right-[80px] z-20 pointer-events-auto">
                    <div className={`transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                      
                      <div className="flex items-center gap-3 mb-4 w-max">
                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] p-[2px]">
                          <img 
                            src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'User'}&background=0B0F19&color=00F0FF`} 
                            alt="avatar" 
                            className="w-full h-full rounded-full object-cover border border-[#0B0F19]"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-black text-sm drop-shadow-md">@{post.author?.username || 'user'}</span>
                        </div>
                      </div>

                      <div className="bg-[#151A25]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#00F0FF]" />
                        <h2 className="text-lg font-black text-white mb-1 truncate">{post.title || 'Listing'}</h2>
                        
                        {post.location && (
                          <p className="flex items-center gap-1.5 text-gray-400 text-xs font-bold mb-3">
                            <IoMdPin className="text-[#00F0FF]" /> {post.location}
                          </p>
                        )}
                        
                        <div className="inline-flex items-center gap-2 bg-[#0B0F19] border border-[#00F0FF]/30 px-3 py-1.5 rounded-lg">
                          <span className="text-[10px] text-gray-500 font-black uppercase">Price</span>
                          <span className="text-sm font-black text-[#00F0FF]">
                            {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'N/A'}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* RIGHT ALIGNED: COMMAND PILLAR */}
                  <div className="absolute bottom-6 md:bottom-10 right-2 md:right-4 z-20 pointer-events-auto">
                    <div className={`flex flex-col gap-4 bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 p-2 md:p-3 rounded-full transition-all duration-500 ${isActive ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                      
                      <button className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-[#151A25] flex items-center justify-center text-white">
                          <IoMdHeart size={20} />
                        </div>
                        <span className="text-[9px] font-black text-white">{post.likesCount || '0'}</span>
                      </button>

                      <button className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-[#151A25] flex items-center justify-center text-white">
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-[9px] font-black text-white">{post.comments?.length || '0'}</span>
                      </button>

                      <button className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-[#151A25] flex items-center justify-center text-white">
                          <IoMdBookmark size={20} />
                        </div>
                        <span className="text-[9px] font-black text-white">Save</span>
                      </button>

                      <button className="flex flex-col items-center gap-1 mt-2">
                        <div className="w-10 h-10 rounded-full bg-[#00F0FF] flex items-center justify-center text-[#0B0F19]">
                          <IoMdShareAlt size={20} />
                        </div>
                      </button>

                    </div>
                  </div>

                </div>
              </div>
            );
          } catch (postError) {
            // If a specific post breaks, it will just skip it instead of crashing the whole page
            return null; 
          }
        })}
      </div>

    </div>
  );
}