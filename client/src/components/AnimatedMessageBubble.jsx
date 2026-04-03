import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['❤️', '😍', '🔥', '🚀', '👍', '💸'];

export default function AnimatedMessageBubble({ msg, isMe }) {
  const [reaction, setReaction] = useState(null);
  const [showBurst, setShowBurst] = useState(false);
  const [showRadial, setShowRadial] = useState(false);
  
  const holdTimer = useRef(null);

  // --- SCENE 2 & 3: Double Tap Burst ---
  const handleDoubleClick = () => {
    setShowBurst(true);
    // Burst lasts 1.4s, then transitions to Scene 4 (Settle)
    setTimeout(() => {
      setShowBurst(false);
      if (!reaction) setReaction('❤️'); // Default settle
    }, 1400);
  };

  // --- SCENE 5: Long Press Interaction ---
  const handlePointerDown = () => {
    holdTimer.current = setTimeout(() => {
      setShowRadial(true);
      window.navigator.vibrate?.(50); // Optional subtle haptic click
    }, 500); // 500ms hold triggers the radial menu
  };

  const handlePointerUp = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  // --- SCENE 6 & 7: Radial Selection ---
  const selectReaction = (emoji) => {
    setReaction(emoji);
    setShowRadial(false);
  };

  return (
    <div className={`relative flex w-full my-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      
      {/* Container for event tracking */}
      <div 
       className={`relative max-w-[85%] md:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        
        {/* SCENE 1: Idle Breathing Background Glow */}
        <motion.div
          animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -inset-2 rounded-3xl blur-xl z-0 ${isMe ? 'bg-[#c11f70]/30' : 'bg-[#00f0ff]/20'}`}
        />

       {/* The Actual Message Bubble */}
        <motion.div 
          whileTap={{ scale: 0.95 }}
          className={`relative w-fit px-5 py-3.5 text-[15px] font-medium leading-relaxed tracking-wide rounded-3xl shadow-lg border backdrop-blur-xl z-10 ${
            isMe 
            ? 'bg-gradient-to-br from-[#801fd6]/90 to-[#c11f70]/90 border-white/20 rounded-tr-xl text-white' 
            : 'bg-[#121826]/80 border-white/5 rounded-tl-xl text-gray-100'
          }`}
        >
          {msg.text}
        </motion.div>

        {/* SCENE 4 & 7: Settled Reaction Badge */}
        <AnimatePresence>
          {reaction && (
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              className={`absolute -bottom-3 ${isMe ? '-left-3' : '-right-3'} bg-[#121826] border border-white/20 rounded-full p-1 shadow-[0_0_15px_rgba(255,255,255,0.2)] z-20 text-sm`}
            >
              {reaction}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCENE 3: Emoji Burst Animation */}
        <AnimatePresence>
          {showBurst && (
            <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
              {EMOJIS.map((emoji, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{ 
                    scale: [0, 1.5, 1], 
                    x: (Math.random() - 0.5) * 150, 
                    y: -50 - Math.random() * 100,
                    opacity: [1, 1, 0],
                    rotate: Math.random() * 90 - 45
                  }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* SCENE 5 & 6: Radial Blur & Menu */}
        <AnimatePresence>
          {showRadial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={() => setShowRadial(false)} // Click outside to close
            >
              <div className="relative" onClick={e => e.stopPropagation()}>
                {EMOJIS.map((emoji, i) => {
                  const angle = (i / EMOJIS.length) * Math.PI * 2;
                  const radius = 80; // Distance from center
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <motion.button
                      key={emoji}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{ scale: 1, x, y }}
                      exit={{ scale: 0, x: 0, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      whileHover={{ scale: 1.5, textShadow: "0px 0px 15px rgba(255,255,255,0.8)" }}
                      onClick={() => selectReaction(emoji)}
                      className="absolute w-12 h-12 flex items-center justify-center -ml-6 -mt-6 text-3xl bg-[#1A1F2E]/80 border border-white/20 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-md"
                    >
                      {emoji}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}