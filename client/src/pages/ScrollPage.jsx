import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoMdHeart, IoMdChatbubbles, IoMdShareAlt, IoMdArrowBack } from 'react-icons/io';
import { FaBookmark } from 'react-icons/fa';

// ─── HIGH-END DUMMY MEDIA ───
// We will replace this with your backend data later!
const dummyReels = [
  { 
    id: 1, 
    type: 'video', 
    url: 'https://cdn.pixabay.com/video/2020/02/17/32575-393297123_large.mp4', 
    title: 'Cyber-Penthouse Level 42', 
    operator: '@arvind_01', 
    price: '$2.4M', 
    likes: '14.2K',
    desc: 'Stunning high-altitude views with fully integrated neural-net climate control. Experience the absolute peak of modern architecture. #NODEXA #Luxury'
  },
  { 
    id: 2, 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075', 
    title: 'Suburban Neo-Villa', 
    operator: '@nodexa_elite', 
    price: '$850K', 
    likes: '8.2K',
    desc: 'Spacious open-floor concept with smart-glass windows and automated security perimeter.'
  },
  { 
    id: 3, 
    type: 'video', 
    url: 'https://cdn.pixabay.com/video/2021/08/19/85637-590666014_large.mp4', 
    title: 'Downtown Studio', 
    operator: '@city_hustle', 
    price: '$3,200/mo', 
    likes: '5.1K',
    desc: 'Perfect central location. Walking distance to the main data hubs and neon district.'
  }
];

export default function ScrollPage() {
  const [activeReel, setActiveReel] = useState(0);
  const scrollRef = useRef(null);

  // ─── MAGIC AUTOPLAY LOGIC ───
  // This watches which video is on screen and plays it, pausing the others!
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
  }, []);

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
        {dummyReels.map((reel, index) => (
          <div key={reel.id} className="w-full h-screen snap-center relative group">
            
            {/* ─── MEDIA LAYER ─── */}
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              {reel.type === 'video' ? (
                <video 
                  src={reel.url} 
                  autoPlay={activeReel === index} 
                  loop 
                  muted // Browsers require muted for autoplay
                  playsInline 
                  className={`w-full h-full object-cover transition-opacity duration-500 ${activeReel === index ? 'opacity-100' : 'opacity-50'}`} 
                />
              ) : (
                <img 
                  src={reel.url} 
                  alt="Property" 
                  className="w-full h-full object-cover" 
                />
              )}
              {/* Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#05070A]/90 pointer-events-none" />
            </div>

            {/* ─── RIGHT SIDE ACTION BAR ─── */}
            <div className="absolute right-4 bottom-28 flex flex-col gap-6 items-center z-20">
              <button className="flex flex-col items-center gap-1 group/btn hover:scale-110 transition-transform">
                <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover/btn:border-[#00F0FF] group-hover/btn:bg-[#00F0FF]/20 transition-all">
                  <IoMdHeart size={26} className="text-white group-hover/btn:text-[#00F0FF] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
                <span className="text-white text-[10px] font-bold drop-shadow-md">{reel.likes}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group/btn hover:scale-110 transition-transform">
                <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover/btn:border-white transition-all">
                  <IoMdChatbubbles size={26} className="text-white" />
                </div>
                <span className="text-white text-[10px] font-bold drop-shadow-md">428</span>
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
                 <div className="w-10 h-10 rounded-full border-2 border-[#00F0FF] p-[2px] bg-black shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.operator}`} alt="avatar" className="w-full h-full rounded-full" />
                 </div>
                 <div>
                   <p className="text-white font-black text-sm tracking-wide flex items-center gap-2 drop-shadow-lg">
                     {reel.operator} 
                     <span className="px-2 py-0.5 bg-[#0057FF] text-[8px] uppercase tracking-widest rounded-sm border border-[#00F0FF]/30">Verified</span>
                   </p>
                 </div>
               </div>

               <h2 className="text-white text-2xl font-black italic tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">{reel.title}</h2>
               <h3 className="text-[#00F0FF] text-3xl font-black drop-shadow-[0_0_15px_rgba(0,240,255,0.6)] mt-1">{reel.price}</h3>
               
               <p className="text-gray-200 text-xs mt-3 w-[80%] line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium leading-relaxed">
                 {reel.desc}
               </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}