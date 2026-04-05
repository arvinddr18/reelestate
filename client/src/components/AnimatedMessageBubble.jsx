import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

// 🌟 FUTURISTIC RADAR MENU ACTIONS 🌟
const MENU_ACTIONS = [
  { id: 'react', icon: '❤️', label: 'React', color: 'text-[#ff3366]', shadow: 'rgba(255,51,102,0.5)' },
  { id: 'edit', icon: '✏️', label: 'Edit', color: 'text-[#00f0ff]', shadow: 'rgba(0,240,255,0.5)' },
  { id: 'save', icon: '⭐', label: 'Save', color: 'text-[#ffbb00]', shadow: 'rgba(255,187,0,0.5)' },
  { id: 'forward', icon: '🔁', label: 'Forward', color: 'text-[#00ff9d]', shadow: 'rgba(0,255,157,0.5)' },
  { id: 'delete', icon: '🗑️', label: 'Delete', color: 'text-red-500', shadow: 'rgba(239,68,68,0.5)' }
];

export default function AnimatedMessageBubble({ msg, isMe, onReply }) {
  const [reaction, setReaction] = useState(null);
  const [showBurst, setShowBurst] = useState(false);
  const [showRadial, setShowRadial] = useState(false);
  
  const isDragging = useRef(false);

  // AUTO-CLOSE! If you click ANYWHERE else on the screen, the menu closes!
  useEffect(() => {
    if (!showRadial) return;
    const closeMenu = () => setShowRadial(false);
    
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
      document.addEventListener('touchstart', closeMenu); // Works on mobile too!
    }, 10);
    
    return () => {
      document.removeEventListener('click', closeMenu);
      document.removeEventListener('touchstart', closeMenu);
    };
  }, [showRadial]);

  // ==========================================
  // 🌟 PREMIUM SWIPE-TO-REPLY PHYSICS 🌟
  // ==========================================
  const x = useMotionValue(0);
  const replyOpacity = useTransform(x, isMe ? [0, -50] : [0, 50], [0, 1]);
  const replyScale = useTransform(x, isMe ? [0, -50] : [0, 50], [0.5, 1.1]);

  const handleDragStart = () => {
    isDragging.current = true; // Locks the tap feature while swiping
  };

  const handleDragEnd = (e, info) => {
    setTimeout(() => { isDragging.current = false; }, 150);
    const threshold = 45; 
    
    if (isMe && info.offset.x < -threshold) {
      triggerReply();
    } else if (!isMe && info.offset.x > threshold) {
      triggerReply();
    }
  };

  const triggerReply = () => {
    window.navigator.vibrate?.(50); 
    if (onReply) onReply(); 
  };

  // ==========================================
  // 🚨 RESTORED: INSTANT SINGLE TAP!
  // ==========================================
  const handleBubbleClick = (e) => {
    e.stopPropagation(); 
    if (!isDragging.current) {
      setShowRadial(true);
      window.navigator.vibrate?.(50); // Optional tiny buzz when it opens
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

  const handleAction = (actionId, e) => {
    e.stopPropagation();
    setShowRadial(false); 
    if (actionId === 'react') {
      setReaction('❤️');
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 1400);
    } else if (actionId === 'delete') {
      alert("Message deleted! (Backend hook coming soon)");
    } else if (actionId === 'edit') {
      alert("Edit mode activated! (UI hook coming soon)");
    } else {
      alert(`${actionId.toUpperCase()} activated! (UI hook coming soon)`);
    }
  };

  const activeActions = isMe ? MENU_ACTIONS : MENU_ACTIONS.filter(a => a.id !== 'edit');

  return (
    <div className={`flex w-full group transform transition-all duration-300 my-2 ${isMe ? 'justify-end hover:-translate-x-1' : 'justify-start hover:translate-x-1'}`}>
      
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
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}     
          style={{ x }} 
          className={`max-w-full flex flex-col relative z-10 cursor-grab active:cursor-grabbing ${isMe ? 'items-end' : 'items-start'}`}
        >
          
          <motion.div
            animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -inset-1 rounded-3xl blur-lg z-0 pointer-events-none ${isMe ? 'bg-[#c11f70]/30' : 'bg-[#00f0ff]/20'}`}
          />

          {/* 🚨 THE MESSAGE BUBBLE - CLICK RESTORED! */}
          <motion.div 
            whileTap={{ scale: 0.95 }}
            onClick={handleBubbleClick} // Instant open is back!
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }} 
            onDoubleClick={handleDoubleClick}
            className={`relative select-none px-4 py-2.5 md:px-5 md:py-3 text-[14.5px] md:text-[15px] font-medium leading-relaxed tracking-wide rounded-3xl shadow-lg border backdrop-blur-xl z-20 w-fit max-w-full whitespace-pre-wrap break-words cursor-pointer ${
              isMe 
              ? 'bg-gradient-to-br from-[#801fd6]/90 to-[#c11f70]/90 border-white/20 rounded-tr-xl text-white shadow-[0_8px_25px_rgba(193,31,112,0.3)]' 
              : 'bg-[#121826]/80 border-white/5 rounded-tl-xl text-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
            }`}
          >
            {msg.replyTo && (
              <div className={`mb-1.5 p-2 rounded-lg border-l-[3px] text-xs opacity-90 backdrop-blur-md ${isMe ? 'bg-black/20 border-white/50 text-white' : 'bg-white/10 border-[#00f0ff] text-white'}`}>
                <div className="font-black text-[9px] uppercase mb-0.5 opacity-70 tracking-widest">
                  Replying to
                </div>
                <div className="truncate max-w-[200px] md:max-w-[300px]">
                  {msg.replyTo.text || "Attachment"}
                </div>
              </div>
            )}
            
            <span className="relative z-10 pointer-events-none">{msg.text}</span>
          </motion.div>

          {/* Timestamp */}
          <div className={`flex items-center gap-1.5 mt-1.5 w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] font-semibold tracking-wider ${isMe ? 'text-white/70' : 'text-gray-500'}`}>{msg.time}</span>
          </div>

          <AnimatePresence>
            {reaction && (
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                className={`absolute -bottom-3 ${isMe ? '-left-3' : '-right-3'} bg-[#121826] border border-white/20 rounded-full p-1 shadow-[0_0_15px_rgba(255,255,255,0.2)] z-30 text-sm`}
              >
                {reaction}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showBurst && (
              <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{ 
                      scale: [0, 1.5, 1], x: (Math.random() - 0.5) * 150, y: -50 - Math.random() * 100, opacity: [1, 1, 0], rotate: Math.random() * 90 - 45
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

          {/* 🌟 THE RADIAL MENU 🌟 */}
          <AnimatePresence>
            {showRadial && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999]"
                onClick={(e) => e.stopPropagation()} 
              >
                <div className="relative">
                  
                  {/* CENTER HUB BUTTON */}
                  <motion.button
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 45 }}
                    exit={{ scale: 0, rotate: -90 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={(e) => { e.stopPropagation(); setShowRadial(false); }}
                    className="absolute w-12 h-12 flex items-center justify-center -ml-6 -mt-6 bg-[#1A1F2E]/95 border border-white/20 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-gray-400 hover:text-white hover:border-white/40 transition-all z-10 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50"
                  >
                    <svg className="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                  </motion.button>

                  {/* SURROUNDING ACTION BUTTONS */}
                  {activeActions.map((action, i) => {
                    const angle = (i / activeActions.length) * Math.PI * 2 - Math.PI / 2;
                    const radius = 80; 
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
                        onClick={(e) => handleAction(action.id, e)}
                        className="absolute w-14 h-14 flex flex-col items-center justify-center -ml-7 -mt-7 bg-[#1A1F2E]/95 border border-white/20 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-2xl group hover:border-white/40 transition-colors"
                      >
                        <span className={`text-[22px] drop-shadow-md ${action.color}`}>
                          {action.icon}
                        </span>
                        
                        <span className={`absolute -bottom-6 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${action.color} bg-black/90 border border-white/10 shadow-xl pointer-events-none`}>
                          {action.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}