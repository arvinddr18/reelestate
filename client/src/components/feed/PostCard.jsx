import React, { useState } from 'react';
import { IoMdHeart, IoMdChatbubbles, IoMdShareAlt, IoMdBookmark, IoMdPlay, IoMdCheckmarkCircle, IoMdChatboxes } from 'react-icons/io';

// Helper to ensure images load
const getMedia = (post) => {
  if (post.images && post.images.length > 0) return post.images[0].url || post.images[0];
  if (post.image) return post.image;
  return `https://picsum.photos/seed/${post._id}/600/400`; // Fallback beautiful image
};

export default function PostCard({ post, onMediaClick }) {
  const [isNodded, setIsNodded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // ─── THE ADAPTIVE ENGINE: Determines card style based on category ───
  const category = post.mainCategory || 'Social';
  
  let cardType = 'lifestyle';
  if (['Marketplace', 'Sale Hub', 'Rents', 'Motors', 'Home Services'].includes(category)) cardType = 'marketplace';
  if (['Travel', 'Events', 'Cinema'].includes(category)) cardType = 'media';
  if (['Education', 'Learning'].includes(category)) cardType = 'learning';
  if (['Food', 'Food & Cafes'].includes(category)) cardType = 'food';
  if (['Entertainment', 'Meme'].includes(category)) cardType = 'entertainment';

  // ─── SHARED UI COMPONENTS ───
  const CreatorHeader = ({ glowColor, showBadge = true }) => (
    <div className="flex items-center justify-between p-5 z-10 relative">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr ${glowColor} overflow-hidden shadow-lg`}>
          <img 
            src={post.creator?.profilePhoto || `https://ui-avatars.com/api/?name=${post.creator?.username || 'User'}`} 
            className="w-full h-full rounded-full border border-[#0B0F19] object-cover" 
            alt="creator" 
          />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-white font-black text-sm tracking-wide">@{post.creator?.username || 'nodexa_user'}</span>
            <IoMdCheckmarkCircle className="text-[#00F0FF]" size={14} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-gray-400 font-bold">{new Date(post.createdAt).toLocaleDateString()}</span>
            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
            <span className="text-[10px] text-gray-400 font-bold">{post.location || 'Global Network'}</span>
          </div>
        </div>
      </div>
      <button className="text-gray-400 hover:text-white transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
      </button>
    </div>
  );

  const ActionBar = ({ primaryAction = "Nod", primaryIcon = <IoMdHeart size={18} />, actionColor = "text-[#00F0FF]", actionBg = "hover:bg-[#00F0FF]/10" }) => (
    <div className="p-2 border-t border-[#1E2532] bg-[#0B0F19]/50 backdrop-blur-md rounded-b-[32px] flex items-center justify-between">
      <div className="flex gap-1">
        <button 
          onClick={() => setIsNodded(!isNodded)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isNodded ? `${actionColor} ${actionBg}` : 'text-gray-400 hover:text-white hover:bg-[#151A25]'}`}
        >
          {primaryIcon} {primaryAction}
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-[#151A25] transition-all">
          <IoMdChatbubbles size={18} /> Comment
        </button>
        <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-[#151A25] transition-all">
          <IoMdShareAlt size={18} /> Share
        </button>
      </div>
      <button 
        onClick={() => setIsSaved(!isSaved)}
        className={`px-4 py-2.5 rounded-2xl transition-all ${isSaved ? actionColor : 'text-gray-400 hover:text-white'}`}
      >
        <IoMdBookmark size={20} />
      </button>
    </div>
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. MARKETPLACE / SALE HUB CARD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (cardType === 'marketplace') {
    return (
      <div className="w-full bg-[#0B0F19] rounded-[32px] border border-[#1E2532] overflow-hidden shadow-lg group hover:border-emerald-500/30 transition-all duration-500">
        <CreatorHeader glowColor="from-emerald-400 to-teal-500" />
        
        <div className="px-5 pb-4">
          <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest mb-3">
            {category}
          </span>
          <h2 className="text-xl font-black text-white mb-4 tracking-tight">{post.title || 'Premium Listing'}</h2>
          
          <div className="relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)]" onClick={onMediaClick}>
            <img src={getMedia(post)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="listing" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-80" />
            
            {/* Massive Price Tag Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] text-emerald-400 font-black tracking-widest uppercase mb-0.5 drop-shadow-md">Asking Price</p>
                <p className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  {post.price ? `₹${post.price.toLocaleString('en-IN')}` : 'Contact Seller'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4 text-xs font-bold text-gray-400">
            <span className="flex items-center gap-1.5"><IoMdHeart className="text-emerald-500" /> {post.likesCount || 0}</span>
            <span className="flex items-center gap-1.5"><IoMdChatbubbles /> {post.commentsCount || 0}</span>
          </div>
        </div>
        
        <ActionBar primaryAction="Interested" actionColor="text-emerald-400" actionBg="bg-emerald-500/10 border border-emerald-500/20" />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. TRAVEL / CINEMA / EVENTS CARD (Video Focused)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (cardType === 'media') {
    return (
      <div className="w-full bg-[#0B0F19] rounded-[32px] overflow-hidden shadow-lg relative group">
        {/* Full bleed image background */}
        <div className="absolute inset-0">
          <img src={getMedia(post)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="travel" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/90 via-[#0B0F19]/40 to-[#0B0F19]" />
        </div>

        <div className="relative z-10 flex flex-col h-[500px]">
          <CreatorHeader glowColor="from-[#F5A623] to-[#FF4B2B]" />
          
          <div className="flex-1 flex items-center justify-center cursor-pointer" onClick={onMediaClick}>
            {/* Giant Play Button */}
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-[#F5A623]/20 group-hover:border-[#F5A623]/50 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <IoMdPlay size={32} className="text-white ml-1 group-hover:text-[#F5A623] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </div>
          </div>

          <div className="px-5 pb-5">
            <span className="inline-block px-3 py-1 bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30 rounded-lg text-[9px] font-black uppercase tracking-widest mb-3 backdrop-blur-md">
              {category}
            </span>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight drop-shadow-lg">{post.title || post.content}</h2>
            <div className="flex gap-4 mt-2 text-xs font-bold text-gray-300">
              <span className="flex items-center gap-1.5"><IoMdHeart className="text-[#F5A623]" /> {post.likesCount || 0}</span>
              <span className="flex items-center gap-1.5"><IoMdChatbubbles /> {post.commentsCount || 0}</span>
            </div>
          </div>
          
          <ActionBar primaryAction="Nod" actionColor="text-[#F5A623]" actionBg="bg-[#F5A623]/10" />
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. LEARNING / EDUCATION CARD (Progress Bar)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (cardType === 'learning') {
    return (
      <div className="w-full bg-[#151A25] rounded-[32px] border border-[#1E2532] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0057FF]/10 rounded-full blur-[40px] pointer-events-none" />
        
        <CreatorHeader glowColor="from-[#0057FF] to-[#00F0FF]" />
        
        <div className="px-5 pb-4 flex gap-4">
          <div className="flex-1">
             <span className="inline-block px-3 py-1 bg-[#0057FF]/20 text-[#00F0FF] border border-[#00F0FF]/20 rounded-lg text-[9px] font-black uppercase tracking-widest mb-3">
              {category}
            </span>
            <h2 className="text-lg font-black text-white mb-1 leading-snug">{post.title || 'Mastering New Skills'}</h2>
            <p className="text-xs text-gray-400 font-medium line-clamp-2 mb-4">{post.content}</p>
            
            {/* Progress Bar UI */}
            <div className="w-full bg-[#0B0F19] rounded-full h-2.5 mb-1 border border-[#1E2532]">
              <div className="bg-gradient-to-r from-[#0057FF] to-[#00F0FF] h-full rounded-full shadow-[0_0_10px_#00F0FF]" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest">
              <span>Course Progress</span>
              <span className="text-[#00F0FF]">65%</span>
            </div>
          </div>
          
          {/* Side Thumbnail */}
          <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden border border-[#1E2532] relative group cursor-pointer" onClick={onMediaClick}>
             <img src={getMedia(post)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="course" />
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
               <IoMdPlay size={20} className="text-white drop-shadow-md" />
             </div>
          </div>
        </div>
        
        <ActionBar primaryAction="Save Course" actionColor="text-[#0057FF]" actionBg="bg-[#0057FF]/10" />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DEFAULT: LIFESTYLE / SOCIAL CARD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="w-full bg-[#0B0F19] rounded-[32px] border border-[#1E2532] overflow-hidden shadow-lg group hover:shadow-[0_10px_40px_rgba(168,85,247,0.1)] transition-shadow duration-500">
      <CreatorHeader glowColor="from-purple-600 to-pink-500" />
      
      {/* 🚨 CHANGED TO A FLEX ROW HERE 🚨 */}
      <div className="px-5 pb-4 flex flex-col md:flex-row gap-5">
        
        {/* LEFT SIDE: Text & Meta Data */}
        <div className="flex-1 flex flex-col justify-start">
          <div>
            <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest mb-3">
              {category}
            </span>
            <h2 className="text-xl font-black text-white mb-2 leading-tight">{post.title || 'Purple Vibes 💜'}</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">{post.content}</p>
            
            {/* Hashtag Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['#fashion', '#purple', '#ootd'].map((tag, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-[#151A25] border border-[#1E2532] text-[10px] font-bold text-gray-500 hover:text-purple-400 hover:border-purple-500/30 transition-colors cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Engagement Stats - Tucked neatly under the text */}
          <div className="flex gap-4 text-xs font-bold text-gray-500 mt-auto pt-2">
            <span className="flex items-center gap-1.5 hover:text-red-400 cursor-pointer transition-colors"><IoMdHeart className="text-red-500" /> {post.likesCount || 128}</span>
            <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors"><IoMdChatbubbles /> {post.commentsCount || 23}</span>
            <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors"><IoMdShareAlt /> 5</span>
          </div>
        </div>

        {/* RIGHT SIDE: Compact Media Preview */}
        <div className="w-full md:w-[220px] h-[180px] shrink-0 relative rounded-[20px] overflow-hidden cursor-pointer border border-[#1E2532] group-hover:border-purple-500/30 transition-colors" onClick={onMediaClick}>
          <img src={getMedia(post)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="post media" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-black text-white tracking-widest border border-white/10">
            1/3
          </div>
        </div>

      </div>
      
      <ActionBar primaryAction="Nod" actionColor="text-purple-400" actionBg="bg-purple-500/10 border border-purple-500/20" />
    </div>
  );
}