import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoMdMore } from 'react-icons/io';
import FeedCardWrapper from './FeedCardWrapper';
import CategoryBadge from './CategoryBadge';
import ActionButtons from './ActionButtons';
import api from '../../services/api'; // 👈 Added API import
import toast from 'react-hot-toast';  // 👈 Added Toast import
import { IoHeartOutline, IoHeart, IoChatbubbleOutline, IoBookmarkOutline, IoBookmark, IoShareSocialOutline, IoSend } from 'react-icons/io5';
export default function SocialCard({ data, onAction }) {
  const { user, post, size } = data;
  const isGridItem = size === 'small';

  // 1. Initialize State for interactivity
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.stats?.likes || 0);
  
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [savesCount, setSavesCount] = useState(post.stats?.shares || 0);

  // ─── COMMENT STATE & LOGIC ───
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments when card loads
  React.useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/posts/${data.id}/comments`);
        if (res.data.success) setComments(res.data.data);
      } catch (error) { console.error("Failed to fetch comments"); }
    };
    fetchComments();
  }, [data.id]);

  // ─── VIDEO AUTO-PAUSE/PLAY ON SCROLL ───
  const mobileVideoRef = React.useRef(null);
  const desktopVideoRef = React.useRef(null);

  React.useEffect(() => {
    const handleVideoScroll = (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        // If 60% of the video is visible on screen, play it. Otherwise, pause it.
        if (entry.isIntersecting) {
          video.play().catch(e => console.log("Autoplay prevented:", e));
        } else {
          video.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handleVideoScroll, { threshold: 0.6 });

    if (mobileVideoRef.current) observer.observe(mobileVideoRef.current);
    if (desktopVideoRef.current) observer.observe(desktopVideoRef.current);

    return () => observer.disconnect();
  }, [post.media]);

  // Handle posting a new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/posts/${data.id}/comments`, { text: newComment });
      if (res.data.success) {
        setComments([res.data.data, ...comments]); // Add to top
        setNewComment('');
      }
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      await api.put(`/posts/${data.id}/like`);
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
      await api.put(`/posts/${data.id}/save`);
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
          <CategoryBadge type="SOCIAL" />
          <button className="text-gray-400 hover:text-white"><IoMdMore size={20} /></button>
        </div>
        
        
        {/* 🚨 DYNAMIC LAYOUT: Flawless Responsive Structure */}
        <div className={`flex ${isGridItem ? 'flex-col' : 'flex-col md:flex-row'} gap-8 items-start justify-between w-full h-full mt-2`}>
          
          {/* LEFT COLUMN: User Info, Text, Engagement */}
          <div className="flex flex-col flex-1 justify-between h-full min-w-0 w-full">
            
            <div className="flex flex-col gap-4 w-full">
              
              {/* 1. USER PROFILE ROW */}
              <div className="flex items-center gap-3">
                <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-purple-500/30" alt="" />
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-black text-base">{user.name}</span>
                  <span className="text-gray-500 text-xs">@{user.handle}</span>
                </div>
              </div> 
              
              {/* 2. POST TITLE & DESCRIPTION (Now safely on a new line) */}
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
            </div> {/* Closes Text Section */}

{/* 📱 MOBILE MEDIA (Supports Video & Image, full bleed edge-to-edge) */}
            {post.media && (
              <div className="md:hidden w-full my-4 -mx-4 bg-[#05070A]" style={{ width: 'calc(100% + 2rem)' }}>
                <div className={`relative border-y border-purple-500/30 ${isGridItem ? 'aspect-video' : ''}`} style={{ overflow: 'visible' }}>
                  <div className="absolute inset-0 bg-purple-500/10 mix-blend-overlay z-10 pointer-events-none" />
                  
                  {post.media.match(/\.(mp4|webm|ogg|mov)$/i) || post.media.includes('/video/') ? (
                    <video
  ref={mobileVideoRef}
  src={post.media}
  className="w-full h-auto max-h-[55vh] object-contain block relative z-30 bg-[#05070A]"
  muted
  loop
  playsInline
  controls
  onDoubleClick={() => {
    const vid = mobileVideoRef.current;
    if (!vid) return;
    if (vid.requestFullscreen) vid.requestFullscreen();
    else if (vid.webkitRequestFullscreen) vid.webkitRequestFullscreen(); // Safari/iOS
    else if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen();     // iOS fallback
  }}
  onClick={(e) => {
    const vid = mobileVideoRef.current;
    if (!vid) return;
    vid.paused ? vid.play() : vid.pause();
  }}
/>
                  ) : (
                    <motion.img
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.7 }}
                      src={post.media}
                      className="w-full object-cover object-top block max-h-[55vh] relative z-0"
                    />
                  )}
                  
                </div>
              </div>
            )}

            {/* 💬 ENGAGEMENT & COMMENTS SECTION */}
            {!isGridItem && (
              <div className="flex flex-col gap-4 mt-2 w-full self-end">
                {/* 🚨 PREMIUM WIRED UP LARGE CARD ENGAGEMENT ROW 🚨 */}
                <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                  
                  {/* LIKE BUTTON */}
                  <button 
                    onClick={handleLike} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 active:scale-95 ${
                      isLiked 
                        ? 'bg-[#FF007A]/10 text-[#FF007A] shadow-[0_0_15px_rgba(255,0,122,0.15)] border border-[#FF007A]/20' 
                        : 'bg-transparent border border-transparent hover:bg-white/5 hover:text-[#FF007A]'
                    }`}
                  >
                    {isLiked ? <IoHeart size={20} className="drop-shadow-[0_0_8px_rgba(255,0,122,0.8)]" /> : <IoHeartOutline size={20} />}
                    <span className="font-black tracking-wider">{likesCount}</span>
                  </button>
                  
                  {/* COMMENT BUTTON */}
  <button 
    onClick={() => setShowComments(!showComments)} 
    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 active:scale-95 ${showComments ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20' : 'bg-transparent border border-transparent hover:bg-[#00F0FF]/10 hover:text-[#00F0FF]'}`}
  >
    <IoChatbubbleOutline size={20} />
    <span className="font-black tracking-wider">{post.stats?.comments + (comments.length > (post.stats?.comments || 0) ? comments.length - (post.stats?.comments || 0) : 0)}</span>
  </button>
                  
                  {/* SAVE BUTTON */}
                  <button 
                    onClick={handleSave} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 active:scale-95 ${
                      isSaved 
                        ? 'bg-[#0057FF]/10 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.15)] border border-[#0057FF]/30' 
                        : 'bg-transparent border border-transparent hover:bg-white/5 hover:text-[#0057FF]'
                    }`}
                  >
                    {isSaved ? <IoBookmark size={20} className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" /> : <IoBookmarkOutline size={20} />}
                    <span className="font-black tracking-wider">{savesCount}</span>
                  </button>

                  {/* SHARE BUTTON (Visual Only) */}
                  <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-transparent border border-transparent transition-all duration-300 active:scale-95 hover:bg-purple-500/10 hover:text-purple-400 ml-auto">
                    <IoShareSocialOutline size={20} />
                  </button>

                </div>

                {/* 💬 TOP COMMENT PREVIEW (Shows when collapsed) */}
    {comments.length > 0 && !showComments && (
      <div onClick={() => setShowComments(true)} className="group cursor-pointer rounded-2xl p-3 bg-white/5 border border-white/5 hover:border-white/10 transition-colors mt-2">
        <div className="flex gap-3 items-center">
          <img src={comments[0].author?.profilePhoto || 'https://i.pravatar.cc/150'} className="w-6 h-6 rounded-full object-cover" alt="" />
          <div className="text-sm truncate flex-1">
            <span className="font-bold text-white mr-2">{comments[0].author?.username || 'User'}</span>
            <span className="text-gray-400">{comments[0].text}</span>
          </div>
        </div>
        {comments.length > 1 && (
          <p className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest mt-2 ml-9 group-hover:underline">
            View all {comments.length} comments
          </p>
        )}
      </div>
    )}

    {/* 💬 EXPANDED COMMENT SECTION */}
    {showComments && (
      <div className="flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Comment Input */}
        <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-[#151A25] border border-[#1E2532] rounded-full px-5 py-2.5 text-sm text-white outline-none focus:border-[#00F0FF]/50 transition-colors shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!newComment.trim() || isSubmitting}
            className="p-2.5 rounded-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            <IoSend size={16} className="ml-0.5" />
          </button>
        </form>

        {/* Scrollable Comment List */}
        <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <img src={c.author?.profilePhoto || 'https://i.pravatar.cc/150'} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
              <div className="flex flex-col bg-[#151A25] border border-[#1E2532] rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[85%]">
                <span className="font-bold text-white text-xs mb-0.5">{c.author?.username || 'User'}</span>
                <span className="text-gray-300 text-sm leading-snug">{c.text}</span>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-center text-xs text-gray-500 py-4">No comments yet. Be the first!</p>}
        </div>
      </div>
    )}
              </div>
            )}
          </div> {/* 🚨 THIS IS THE CRITICAL DIV THAT CLOSES THE LEFT COLUMN! 🚨 */}

          {/* 💻 LAPTOP MEDIA (Supports Video & Image) */}
          {post.media && (
            <div className={`hidden md:flex shrink-0 ml-auto ${isGridItem ? 'w-full aspect-video' : 'w-[50%] lg:w-[45%]'}`}>
              <div className="relative overflow-hidden rounded-[2rem] shadow-[0_0_60px_rgba(168,85,247,0.25)] border-[3px] border-purple-500/40 w-full max-h-[600px] bg-[#05070A]">
                <div className="absolute inset-0 bg-purple-500/20 mix-blend-overlay z-10 pointer-events-none" />
                
                {post.media.match(/\.(mp4|webm|ogg|mov)$/i) || post.media.includes('/video/') ? (
                  <video ref={desktopVideoRef} src={post.media} className="w-full h-full max-h-[600px] object-cover object-center block relative z-20" muted loop playsInline controls />
                ) : (
                  <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.7 }} src={post.media} className="w-full h-full max-h-[600px] object-cover object-center block relative z-0" />
                )}
                
              </div>
            </div>
          )}

          {/* GRID LAYOUT ENGAGEMENT ROW (For small cards only) */}
          {isGridItem && (
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 w-full">
              <div className="flex items-center gap-1">
                <button onClick={handleLike} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300 active:scale-95 text-xs ${isLiked ? 'bg-[#FF007A]/10 text-[#FF007A]' : 'hover:bg-white/5 text-gray-400 hover:text-[#FF007A]'}`}>
                  {isLiked ? <IoHeart size={16} /> : <IoHeartOutline size={16} />}
                  <span className="font-black">{likesCount}</span>
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300 active:scale-95 text-xs text-gray-400 hover:bg-[#00F0FF]/10 hover:text-[#00F0FF]">
                  <IoChatbubbleOutline size={16} />
                  <span className="font-black">{post.stats?.comments}</span>
                </button>
              </div>
              <button onClick={handleSave} className={`p-2 rounded-full transition-all duration-300 active:scale-95 ${isSaved ? 'text-[#00F0FF]' : 'text-gray-400 hover:text-[#00F0FF] hover:bg-white/5'}`}>
                {isSaved ? <IoBookmark size={16} /> : <IoBookmarkOutline size={16} />}
              </button>
            </div>
          )}

        </div>
      </div>
    </FeedCardWrapper>
  );
}