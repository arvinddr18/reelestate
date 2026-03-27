import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoMdHeart, IoMdChatbubbles, IoMdShareAlt, IoMdArrowBack } from 'react-icons/io';
import { FaBookmark } from 'react-icons/fa';

// Dummy data: Replace with real property videos/images from your backend later
const dummyReels = [
  { id: 1, type: 'video', url: 'https://cdn.pixabay.com/video/2020/02/17/32575-393297123_large.mp4', title: 'Cyber-Penthouse Level 42', operator: '@arvind_01', price: '$2.4M', likes: '14K' },
  { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075', title: 'Suburban Neo-Villa', operator: '@nodexa_elite', price: '$850K', likes: '8.2K' },
];

export default function ScrollPage() {
  const [activeReel, setActiveReel] = useState(0);

  // Function to handle the snap scrolling logic
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    // You can use this to trigger loading more reels when they reach the bottom!
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex justify-center items-center">
      
      {/* ─── EXIT BUTTON ─── */}
      <Link to="/" className="absolute top-6 left-6 z-50 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:text-[#00F0FF] hover:border-[#00F0FF]/50 transition-all">
        <IoMdArrowBack size={24} />
      </Link>

      {/* ─── SNAP SCROLLING CONTAINER ─── */}
      <div 
        className="w-full max-w-[500px] h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative shadow-[0_0_50px_rgba(0,87,255,0.1)] border-x border-white/5 bg-[#05070A]"
        onScroll={handleScroll}
      >
        {dummyReels.map((reel) => (
          <div key={reel.id} className="w-full h-full snap-center relative group">
            
            {/* ─── MEDIA LAYER ─── */}
            <div className="absolute inset-0 bg-black">
              {reel.type === 'video' ? (
                <video src={reel.url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90" />
              ) : (
                <img src={reel.url} alt="Property" className="w-full h-full object-cover opacity-90" />
              )}
              {/* Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05070A]" />
            </div>

            {/* ─── RIGHT SIDE ACTION BAR ─── */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-20">
              <button className="flex flex-col items-center gap-1 group/btn">
                <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover/btn:border-[#00F0FF] group-hover/btn:text-[#00F0FF] transition-all">
                  <IoMdHeart size={26} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
                <span className="text-white text-[10px] font-bold drop-shadow-md">{reel.likes}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group/btn">
                <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover/btn:border-white transition-all">
                  <IoMdChatbubbles size={26} />
                </div>
                <span className="text-white text-[10px] font-bold drop-shadow-md">428</span>
              </button>

              <button className="flex flex-col items-center gap-1 group/btn">
                <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover/btn:border-white transition-all">
                  <FaBookmark size={22} />
                </div>
              </button>

              <button className="flex flex-col items-center gap-1 group/btn">
                <div className="p-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover/btn:border-white transition-all">
                  <IoMdShareAlt size={26} />
                </div>
              </button>
            </div>

            {/* ─── BOTTOM INFO OVERLAY ─── */}
            <div className="absolute bottom-0 left-0 w-full p-6 z-20 pointer-events-none">
               <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 rounded-full border-2 border-[#00F0FF] p-[2px] bg-black">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.operator}`} alt="avatar" className="w-full h-full rounded-full" />
                 </div>
                 <div>
                   <p className="text-white font-black text-sm tracking-wide flex items-center gap-2">
                     {reel.operator} 
                     <span className="px-2 py-0.5 bg-[#0057FF] text-[8px] uppercase tracking-widest rounded-sm">Verified</span>
                   </p>
                 </div>
               </div>

               <h2 className="text-white text-xl font-black italic tracking-tighter drop-shadow-lg">{reel.title}</h2>
               <h3 className="text-[#00F0FF] text-2xl font-black drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] mt-1">{reel.price}</h3>
               
               <p className="text-gray-300 text-xs mt-3 w-3/4 line-clamp-2 drop-shadow-md">
                 Stunning high-altitude views with fully integrated neural-net climate control. Experience the absolute peak of modern architecture. #NODEXA #Luxury
               </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}