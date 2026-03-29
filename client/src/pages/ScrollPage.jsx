import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// EXTREMELY SAFE IMPORTS - Exactly the same as your working code
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
          const data = res.data?.data || res.data || [];
          setPosts(Array.isArray(data) ? data : []);
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
    return () => { isMounted = false; };
  }, []);

  // Safe standard scroll logic
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
      <div className="h-screen w-full bg-[#05070A] flex flex-col items-center justify-center text-white p-6 relative">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 w-12 h-12 rounded-full bg-[#151A25] border border-white/10 flex items-center justify-center text-white hover:text-[#00F0FF] transition-colors z-50">
          <IoMdArrowBack size={24} />
        </button>
        <div className="w-24 h-24 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(0,240,255,0.2)]">🎬</div>
        <h2 className="text-2xl font-black text-white mb-2">No Streams Found</h2>
      </div>
    );
  }

  const activePost = posts[activeIndex] || posts[0];
  const activeMediaUrl = resolveMediaUrl(activePost?.images?.[0]?.url || activePost?.image);
  const isBgVideo = activeMediaUrl.includes('.mp4') || activeMediaUrl.includes('.webm') || activeMediaUrl.includes('.ogg');

  return (
    <div className="h-screen w-full bg-[#05070A] relative flex justify-center overflow-hidden">
      
      {/* ─── DESKTOP AMBIENT BACKGROUND ─── */}
      <div className="absolute inset-0 hidden md:block z-0 pointer-events-none">
        {activeMediaUrl && !isBgVideo && (
          <img src={activeMediaUrl} className="absolute inset-0 w-full h-full object-cover blur-[100px] opacity-30 scale-125 transition-all duration-700" alt="ambient" />
        )}
        <div className="absolute inset-0 bg-[#05070A]/60 backdrop-blur-3xl" />
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,240,255,0.2) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
      </div>

      {/* ─── TOP BACK BUTTON (GLASSMORPHISM) ─── */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-4 md:left-8 z-50 w-12 h-12 flex items-center justify-center bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 rounded-full text-white hover:border-[#00F0FF]/50 hover:text-[#00F0FF] transition-all shadow-[0_5px_20px_rgba(0,0,0,0.5)]"
      >
        <IoMdArrowBack size={24} />
      </button>

      {/* ─── MAIN SCROLL CONTAINER ─── */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-[450px] h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10 md:py-8"
      >
        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || mediaUrl.match(/\.(mp4|webm|ogg)$/i);
          const isActive = index === activeIndex;

          return (
            <div key={post._id || index} className="w-full h-screen md:h-[calc(100vh-64px)] snap-start snap-always relative flex items-center justify-center md:px-2">
              
              {/* THE POST SLAB */}
              <div className={`w-full h-full relative bg-[#151A25] md:rounded-[40px] overflow-hidden transition-all duration-500 ${isActive ? 'md:scale-100 md:shadow-[0_0_50px_rgba(0,240,255,0.15)] md:border border-white/10' : 'md:scale-95 md:opacity-50'}`}>
                
                {/* Media Content */}
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
                  <img src={mediaUrl} alt="Post" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold">Encrypted Data</div>
                )}

                {/* Dark Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/20 to-transparent pointer-events-none" />

                {/* Cyberpunk Top Accent Line */}
                {isActive && (
                  <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-50" />
                )}

                {/* ─── BOTTOM LEFT INFO (THE DATA HUD) ─── */}
                <div className="absolute bottom-6 left-4 right-[80px] z-20">
                  
                  {/* Glassmorphism User Badge */}
                  <div className="flex items-center gap-3 mb-4 p-1.5 pr-4 bg-[#0B0F19]/50 backdrop-blur-md border border-white/10 rounded-full w-max cursor-pointer shadow-lg">
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF]">
                      <img 
                        src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=0B0F19&color=00F0FF`} 
                        alt="avatar" 
                        className="w-full h-full rounded-full object-cover border-2 border-[#0B0F19]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white font-black text-sm drop-shadow-md tracking-wide">@{post.author?.username || 'user'}</p>
                      <p className="text-[#00F0FF] text-[9px] font-black uppercase tracking-widest">{post.author?.role || 'Seller'}</p>
                    </div>
                  </div>

                  {/* Property Details */}
                  <h3 className="text-white font-black text-xl leading-tight mb-2 drop-shadow-lg line-clamp-2">
                    {post.title || 'Classified Property'}
                  </h3>
                  
                  {/* Neon Price Badge */}
                  <div className="inline-flex items-center gap-3 bg-[#0B0F19]/80 border border-[#00F0FF]/40 px-3 py-1.5 rounded-xl mb-2 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Price</span>
                    <span className="text-[#00F0FF] font-black text-lg drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                      {post.price ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Market Value'}
                    </span>
                  </div>

                  {post.description && (
                    <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed drop-shadow-md">
                      {post.description}
                    </p>
                  )}
                </div>

                {/* ─── RIGHT SIDE ICONS (THE COMMAND DOCK) ─── */}
                <div className="absolute bottom-6 right-3 z-20">
                  <div className="flex flex-col gap-5 items-center bg-[#0B0F19]/40 backdrop-blur-xl border border-white/10 py-5 px-2 rounded-[30px] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    
                    <button className="flex flex-col items-center gap-1.5 group">
                      <div className="w-11 h-11 rounded-full bg-[#151A25]/80 flex items-center justify-center text-white group-hover:bg-red-500/20 group-hover:text-red-500 group-hover:border group-hover:border-red-500/50 transition-all shadow-inner">
                        <IoMdHeart size={22} />
                      </div>
                      <span className="text-white text-[10px] font-black drop-shadow-md">{post.likesCount || 0}</span>
                    </button>

                    <button className="flex flex-col items-center gap-1.5 group">
                      <div className="w-11 h-11 rounded-full bg-[#151A25]/80 flex items-center justify-center text-white group-hover:bg-[#00F0FF]/20 group-hover:text-[#00F0FF] group-hover:border group-hover:border-[#00F0FF]/50 transition-all shadow-inner">
                        <IoMdText size={22} />
                      </div>
                      <span className="text-white text-[10px] font-black drop-shadow-md">{post.comments?.length || 0}</span>
                    </button>

                    <button className="flex flex-col items-center gap-1.5 group">
                      <div className="w-11 h-11 rounded-full bg-[#151A25]/80 flex items-center justify-center text-white group-hover:bg-yellow-400/20 group-hover:text-yellow-400 group-hover:border group-hover:border-yellow-400/50 transition-all shadow-inner">
                        <IoMdBookmark size={22} />
                      </div>
                      <span className="text-white text-[10px] font-black drop-shadow-md">Save</span>
                    </button>

                    <button className="flex flex-col items-center mt-2 group">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all">
                        <IoMdShareAlt size={24} />
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