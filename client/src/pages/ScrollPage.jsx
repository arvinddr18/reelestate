import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdHeart, IoMdText, IoMdBookmark, IoMdShareAlt, IoMdArrowBack, IoMdPin } from 'react-icons/io';
import api from '../services/api';

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts');
        setPosts(res.data.data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ─── INTERSECTION OBSERVER TO TRACK ACTIVE VIDEO ───
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            setActiveIndex(index);
            // Play video if it's a video tag
            const video = entry.target.querySelector('video');
            if (video) video.play();
          } else {
            // Pause video when out of view
            const video = entry.target.querySelector('video');
            if (video) video.pause();
          }
        });
      },
      { threshold: 0.6 } // Trigger when 60% of the post is visible
    );

    const postElements = document.querySelectorAll('.snap-start');
    postElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [posts]);

  // Helper to resolve media URLs securely
  const resolveMediaUrl = (source) => {
    if (!source) return null;
    if (typeof source === 'object' && source.url) source = source.url;
    if (typeof source !== 'string') return null;
    if (source.startsWith('http') || source.startsWith('data:')) return source;
    const base = import.meta.env.VITE_API_URL || '';
    const cleanBase = base.endsWith('/api') ? base.replace('/api', '') : base;
    return `${cleanBase}${source.startsWith('/') ? '' : '/'}${source}`;
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#05070A] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[2px] border-dashed border-[#00F0FF]/40 animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border-[2px] border-dotted border-[#0057FF]/60 animate-[spin_2s_linear_infinite_reverse]" />
          <span className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase animate-pulse">Syncing</span>
        </div>
      </div>
    );
  }

  // Get the background image of the currently active post for the ambient desktop glow
  const activeMedia = posts[activeIndex]?.images?.[0]?.url || resolveMediaUrl(posts[activeIndex]?.image);

  return (
    <div className="h-screen w-full bg-[#05070A] relative overflow-hidden flex justify-center">
      
      {/* ─── DESKTOP AMBIENT VOID (Only visible on wide screens) ─── */}
      <div className="absolute inset-0 hidden md:block z-0 pointer-events-none overflow-hidden">
        {activeMedia && (
          <>
            <img src={activeMedia} alt="ambient" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[100px] scale-125 transition-all duration-1000" />
            <div className="absolute inset-0 bg-[#05070A]/80 backdrop-blur-3xl" />
          </>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      </div>

      {/* ─── GLOBAL TOP BAR ─── */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 md:p-8 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 rounded-full bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:text-[#00F0FF] hover:border-[#00F0FF]/50 transition-all shadow-[0_0_20px_rgba(0,0,0,0.8)] pointer-events-auto active:scale-95 group"
        >
          <IoMdArrowBack size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="px-6 py-2 rounded-full bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 shadow-lg pointer-events-auto flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
           <span className="text-[10px] font-black tracking-widest text-white uppercase">Live Stream</span>
        </div>
      </div>

      {/* ─── THE SNAP SCROLL CONTAINER ─── */}
      <div 
        ref={scrollRef}
        className="w-full max-w-[500px] h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 md:py-10"
      >
        {posts.map((post, index) => {
          const mediaUrl = post.images?.[0]?.url || resolveMediaUrl(post.image);
          const isVideo = post.mediaType === 'video' || (mediaUrl && mediaUrl.match(/\.(mp4|webm|ogg)$/i));
          const isActive = index === activeIndex;

          return (
            <div 
              key={post._id} 
              data-index={index}
              className="w-full h-screen md:h-[calc(100vh-80px)] snap-start snap-always relative flex items-center justify-center md:px-4"
            >
              {/* ── THE MEDIA SLAB ── */}
              <div className={`w-full h-full relative overflow-hidden md:rounded-[40px] transition-all duration-700 ${isActive ? 'md:border border-white/10 md:shadow-[0_0_50px_rgba(0,240,255,0.15)] md:scale-100' : 'md:scale-95 md:opacity-50'}`}>
                
                {isVideo ? (
                  <video 
                    src={mediaUrl} 
                    loop 
                    muted 
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={mediaUrl} 
                    alt={post.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Cyberpunk Vignette & Scanning Line overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#05070A]/90 pointer-events-none" />
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent opacity-30 animate-[scan_4s_ease-in-out_infinite] pointer-events-none" />
                )}

                {/* ── THE DATA HUD (BOTTOM LEFT) ── */}
                <div className="absolute bottom-6 md:bottom-10 left-4 md:left-8 right-[80px] z-20 pointer-events-auto">
                  <div className={`transition-all duration-700 delay-100 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    
                    {/* User ID Card */}
                    <div className="flex items-center gap-3 mb-4 group cursor-pointer w-max">
                      <div className="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all">
                        <img 
                          src={resolveMediaUrl(post.author?.profilePhoto) || `https://i.pravatar.cc/150?u=${post.author?._id}`} 
                          alt="avatar" 
                          className="w-full h-full rounded-full object-cover border-2 border-[#0B0F19]"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-black text-[15px] drop-shadow-md flex items-center gap-2">
                          @{post.author?.username || 'user'}
                          <span className="bg-[#00F0FF]/20 text-[#00F0FF] text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-sm border border-[#00F0FF]/30">Verified</span>
                        </span>
                        <span className="text-gray-300 text-[11px] font-bold">{post.author?.role || 'Seller Node'}</span>
                      </div>
                    </div>

                    {/* Property Data Plate */}
                    <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/10 p-4 rounded-3xl rounded-tl-sm shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0057FF] to-[#00F0FF]" />
                      
                      <h2 className="text-xl font-black text-white mb-1 tracking-tight drop-shadow-md truncate">
                        {post.title || 'Encrypted Listing'}
                      </h2>
                      
                      {post.location && (
                        <p className="flex items-center gap-1.5 text-gray-300 text-xs font-bold mb-3">
                          <IoMdPin className="text-[#00F0FF]" /> {post.location}
                        </p>
                      )}
                      
                      {/* Cyber Price Tag */}
                      <div className="inline-flex items-center gap-3 bg-[#0B0F19]/80 border border-[#00F0FF]/30 px-4 py-2 rounded-xl">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Value</span>
                        <span className="text-lg font-black text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                          {post.price ? `₹${post.price.toLocaleString('en-IN')}` : 'Market Price'}
                        </span>
                      </div>

                      {post.description && (
                        <p className="text-sm text-gray-300 mt-4 line-clamp-2 leading-relaxed">
                          {post.description}
                        </p>
                      )}
                    </div>

                  </div>
                </div>

                {/* ── THE COMMAND PILLAR (RIGHT ALIGNED) ── */}
                <div className="absolute bottom-6 md:bottom-10 right-2 md:right-4 z-20 pointer-events-auto">
                  <div className={`flex flex-col gap-4 bg-[#0B0F19]/40 backdrop-blur-2xl border border-white/5 p-2 md:p-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-700 delay-200 ${isActive ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                    
                    {/* Action 1: Core (Like) */}
                    <button className="flex flex-col items-center gap-1 group active:scale-95 transition-all">
                      <div className="w-12 h-12 rounded-full bg-[#151A25]/80 border border-white/10 flex items-center justify-center group-hover:border-red-500/50 group-hover:bg-red-500/10 transition-colors shadow-inner">
                        <IoMdHeart className="text-white group-hover:text-red-500 transition-colors drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" size={24} />
                      </div>
                      <span className="text-[10px] font-black text-white drop-shadow-md">{post.likesCount || '0'}</span>
                    </button>

                    {/* Action 2: Comms (Comment) */}
                    <button className="flex flex-col items-center gap-1 group active:scale-95 transition-all">
                      <div className="w-12 h-12 rounded-full bg-[#151A25]/80 border border-white/10 flex items-center justify-center group-hover:border-[#00F0FF]/50 group-hover:bg-[#00F0FF]/10 transition-colors shadow-inner">
                        <IoMdText className="text-white group-hover:text-[#00F0FF] transition-colors drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" size={22} />
                      </div>
                      <span className="text-[10px] font-black text-white drop-shadow-md">{post.comments?.length || '0'}</span>
                    </button>

                    {/* Action 3: Vault (Save) */}
                    <button className="flex flex-col items-center gap-1 group active:scale-95 transition-all">
                      <div className="w-12 h-12 rounded-full bg-[#151A25]/80 border border-white/10 flex items-center justify-center group-hover:border-yellow-400/50 group-hover:bg-yellow-400/10 transition-colors shadow-inner">
                        <IoMdBookmark className="text-white group-hover:text-yellow-400 transition-colors drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" size={22} />
                      </div>
                      <span className="text-[10px] font-black text-white drop-shadow-md">Save</span>
                    </button>

                    {/* Action 4: Broadcast (Share) */}
                    <button className="flex flex-col items-center gap-1 group active:scale-95 transition-all mt-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.8)] group-hover:scale-110 transition-all">
                        <IoMdShareAlt className="text-white" size={24} />
                      </div>
                    </button>

                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}