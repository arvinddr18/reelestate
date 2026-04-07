import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { IoMdClose } from 'react-icons/io'; // 🚨 ADD THIS LINE

// 🌟 FUTURISTIC RADAR MENU ACTIONS 🌟
const MENU_ACTIONS = [
  { id: 'react', icon: '❤️', label: 'React', color: 'text-[#ff3366]', shadow: 'rgba(255,51,102,0.5)' },
  { id: 'edit', icon: '✏️', label: 'Edit', color: 'text-[#00f0ff]', shadow: 'rgba(0,240,255,0.5)' },
  { id: 'save', icon: '⭐', label: 'Save', color: 'text-[#ffbb00]', shadow: 'rgba(255,187,0,0.5)' },
  { id: 'forward', icon: '🔁', label: 'Forward', color: 'text-[#00ff9d]', shadow: 'rgba(0,255,157,0.5)' },
  { id: 'delete', icon: '🗑️', label: 'Delete', color: 'text-red-500', shadow: 'rgba(239,68,68,0.5)' }
];

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];

export default function AnimatedMessageBubble({ msg, isMe, onReply, onEdit, onDelete, onSave, onForward, children }) {
  const [reaction, setReaction] = useState(null);
  const [showBurst, setShowBurst] = useState(false);
  const [showRadial, setShowRadial] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false); 
  const [showDeleteMenu, setShowDeleteMenu] = useState(false); // 👈 1. ADD THIS
  
  const isDragging = useRef(false);

  useEffect(() => {
   if (!showRadial && !showReactionMenu && !showDeleteMenu) return;
    const closeMenu = () => {
      setShowRadial(false);
      setShowReactionMenu(false);
      setShowDeleteMenu(false); 
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
      document.addEventListener('touchstart', closeMenu);
    }, 10);
    
    return () => {
      document.removeEventListener('click', closeMenu);
      document.removeEventListener('touchstart', closeMenu);
    };
  }, [showRadial, showReactionMenu]);

  const x = useMotionValue(0);
  const replyOpacity = useTransform(x, isMe ? [0, -50] : [0, 50], [0, 1]);
  const replyScale = useTransform(x, isMe ? [0, -50] : [0, 50], [0.5, 1.1]);

  const handleDragStart = () => {
    isDragging.current = true; 
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

  const handleBubbleClick = (e) => {
    e.stopPropagation(); 
    if (!isDragging.current && !showReactionMenu) {
      setShowRadial(true);
      window.navigator.vibrate?.(50); 
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation(); 
    if (isDragging.current) return;
    
    setReaction('❤️'); 
    setShowBurst(true);
    setShowRadial(false);
    setShowReactionMenu(false);
    
    setTimeout(() => {
      setShowBurst(false);
    }, 1400);
  };

  const handleAction = (actionId, e) => {
    e.stopPropagation();
    setShowRadial(false); 
    
    if (actionId === 'react') {
      setShowReactionMenu(true); 
    } else if (actionId === 'delete') {
     setShowDeleteMenu(true); // 👈 3. UPDATE THIS LINE
    } else if (actionId === 'edit') {
      if (onEdit) onEdit(msg);
    } else if (actionId === 'save') {
      if (onSave) onSave(msg);
    } else if (actionId === 'forward') {
      if (onForward) onForward(msg);
    }
  };

  const handleEmojiSelect = (emoji, e) => {
    e.stopPropagation();
    setReaction(emoji);
    setShowReactionMenu(false);
    
    if (emoji === '❤️') {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 1400);
    }
  };

  // 🚨 5-MINUTE TIME LIMIT LOGIC 🚨
  const activeActions = isMe ? MENU_ACTIONS.filter(a => {
    if (a.id === 'edit') {
      const msgTime = new Date(msg.createdAt || msg.timestamp || Date.now()).getTime();
      return (Date.now() - msgTime) < 5 * 60 * 1000; // 5 mins in milliseconds
    }
    return true;
  }) : MENU_ACTIONS.filter(a => a.id !== 'edit');
  
  return (
    <div className={`flex w-full group transform transition-all duration-300 my-2 ${isMe ? 'justify-end hover:-translate-x-1' : 'justify-start hover:translate-x-1'}`}>
      
      <div className="relative max-w-full flex items-center">
        
        <motion.div 
          style={{ opacity: replyOpacity, scale: replyScale }}
          className={`absolute ${isMe ? '-right-10' : '-left-10'} w-8 h-8 rounded-full bg-[#1A1F2E]/90 border border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.6)] flex items-center justify-center text-[#00f0ff] z-0 pointer-events-none`}
        >
          ↩️
        </motion.div>


<motion.div 
  drag="x"
  dragConstraints={{ left: 0, right: 0 }} 
  dragElastic={0.15} 
  onDragStart={handleDragStart} 
  onDragEnd={handleDragEnd}     
  style={{ x }} 
  className={`max-w-full flex flex-col relative cursor-grab active:cursor-grabbing ${showDeleteMenu ? 'z-[500]' : 'z-10'} ${isMe ? 'items-end' : 'items-start'}`}
>
          
          <motion.div
            animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -inset-1 rounded-3xl blur-lg z-0 pointer-events-none ${isMe ? 'bg-[#c11f70]/30' : 'bg-[#00f0ff]/20'}`}
          />

          <motion.div 
            whileTap={{ scale: 0.95 }}
            onClick={handleBubbleClick} 
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
            
                  
                  {/* 🚨 THE FIX: Added the audio condition inside the bubble */}
                  {msg.replyTo.image ? (
                    <div className="flex items-center gap-2 mt-1">
                      <img src={msg.replyTo.image} className="w-8 h-8 rounded object-cover border border-white/20" alt="reply img" />
                      <span className="opacity-80 font-semibold">Photo</span>
                    </div>
                  ) : msg.replyTo.video ? (
                    <div className="flex items-center gap-2 mt-1">
                      <video src={msg.replyTo.video} className="w-8 h-8 rounded object-cover border border-white/20" />
                      <span className="opacity-80 font-semibold">Video</span>
                    </div>
                  ) : msg.replyTo.audio ? (
                    <div className="flex items-center gap-2 mt-1 text-[#00f0ff]">
                      <span className="text-lg">🎤</span>
                      <span className="opacity-90 font-bold text-xs">Voice Message</span>
                    </div>
                  ) : (
                    msg.replyTo.text || "Attachment"
                  )}

                </div>
              </div>
            )}
            
          {children}
          </motion.div>

          {/* 🌟 4. THE INLINE SMART DELETE MENU 🌟 */}
          <AnimatePresence>
            {showDeleteMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                /* 🚨 THE FIX: Anchors perfectly to the INSIDE edge and drops DOWN safely! */
                className={`absolute z-[999999] bottom-[100%] mb-2 ${isMe ? 'right-0 origin-bottom-right' : 'left-0 origin-bottom-left'}`}
              >
                <div className="w-[200px] md:w-[240px] bg-[#121826]/95 backdrop-blur-2xl border border-red-500/50 rounded-2xl md:rounded-3xl shadow-[0_15px_50px_rgba(239,68,68,0.5)] p-3 flex flex-col">
                  
                  <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                    <h3 className="text-white font-black tracking-wide text-xs md:text-sm flex items-center gap-2">
                      <span className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">🗑️</span> Options
                    </h3>
                    <button onClick={(e) => { e.stopPropagation(); setShowDeleteMenu(false); }} className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors">
                      <IoMdClose size={12} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setShowDeleteMenu(false); onDelete('for_me', msg); }} className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all hover:scale-[1.02] text-left group border border-transparent hover:border-white/20">
                      <span className="text-sm">👤</span>
                      <span className="text-white font-bold text-[10px] md:text-xs group-hover:text-gray-200">Remove for me</span>
                    </button>

                    {isMe && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setShowDeleteMenu(false); onDelete('replace', msg); }} className="flex items-center gap-3 p-2 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 rounded-xl transition-all hover:scale-[1.02] text-left group border border-transparent hover:border-[#00f0ff]/40">
                          <span className="text-sm">📝</span>
                          <span className="text-[#00f0ff] font-bold text-[10px] md:text-xs">Replace message</span>
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); setShowDeleteMenu(false); onDelete('blur', msg); }} className="flex items-center gap-3 p-2 bg-[#bc00dd]/10 hover:bg-[#bc00dd]/20 rounded-xl transition-all hover:scale-[1.02] text-left group border border-transparent hover:border-[#bc00dd]/40">
                          <span className="text-sm">{msg.isBlurred ? '👁️' : '🌫️'}</span>
                          <span className="text-[#bc00dd] font-bold text-[10px] md:text-xs">{msg.isBlurred ? 'Unblur message' : 'Blur message'}</span>
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); setShowDeleteMenu(false); onDelete('for_everyone', msg); }} className="flex items-center gap-3 p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all hover:scale-[1.02] text-left group border border-transparent hover:border-red-500/40">
                          <span className="text-sm">🌍</span>
                          <span className="text-red-400 font-bold text-[10px] md:text-xs">Delete for everyone</span>
                        </button>
                      </>
                    )}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

          <AnimatePresence>
            {showReactionMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                className={`absolute -top-14 ${isMe ? 'right-0' : 'left-0'} z-[99999] flex items-center gap-2 md:gap-3 bg-[#1A1F2E]/95 backdrop-blur-2xl px-3 md:px-4 py-2 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/20`}
                onClick={(e) => e.stopPropagation()} 
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.4, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleEmojiSelect(emoji, e)}
                    className="text-2xl md:text-3xl hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showRadial && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="z-[99999]"
        style={{ position: 'absolute', bottom: '110%', left: isMe ? 'auto' : '0', right: isMe ? '0' : 'auto', transform: isMe ? 'translateX(-80px)' : 'translateX(80px)' }}
          onClick={(e) => e.stopPropagation()}
              ><div className="relative">
                  
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

                  {activeActions.map((action, i) => {
                    const angle = (i / activeActions.length) * Math.PI * 2 - Math.PI / 2;
                    const radius = 55; 
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