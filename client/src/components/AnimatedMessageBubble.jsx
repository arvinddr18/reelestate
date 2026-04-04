import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

// 🌟 FUTURISTIC RADAR MENU ACTIONS 🌟
const MENU_ACTIONS = [
  { id: 'react', icon: '❤️', label: 'React', color: 'text-[#ff3366]', shadow: 'rgba(255,51,102,0.5)' },
  { id: 'save', icon: '⭐', label: 'Save', color: 'text-[#ffbb00]', shadow: 'rgba(255,187,0,0.5)' },
  { id: 'forward', icon: '🔁', label: 'Forward', color: 'text-[#00ff9d]', shadow: 'rgba(0,255,157,0.5)' },
  { id: 'delete', icon: '🗑️', label: 'Delete', color: 'text-red-500', shadow: 'rgba(239,68,68,0.5)' }
];

export default function AnimatedMessageBubble({ msg, isMe }) {
  const [reaction, setReaction] = useState(null);
  const [showBurst, setShowBurst] = useState(false);
  const [showRadial, setShowRadial] = useState(false);

  // 🚨 THE FIX: This tracks if you are swiping or tapping!
  const isDragging = useRef(false);

  // ==========================================
  // 🌟 PREMIUM SWIPE-TO-REPLY PHYSICS 🌟
  // ==========================================
  const x = useMotionValue(0);
  
  const replyOpacity = useTransform(x, isMe ? [0, -60] : [0, 60], [0, 1]);
  const replyScale = useTransform(x, isMe ? [0, -60] : [0, 60], [0.5, 1.1]);

  const handleDragStart = () => {
    isDragging.current = true; // Lock the tap feature!
  };

  const handleDragEnd = (e, info) => {
    // Unlock the tap feature after a tiny delay so the browser doesn't confuse them
    setTimeout(() => {
      isDragging.current = false;
    }, 150);

    const threshold = 60; 
    if (isMe && info.offset.x < -threshold) {
      triggerReply();
    } else if (!isMe && info.offset.x > threshold) {
      triggerReply();
    }
  };

  const triggerReply = () => {
    window.navigator.vibrate?.(50); 
    alert("Swiped to Reply! ↩️ (Will connect to the input bar next!)");
  };

  // ==========================================
  // SCENE TIMERS & CLICKS
  // ==========================================
  const handleBubbleClick = (e) => {
    e.stopPropagation();
    // 🚨 THE FIX: Only open the menu if we DID NOT just swipe!
    if (!isDragging.current) {
      setShowRadial(true);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation(); 
    if (isDragging.current) return;
    
    setShowBurst(true);
    setTimeout(() => {
      setShowBurst(false);
      if (!reaction) setReaction('❤️'); 
    }, 1400);
  };

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
    <div className={`flex w-full group transform transition-all duration-300 my-2 ${isMe ? 'justify-end hover:-translate-x-1' : 'justify-start hover:translate-x-1'}`}>
      
      {/* 🌟 SWIPE-TO-REPLY CONTAINER 🌟 */}
      <div className="relative max-w-full flex items-center">
        
        {/* THE GLOWING REPLY ICON */}
        <motion.div 
          style={{ opacity: replyOpacity, scale: replyScale }}
          className={`absolute ${isMe ? '-right-10' : '-left-10'} w-8 h-8 rounded-full bg-[#1A1F2E]/90 border border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.6)] flex items-center justify-center text-[#00f0ff] z-0 pointer-events-none`}
        >
          ↩️
        </motion.div>

        {/* 🌟 DRAGGABLE MESSAGE WRAPPER 🌟 */}
        <motion.div 
          drag="x"
          dragConstraints={{ left: 0, right: 0 }} 
          dragElastic={0.15} 
          onDragStart={handleDragStart} // 🚨 Locks the tap
          onDragEnd={handleDragEnd}     // 🚨 Unlocks the tap
          style={{ x }} 
          className={`max-w-full flex flex-col relative z-10 cursor-grab active:cursor-grabbing ${isMe ? 'items-end' : 'items-start'}`}
        >
          
          {/* Breathing Background Glow */}
          <motion.div
            animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -inset-1 rounded-3xl blur-lg z-0 pointer-events-none ${isMe ? 'bg-[#c11f70]/30' : 'bg-[#00f0ff]/20'}`}
          />

          {/* 🚨 THE MESSAGE BUBBLE */}
          <motion.div 
            whileTap={{ scale: 0.95 }}
            onClick={handleBubbleClick} // 🚨 Fires our bulletproof custom click handler!
            onDoubleClick={handleDoubleClick}
            className={`relative select-none px-4 py-2.5 md:px-5 md:py-3 text-[14.5px] md:text-[15px] font-medium leading-relaxed tracking-wide rounded-3xl shadow-lg border backdrop-blur-xl z-10 w-fit max-w-full whitespace-pre-wrap break-words cursor-pointer ${
              isMe 
              ? 'bg-gradient-to-br from-[#801fd6]/90 to-[#c11f70]/90 border-white/20 rounded-tr-xl text-white shadow-[0_8px_25px_rgba(193,31,112,0.3)]' 
              : 'bg-[#121826]/80 border-white/5 rounded-tl-xl text-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
            }`}
          >
            {msg.text}
          </motion.div>

          {/* Timestamp */}
          <div className={`flex items-center gap-1.5 mt-1.5 w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] font-semibold tracking-wider ${isMe ? 'text-white/70' : 'text-gray-500'}`}>{msg.time}</span>
          </div>

          {/* Settled Reaction Badge */}
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

          {/* Heart Burst Animation */}
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

        </motion.div>
      </div>

      {/* 🌟 RADIAL MENU (Perfectly Centered via Portal) 🌟 */}
      <AnimatePresence>
        {showRadial && typeof document !== 'undefined' && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-md cursor-default"
            onClick={(e) => { e.stopPropagation(); setShowRadial(false); }} 
            onPointerDown={(e) => e.stopPropagation()} 
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
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

    </div>
  );
}