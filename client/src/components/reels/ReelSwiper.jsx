import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdHeart, IoMdChatbubbles, IoMdShareAlt, IoMdCall, IoLogoWhatsapp, IoMdPin, IoMdClose } from 'react-icons/io';

export default function ReelSwiper({ posts, onClose }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Handle Swipe Logic
  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = offset.y;
    if (swipe < -100 && index < posts.length - 1) {
      setDirection(1);
      setIndex(index + 1);
    } else if (swipe > 100 && index > 0) {
      setDirection(-1);
      setIndex(index - 1);
    }
  };

  const currentPost = posts[index];

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center overflow-hidden h-screen w-screen">
      
      {/* ── TOP NAV ── */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-[210] bg-gradient-to-b from-black/60 to-transparent">
        <h2 className="text-white font-black tracking-tighter italic text-xl">NODEXA <span className="text-[#00F0FF]">REELS</span></h2>
        <button onClick={onClose} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
          <IoMdClose size={24} />
        </button>
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          initial={{ y: direction > 0 ? '100%' : '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: direction > 0 ? '-100%' : '100%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 w-full h-full flex flex-col bg-[#0B0F19]"
        >
          {/* ── VIDEO/IMAGE BACKGROUND ── */}
          <div className="relative w-full h-full">
            {currentPost?.mediaType === 'video' ? (
              <video 
                src={currentPost.videoUrl} 
                autoPlay 
                loop 
                muted={false}
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={currentPost?.images?.[0]?.url || currentPost?.image} className="w-full h-full object-cover" alt="" />
            )}

            {/* DARK OVERLAY FOR TEXT READABILITY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          </div>

          {/* ── RIGHT SIDEBAR ACTIONS ── */}
          <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-[210]">
            <div className="flex flex-col items-center gap-1">
              <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:text-red-500 transition-all shadow-lg border border-white/10">
                <IoMdHeart size={28} />
              </button>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentPost?.likesCount || 0}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:text-[#00F0FF] transition-all shadow-lg border border-white/10">
                <IoMdChatbubbles size={26} />
              </button>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Chat</span>
            </div>

            <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg border border-white/10">
              <IoMdShareAlt size={26} />
            </button>
          </div>

          {/* ── BOTTOM CONTENT & ACTION CARDS ── */}
          <div className="absolute bottom-0 left-0 w-full p-6 pb-10 flex flex-col gap-4 z-[210]">
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#00F0FF] p-0.5 overflow-hidden">
                <img src={currentPost?.author?.profilePhoto || "https://ui-avatars.com/api/?name=User"} className="w-full h-full object-cover rounded-full" alt=""/>
              </div>
              <div>
                <p className="text-white font-black text-sm tracking-tight italic">@{currentPost?.author?.username || "nodexa_user"}</p>
                <p className="text-[#00F0FF] text-[10px] font-black uppercase tracking-[0.2em]">{currentPost?.mainCategory || "Social"}</p>
              </div>
            </div>

            {/* Caption */}
            <p className="text-gray-200 text-sm font-medium line-clamp-2 pr-12">
              {currentPost?.description || "Check out this amazing find on Nodexa! 🔥"}
            </p>

            {/* ── GLASS ACTION BUTTONS (The Super App Secret) ── */}
            <div className="flex gap-2 mt-2">
              <button className="flex-1 bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 transition-all">
                <IoMdCall size={16}/> Call Now
              </button>
              <button className="w-14 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/20 transition-all">
                <IoLogoWhatsapp size={22} />
              </button>
              <button className="w-14 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-[#F5A623] hover:bg-[#F5A623]/20 transition-all">
                <IoMdPin size={22} />
              </button>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* Vertical Progress Bar */}
      <div className="absolute right-1 top-1/4 bottom-1/4 w-1 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="w-full bg-[#00F0FF] transition-all duration-300" 
          style={{ height: `${((index + 1) / posts.length) * 100}%` }}
        />
      </div>

    </div>
  );
}