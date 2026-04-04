import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 🌟 FUTURISTIC RADAR MENU ACTIONS 🌟
const MENU_ACTIONS = [
  { id: 'react', icon: '❤️', label: 'React', color: 'text-[#ff3366]', shadow: 'rgba(255,51,102,0.5)' },
  { id: 'reply', icon: '↩️', label: 'Reply', color: 'text-[#00f0ff]', shadow: 'rgba(0,240,255,0.5)' },
  { id: 'save', icon: '⭐', label: 'Save', color: 'text-[#ffbb00]', shadow: 'rgba(255,187,0,0.5)' },
  { id: 'forward', icon: '🔁', label: 'Forward', color: 'text-[#00ff9d]', shadow: 'rgba(0,255,157,0.5)' },
  { id: 'delete', icon: '🗑️', label: 'Delete', color: 'text-red-500', shadow: 'rgba(239,68,68,0.5)' }
];

export default function AnimatedMessageBubble({ msg, isMe }) {
  const [reaction, setReaction] = useState(null);
  const [showBurst, setShowBurst] = useState(false);
  const [showRadial, setShowRadial] = useState(false);
  
  const holdTimer = useRef(null);

  // --- SCENE 2 & 3: Double Tap Burst ---
  const handleDoubleClick = () => {
    setShowBurst(true);
    setTimeout(() => {
      setShowBurst(false);
      if (!reaction) setReaction('❤️'); 
    }, 1400);
  };

  // --- SCENE 5: Long Press Interaction ---
  const handlePointerDown = () => {
    holdTimer.current = setTimeout(() => {
      setShowRadial(true);
      window.navigator.vibrate?.(50); 
    }, 500); 
  };

  const handlePointerUp = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  // --- SCENE 6 & 7: Radial Selection ---
  const handleAction = (actionId) => {
    setShowRadial(false);
    
    if (actionId === 'react') {
      setReaction('❤️');
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 1400);
    } else if (actionId === 'delete') {
      alert("Message deleted! (Backend hook coming soon)");
    } else {
      alert(`${actionId.toUpperCase()} activated! (UI hook coming soon)`);
    }
  };

  return (
    <div 
      className="relative w-fit max-w-full cursor-pointer"
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* SCENE 1: Idle Breathing Background Glow */}
      <motion.div
        animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -inset-1 rounded-3xl blur-lg z-0 pointer-events-none ${isMe ? 'bg-[#c11f70]/30' : 'bg-[#00f0ff]/20'}`}
      />

      {/* The Actual Message Bubble (Now forced to stretch horizontally!) */}
      <motion.div 
        whileTap={{ scale: 0.95 }}
        className={`relative px-4 py-2.5 md:px-5 md:py-3 text-[14.5px] md:text-[15px] font-medium leading-relaxed tracking-wide rounded-3xl shadow-lg border backdrop-blur-xl z-10 w-fit max-w-full whitespace-pre-wrap break-words ${
          isMe 
          ? 'bg-gradient-to-br from-[#801fd6]/90 to-[#c11f70]/90 border-white/20 rounded-tr-xl text-white shadow-[0_8px_25px_rgba(193,31,112,0.3)]' 
          : 'bg-[#121826]/80 border-white/5 rounded-tl-xl text-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
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

      {/* SCENE 3: Heart Burst Animation */}
      <AnimatePresence>
        {showBurst && (
          <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
            {[...Array(6)].map((_, i) => (
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
                className="absolute text-2xl drop-shadow-[0_0_10px_rgba(255,51,102,0.8)]"
              >
                ❤️
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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={(e) => { e.stopPropagation(); setShowRadial(false); }} 
          >
            <div className="relative" onClick={e => e.stopPropagation()}>
              {MENU_ACTIONS.map((action, i) => {
                const angle = (i / MENU_ACTIONS.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 85; 
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.button
                    key={action.id}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ scale: 1, x, y }}
                    exit={{ scale: 0, x: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.04 }}
                    whileHover={{ scale: 1.2, boxShadow: `0px 0px 25px ${action.shadow}` }}
                    onClick={() => handleAction(action.id)}
                    className="absolute w-14 h-14 flex flex-col items-center justify-center -ml-7 -mt-7 bg-[#1A1F2E]/90 border border-white/10 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-xl group hover:border-white/40 transition-colors"
                  >
                    <span className={`text-[22px] drop-shadow-md ${action.color}`}>
                      {action.icon}
                    </span>
                    
                    <span className={`absolute -bottom-6 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${action.color} bg-black/80 border border-white/10 shadow-xl`}>
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}