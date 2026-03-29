import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// 100% Correct matching imports
import { IoMdHeart, IoMdBookmark, IoMdShareAlt, IoMdArrowBack, IoMdPin } from 'react-icons/io';
import api from '../services/api';

// ─── CRASH-PROOF VIDEO COMPONENT ───
const VideoNode = ({ src, isActive }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {}); 
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  return (
    <video 
      ref={videoRef} 
      src={src} 
      loop 
      muted 
      playsInline 
      className="absolute inset-0 w-full h-full object-cover" 
    />
  );
};

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
        console.error("Fetch Error:", err);
        if (isMounted) {
          setPosts([]);
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── SAFE SCROLL TRACKER ───
  const handleScroll = (e) => {
    const container = e.target;
    const clientHeight = container.clientHeight || 1;
    const index = Math.round(container.scrollTop / clientHeight);
    
    if (index !== activeIndex && index >= 0 && index < posts.length) {
      setActiveIndex(index);
    }
  };

  // ─── SECURE URL RESOLVER ───
  const resolveMediaUrl = (source) => {
    if (!source) return '';
    if (typeof source === 'object' && source.url) return source.url;
    if (typeof source !== 'string') return '';
    if (source.startsWith('http') || source.startsWith('data:')) return source;
    const base = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';
    return `${base}${source.startsWith('/') ? '' : '/'}${source}`;
  };

  // 1. LOADING SCREEN
  if (loading) {
    return (
      <div className="h-screen w-full bg-[#05070A] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0057FF] border-t-[#00F0FF] rounded-full animate-spin mb-4" />
        <span className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase animate-pulse">Establishing Uplink...</span>
      </div>
    );
  }

  // 2. EMPTY STATE
  if (posts.length === 0) {
    return (
      <div className="h-screen w-full bg-[#05070A] flex flex-col items-center justify-center p-6 text-center relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 w-12 h-12 rounded-full bg-[#151A25] border border-white/10 flex items-center justify-center text-white hover:text-[#00F0FF] transition-colors z-50">
          <IoMdArrowBack size={24} />
        </button>
        <div className="w-24 h-24 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(0,240,255,0.2)]">🎬</div>
        <h2 className="text-2xl font-black text-white mb-2">No Streams Found</h2>
        <p className="text-sm text-gray-400 font-bold max-w-xs">There are no encrypted nodes available to view.</p>
      </div>
    );
  }

  // 3. MAIN VARIABLES
  const activePost = posts[activeIndex] || posts[0];
  const activeMediaUrl = resolveMediaUrl(activePost?.images?.[0]?.url || activePost?.image);
  const isBgVideo = activeMediaUrl.includes('.mp4') || activeMediaUrl.includes('.webm');

  return (
    <div className="h-screen w-full bg-[#05070A] relative overflow-hidden flex justify-center">
      
      {/* ─── DESKTOP AMBIENT VOID ─── */}
      <div className="absolute inset-0 hidden md:block z-0 pointer-events-none overflow-hidden">
        {activeMediaUrl && !isBgVideo && (
          <img src={activeMediaUrl} alt="ambient" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[80px] scale-125 transition-opacity duration-1000" />
        )}
        <div className="absolute inset-0 bg-[#05070A]/80 backdrop-blur-3xl" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,240,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* ─── GLOBAL TOP BAR ─── */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 md:p-8 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 rounded-full bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:text-[#00F0FF] transition-all shadow-lg pointer-events-auto"
        >
          <IoMdArrowBack size={24} />
        </button>
        <div className="px-6 py-2 rounded-full bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 shadow-lg pointer-events-auto flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
           <span className="text-[10px] font-black tracking-widest text-white uppercase">Live Network</span>
        </div>
      </div>

      {/* ─── THE SNAP SCROLL CONTAINER ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[450px] h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 md:py-10"
      >
        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || mediaUrl.includes('.mp4') || mediaUrl.includes('.webm');
          const isActive = index === activeIndex;

          return (
            <div 
              key={post._id || index} 
              className="w-full h-screen md:h-[calc(100vh-80px)] snap-start snap-always relative flex items-center justify-center md:px-4"
            >
              <div className={`w-full h-full relative overflow-hidden md:rounded-[40px] bg-[#151A25] transition-all duration-700 ${isActive ? 'md:scale-100 md:border border-white/10 md:shadow-[0_0_40px_rgba(0,240,255,0.15)]' : 'md:scale-95 md:opacity-50'}`}>
                
                {/* MEDIA RENDER */}
                {isVideo && mediaUrl ? (
                  <VideoNode src={mediaUrl} isActive={isActive} />
                ) : (
                  mediaUrl ? (
                    <img src={mediaUrl} alt="Post" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-bold text-sm">Offline</div>
                  )
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#05070A]/95 pointer-events-none" />

                {/* THE DATA HUD (BOTTOM LEFT) */}
                <div className="absolute bottom-6 md:bottom-10 left-4 md:left-8 right-[80px] z-20 pointer-events-auto">
                  <div className={`transition-all duration-700 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    
                    <div className="flex items-center gap-3 mb-4 w-max cursor-pointer">
                      <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] p-[2px] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                        <img 
                          src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'Node'}&background=0B0F19&color=00F0FF`} 
                          alt="avatar" 
                          className="w-full h-full rounded-full object-cover border border-[#0B0F19]"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-black text-sm drop-shadow-md flex items-center gap-2">
                          @{post.author?.username || 'encrypted_node'}
                        </span>
                        <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">{post.author?.role || 'Seller'}</span>
                      </div>
                    </div>

                    <div className="bg-[#151A25]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0057FF] to-[#00F0FF]" />
                      <h2 className="text-lg font-black text-white mb-1 truncate">{post.title || 'Classified Data'}</h2>
                      
                      {post.location && (
                        <p className="flex items-center gap-1.5 text-gray-300 text-xs font-bold mb-3">
                          <IoMdPin className="text-[#00F0FF]" /> {post.location}
                        </p>
                      )}
                      
                      <div className="inline-flex items-center gap-2 bg-[#0B0F19] border border-[#00F0FF]/30 px-3 py-1.5 rounded-lg">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Value</span>
                        <span className="text-sm font-black text-[#00F0FF] drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                          {post.price && !isNaN(Number(post.price)) ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Market Value'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* THE COMMAND PILLAR (RIGHT ALIGNED) */}
                <div className="absolute bottom-6 md:bottom-10 right-2 md:right-4 z-20 pointer-events-auto">
                  <div className={`flex flex-col gap-4 bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 p-2 md:p-3 rounded-full transition-all duration-700 ${isActive ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                    
                    <button className="flex flex-col items-center gap-1 group active:scale-95 transition-transform">
                      <div className="w-10 h-10 rounded-full bg-[#151A25] flex items-center justify-center text-white border border-transparent group-hover:border-red-500/50 group-hover:text-red-500 transition-colors">
                        <IoMdHeart size={20} />
                      </div>
                      <span className="text-[9px] font-black text-white">{post.likesCount || '0'}</span>
                    </button>

                    {/* SVG directly used to avoid import crashes */}
                    <button className="flex flex-col items-center gap-1 group active:scale-95 transition-transform">
                      <div className="w-10 h-10 rounded-full bg-[#151A25] flex items-center justify-center text-white border border-transparent group-hover:border-[#00F0FF]/50 group-hover:text-[#00F0FF] transition-colors">
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-[9px] font-black text-white">{post.comments?.length || '0'}</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 group active:scale-95 transition-transform">
                      <div className="w-10 h-10 rounded-full bg-[#151A25] flex items-center justify-center text-white border border-transparent group-hover:border-yellow-400/50 group-hover:text-yellow-400 transition-colors">
                        <IoMdBookmark size={20} />
                      </div>
                      <span className="text-[9px] font-black text-white">Save</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 mt-2 group active:scale-95 transition-transform">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.8)] transition-shadow">
                        <IoMdShareAlt size={20} />
                      </div>
                    </button>

                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}