import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoMdMore } from 'react-icons/io';
import FeedCardWrapper from './FeedCardWrapper';
import CategoryBadge from './CategoryBadge';
import ActionButtons from './ActionButtons';
import api from '../../services/api'; // 👈 Added API import
import toast from 'react-hot-toast';  // 👈 Added Toast import

export default function SocialCard({ data, onAction }) {
  const { user, post, size } = data;
  const isGridItem = size === 'small';

  // 1. Initialize State for interactivity
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.stats?.likes || 0);
  
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [savesCount, setSavesCount] = useState(post.stats?.shares || 0);

  // 2. Like Function (Optimistic Update)
  // 2. Like Function (Bulletproof Optimistic Update)
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation(); 

    // Lock in the exact previous state before we change anything
    const prevLiked = isLiked;
    const prevCount = likesCount;
    
    // Instantly update UI (and explicitly prevent negative numbers)
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      // Send to backend
      await api.post(`/posts/${data.id}/like`);
    } catch (error) {
      // If it fails, restore the EXACT previous state
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error("Failed to like post");
    }
  };

  // 3. Save Function (Bulletproof Optimistic Update)
  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const prevSaved = isSaved;
    const prevCount = savesCount;

    setIsSaved(!prevSaved);
    setSavesCount(prevSaved ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      await api.post(`/posts/${data.id}/save`);
    } catch (error) {
      setIsSaved(prevSaved);
      setSavesCount(prevCount);
      toast.error("Failed to save post");
    }
  };

  return (
    <FeedCardWrapper variant="SOCIAL" size={size}>
      <div className="flex flex-col gap-4 w-full h-full justify-between">
        <div className="flex items-center justify-between w-full">
          <CategoryBadge type="SOCIAL" isLive={post.isLive} />
          <button className="text-gray-400 hover:text-white"><IoMdMore size={20} /></button>
        </div>
        
        {/* 🚨 DYNAMIC LAYOUT: Side-by-side if large, stacked if small */}
        <div className={`flex ${isGridItem ? 'flex-col' : 'flex-col md:flex-row'} gap-8 items-start justify-between w-full h-full mt-2`}>
          
          <div className="flex flex-col flex-1 justify-between h-full min-w-0 w-full">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-3">
                <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-purple-500/30" alt="" />
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-black text-base">{user.name}</span>
                  <span className="text-gray-500 text-xs">@{user.handle} • {post.time} {post.location && `• 📍 ${post.location}`}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                <h3 className="text-white font-black text-2xl tracking-tight">“{post.title}”</h3>
                {post.description && <p className="text-gray-300 text-sm leading-relaxed">{post.description}</p>}
              </div>

              {!isGridItem && (
                <div className="flex flex-col gap-3 mt-2">
                  
                  {/* 🎵 EXTRA SOCIAL CONTEXT: Music & Tagged Users 👤 */}
                  {(post.music || (post.taggedUsers && post.taggedUsers.length > 0)) && (
                    <div className="flex flex-wrap gap-2">
                      {post.music && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151A25]/80 border border-white/5 backdrop-blur-md">
                          <span className="text-purple-400 animate-pulse">🎵</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{post.music}</span>
                        </div>
                      )}
                      {post.taggedUsers && post.taggedUsers.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151A25]/80 border border-white/5 backdrop-blur-md">
                          <span className="text-indigo-400">👤</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                            {post.taggedUsers.length} Tagged
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* HASHTAGS */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase font-black tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isGridItem && (
              <div className="flex flex-col gap-4 mt-8 w-full">
                
                {/* 🚨 WIRED UP LARGE CARD ENGAGEMENT ROW 🚨 */}
                <div className="flex items-center gap-5 text-sm font-bold text-gray-400">
                  <button onClick={handleLike} className={`flex items-center gap-2 cursor-pointer transition-all active:scale-75 ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}>
                    <span className={isLiked ? "drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" : ""}>
                      {isLiked ? '❤️' : '🤍'}
                    </span> 
                    {likesCount}
                  </button>
                  
                  <button className="flex items-center gap-2 hover:text-[#00F0FF] cursor-pointer transition-all active:scale-75">
                    💬 {post.stats?.comments}
                  </button>
                  
                  <button onClick={handleSave} className={`flex items-center gap-2 cursor-pointer transition-all active:scale-75 ${isSaved ? 'text-[#0057FF]' : 'hover:text-[#0057FF]'}`}>
                    <span className={isSaved ? "drop-shadow-[0_0_8px_rgba(0,87,255,0.8)]" : ""}>
                      {isSaved ? '🚀' : '🔖'}
                    </span> 
                    {savesCount}
                  </button>
                </div>

                <ActionButtons variant="SOCIAL" onAction={onAction} />
              </div>
            )}
          </div>

          {post.media && (
            <div className={`${isGridItem ? 'w-full aspect-video' : 'w-full md:w-[50%] lg:w-[45%] aspect-square md:aspect-auto md:h-full'} rounded-[2rem] overflow-hidden relative shadow-[0_0_60px_rgba(168,85,247,0.25)] border-[3px] border-purple-500/40 shrink-0`}>
              <div className="absolute inset-0 bg-purple-500/20 mix-blend-overlay z-10 pointer-events-none" />
              <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.7 }} src={post.media} className="w-full h-full object-cover" />
            </div>
          )}

          {isGridItem && (
            // 🚨 WIRED UP SMALL GRID CARD ENGAGEMENT ROW 🚨
            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mt-auto pt-4 border-t border-white/5 w-full">
              <button onClick={handleLike} className={`flex items-center gap-1.5 transition-all active:scale-75 ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}>
                {isLiked ? '❤️' : '🤍'} {likesCount}
              </button>
              <button className="flex items-center gap-1.5 hover:text-[#00F0FF] transition-all active:scale-75">
                💬 {post.stats?.comments}
              </button>
            </div>
          )}
        </div>
      </div>
    </FeedCardWrapper>
  );
}