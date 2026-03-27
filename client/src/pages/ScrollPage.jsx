import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoMdHeart, IoMdChatbubbles, IoMdShareAlt, IoMdArrowBack } from 'react-icons/io';
import { FaBookmark } from 'react-icons/fa';
import api from '../services/api'; // 👈 We need this to talk to your DB!
import toast from 'react-hot-toast';

export default function ScrollPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReel, setActiveReel] = useState(0);
  const scrollRef = useRef(null);

  // ─── 1. FETCH REAL DATA FROM YOUR BACKEND ───
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        // Fetching your actual posts from the DB
        const res = await api.get('/posts'); 
        
        // Filter to only show posts that have media attached to them
        const actualPosts = res.data.data || [];
        const postsWithMedia = actualPosts.filter(post => 
          post.media?.length > 0 || post.images?.length > 0 || post.image
        );
        
        setReels(postsWithMedia);
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Failed to load network feeds.");
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  // ─── 2. AUTOPLAY SCROLL TRACKER ───
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const scrollPosition = scrollRef.current.scrollTop;
      const windowHeight = window.innerHeight;
      const currentIndex = Math.round(scrollPosition / windowHeight);
      setActiveReel(currentIndex);
    };

    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, [reels]); // Re-binds when your database finishes loading

  // ─── 3. LOADING STATE ───
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#05070A] z-[100] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#00F0FF] text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">Establishing Link...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex justify-center items-center overflow-hidden">
      
      {/* ─── EXIT BUTTON ─── */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:text-[#00F0FF] hover:border-[#00F0FF]/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      >
        <IoMdArrowBack size={24} />
      </Link>

      {/* ─── SNAP SCROLLING CONTAINER ─── */}
      <div 
        ref={scrollRef}
        className="w-full max-w-[500px] h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative border-x border-white/5 bg-[#05070A]"
      >
        {reels.length === 0 ? (
           <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <h3 className="text-xl font-black italic tracking-widest text-white/50 mb-2">NO DATA FOUND</h3>
              <p className="text-xs uppercase tracking-widest">Awaiting operator uploads.</p>
           </div>
        ) : (
          reels.map((reel, index) => {
            
            // Safety checks to handle whatever your database calls the images/videos
            const mediaUrl = reel.media?.[0]?.url || reel.images?.[0] || reel.image || reel.videoUrl;
            // Check if the URL ends in a video extension
            const isVideo = mediaUrl?.match(/\.(mp4|webm|ogg|mov)$/i) || reel.media?.[0]?.type === 'video';

            return (
              <div key={reel._id} className="w-full h-screen snap-center relative group">
                
                {/* ─── MEDIA LAYER ─── */}
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  {isVideo ? (
                    <video 
                      src={mediaUrl} 
                      autoPlay={activeReel === index} 
                      loop 
                      muted 
                      playsInline 
                      className={`w-full h-full object-cover transition-opacity duration-500 ${activeReel === index ? 'opacity-100' : 'opacity-50'}`} 
                    />
                  ) : (
                    <img 
                      src={mediaUrl} 
                      alt="Property" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#05070A]/90 pointer-events-none" />
                </div>

                {/* ─── RIGHT SIDE ACTION BAR ─── */}
                <div className="absolute right-4 bottom-28 flex flex-col gap-6 items-center z-20">
                  <button className="flex flex-col items-center gap-1 group/btn hover:scale-110 transition-transform">
                    <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover/btn:border-[#00F0FF] group-hover/btn:bg-[#00F0FF]/20 transition-all">
                      <IoMdHeart size={26} className="text-white group-hover/btn:text-[#00F0FF] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                    <span className="text-white text-[10px] font-bold drop-shadow-md">{reel.likes?.length || 0}</span>
                  </button>

                  <button className="flex flex-col items-center gap-1 group/btn hover:scale-110 transition-transform">
                    <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover/btn:border-white transition-all">
                      <IoMdChatbubbles size={26} className="text-white" />
                    </div>
                    <span className="text-white text-[10px] font-bold drop-shadow-md">{reel.comments?.length || 0}</span>
                  </button>

                  <button className="flex flex-col items-center gap-1 group/btn hover:scale-110 transition-transform">
                    <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover/btn:border-white transition-all">
                      <FaBookmark size={22} className="text-white" />
                    </div>
                  </button>

                  <button className="flex flex-col items-center gap-1 group/btn hover:scale-110 transition-transform">
                    <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover/btn:border-white transition-all">
                      <IoMdShareAlt size={26} className="text-white" />
                    </div>
                  </button>
                </div>

                {/* ─── BOTTOM INFO OVERLAY ─── */}
                <div className="absolute bottom-0 left-0 w-full p-6 pb-10 z-20 pointer-events-none">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#00F0FF] p-[2px] bg-black shadow-[0_0_10px_rgba(0,240,255,0.5)] overflow-hidden">
                        <img 
                          src={reel.author?.profilePhoto || reel.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.author?.username || 'user'}`} 
                          alt="avatar" 
                          className="w-full h-full object-cover" 
                        />
                    </div>
                    <div>
                      <p className="text-white font-black text-sm tracking-wide flex items-center gap-2 drop-shadow-lg">
                        @{reel.author?.username || 'operator'} 
                      </p>
                    </div>
                  </div>

                  <h2 className="text-white text-2xl font-black italic tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] line-clamp-1">{reel.title || 'Encrypted Node'}</h2>
                  <h3 className="text-[#00F0FF] text-3xl font-black drop-shadow-[0_0_15px_rgba(0,240,255,0.6)] mt-1">
                    {reel.price ? `$${reel.price.toLocaleString()}` : 'MARKET VALUE'}
                  </h3>
                  
                  <p className="text-gray-200 text-xs mt-3 w-[80%] line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium leading-relaxed">
                    {reel.description || reel.desc || 'No description provided.'}
                  </p>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}