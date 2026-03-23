/**
 * components/feed/PostCard.jsx
 * The main property/super-app card shown in the feed.
 */
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CommentSheet from './CommentSheet';
import ShareSheet from './ShareSheet';
import { IoMdPin, IoMdMusicalNote } from 'react-icons/io';

const formatPrice = (price) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

export default function PostCard({ post: initialPost }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const [showNearbySearch, setShowNearbySearch] = useState(false);
  const [nearbyQuery, setNearbyQuery] = useState('');
  const [showShare, setShowShare] = useState(false);  
  const [showHeart, setShowHeart] = useState(false);

  const { ref: inViewRef, inView } = useInView({ threshold: 0.7 });
  
  useEffect(() => {
    if (!videoRef.current) return;

    if (inView) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setIsMuted(true));
      }
    } else {
      videoRef.current.pause();
    }
  }, [inView]);

  const requireAuth = () => {
    if (!user) { toast.error('Please login to continue.'); navigate('/login'); return false; }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth()) return;
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
    const wasLiked = post.isLiked;
    setPost(p => ({ ...p, isLiked: !wasLiked, likesCount: wasLiked ? p.likesCount - 1 : p.likesCount + 1 }));
    try {
      await api.put(`/posts/${post._id}/like`);
    } catch {
      setPost(p => ({ ...p, isLiked: wasLiked, likesCount: wasLiked ? p.likesCount + 1 : p.likesCount - 1 }));
      toast.error('Failed to like post.');
    }
  };

  const handleSave = async () => {
    if (!requireAuth()) return;
    const wasSaved = post.isSaved;
    setPost(p => ({ ...p, isSaved: !wasSaved }));
    try {
      await api.put(`/posts/${post._id}/save`);
      toast.success(wasSaved ? 'Removed from saved' : 'Saved to collection!');
    } catch {
      setPost(p => ({ ...p, isSaved: wasSaved }));
      toast.error('Failed to save.');
    }
  };

  const handleShare = () => setShowShare(true);

  const handleCall = () => {
    if (!requireAuth()) return;
    const phoneNumber = post.phone || post.author?.phone;
    if (phoneNumber) window.location.href = `tel:${phoneNumber}`;
    else toast.error("No contact number provided for this listing.");
  };

  const executeNearbySearch = () => {
    if (nearbyQuery.trim()) {
      const strictQuery = `${nearbyQuery} near ${post.location.lat},${post.location.lng}`;
      const mapUrl = `https://www.google.com/maps/search/$${encodeURIComponent(strictQuery)}`;
      window.open(mapUrl, '_blank');
    } else toast.error("Please enter a place to search (e.g., Hospital)");
  };

  const mediaHeight = 'h-[400px] md:h-[500px]';
  const isSocial = post.postType === 'Social' || post.mainCategory === 'Social';

  // ─── THE BRAIN: DYNAMIC CTA BUTTON LOGIC ───
  const renderCTA = () => {
    if (isSocial) return null; // No CTA for normal social posts

    // FOOD & CAFES
    if (post.mainCategory === 'Food & Cafes') {
      const hasLink = post.swiggyLink || post.zomatoLink || post.restaurantWebsite;
      const targetLink = hasLink ? (post.swiggyLink || post.zomatoLink || post.restaurantWebsite) : `tel:${post.phone}`;
      return (
        <a href={targetLink} target="_blank" rel="noreferrer" 
           className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-transform shadow-[0_5px_15px_rgba(239,68,68,0.3)]">
          {hasLink ? '🍔 Order Now' : '📍 Visit / Contact'}
        </a>
      );
    }

    // JOBS & GIGS
    if (post.mainCategory === 'Jobs & Gigs') {
      return (
        <a href={`tel:${post.phone}`} className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-transform shadow-[0_5px_15px_rgba(99,102,241,0.3)]">
          💼 Apply Now
        </a>
      );
    }

    // REAL ESTATE
    if (['Sale Hub', 'Rents', 'PGs & Co-Living'].includes(post.mainCategory)) {
      return (
        <button onClick={handleCall} className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-transform shadow-[0_5px_15px_rgba(0,240,255,0.3)]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          Contact Owner
        </button>
      );
    }

    // DEFAULT MARKETPLACE / OTHERS
    return (
      <button onClick={handleCall} className="mt-3 w-full flex items-center justify-center gap-2 bg-[#1E2532] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#2A3441] transition-colors border border-[#2A3441]">
        Contact Seller
      </button>
    );
  };

  return (
    <article className="card max-w-[470px] mx-auto mb-6 border border-[#1E2532] bg-[#0B0F19] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      
      {/* ── HEADER (Author Info) ── */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-3 group">
          {post.author?.profilePhoto ? (
            <img src={post.author.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00F0FF]/50 transition-all group-hover:ring-[#00F0FF]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0057FF] to-[#00F0FF] flex items-center justify-center font-bold text-sm text-white shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              {post.author?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className="text-sm font-black text-white tracking-wide group-hover:text-[#00F0FF] transition-colors">
              @{post.author?.username || 'user'}
              {post.author?.isVerified && <span className="ml-1 text-[#00F0FF] drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">✓</span>}
            </p>
            <p className="text-xs text-gray-400 capitalize font-medium">{post.author?.role || 'User'}</p>
          </div>
        </Link>
      </div>

      {/* ── MEDIA CONTAINER WITH FLOATING GLASS BADGES ── */}
      <div ref={inViewRef} onDoubleClick={handleLike} className={`relative bg-black ${mediaHeight} overflow-hidden cursor-pointer`}>
        {post.mediaType === 'video' ? (
          <>
          {/* Added CSS Filters to Video */}
          <video ref={videoRef} src={post.videoUrl} className={`w-full h-full object-cover ${post.mediaFilter || ''}`} loop muted={isMuted} playsInline preload="auto" />
            <button onClick={() => setIsMuted(m => !m)} className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/10 opacity-0 hover:opacity-100 transition-opacity z-20">
              <span className="bg-black/60 backdrop-blur-md rounded-full p-3 text-white border border-white/10 flex items-center gap-2 text-xs font-bold">
                {isMuted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                )}
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </button>
          </>
        ) : (
          <>
            {/* Added CSS Filters to Image */}
            <img src={post.images?.[currentImageIdx]?.url} alt={post.title} className={`w-full h-full object-cover transition-all duration-300 ${post.mediaFilter || ''}`} />
            {post.images?.length > 1 && (
              <>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 bg-[#0B0F19]/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 z-10">
                  {post.images.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(i); }} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIdx ? 'bg-[#00F0FF] w-4 shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'bg-white/50 w-1.5 hover:bg-white'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* 1. Category (Cyan Glass) - HIDE FOR SOCIAL */}
        {!isSocial && (
          <div className="absolute top-4 left-4 bg-[#0B0F19]/80 backdrop-blur-md text-[#00F0FF] text-[10px] font-black tracking-wider px-3 py-1.5 rounded-full uppercase border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.2)] z-10">
            {post.mainCategory}
          </div>
        )}

        {/* 2. Views (Dark Glass with Eye SVG) */}
        <div className="absolute top-4 right-4 bg-[#0B0F19]/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-sm z-10">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          {post.viewsCount?.toLocaleString() || 0}
        </div>

        {/* 3. Location (Dark Glass with Map Pin SVG) */}
        {post.district && !isSocial && (
          <div className="absolute bottom-4 left-4 bg-[#0B0F19]/80 backdrop-blur-md text-gray-200 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-sm z-10">
            <svg className="w-3.5 h-3.5 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {post.district}
          </div>
        )}

        {/* 4. Price (Golden Gradient) - HIDE FOR SOCIAL OR ZERO PRICE */}
        {!isSocial && post.price > 0 && (
          <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#F5A623] to-[#F76B1C] text-white text-[14px] font-black tracking-wide px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(245,166,35,0.4)] z-10">
            {formatPrice(post.price)}
          </div>
        )}
        
        {/* Heart Animation */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <svg className="w-24 h-24 text-red-500 animate-heart-pop drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
        )}

        {/* ── MUSIC TAG (Floating over media) ── */}
        {post.music && (
          <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 max-w-[80%]">
            <IoMdMusicalNote className="text-[#00F0FF] animate-pulse" size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest text-white truncate">
              {post.music}
            </span>
          </div>
        )}
      </div>

      {/* ── CONTENT & ACTIONS ── */}
      <div className="p-4 pb-5">
        
        {/* ACTION BUTTONS ROW */}
        <div className="flex items-center justify-between mb-4">
          
          {/* Left Side: Like, Comment, Share */}
          <div className="flex items-center gap-3">
            {/* Like */}
            <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151A25] border transition-all active:scale-95 ${post.isLiked ? 'text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'text-gray-400 border-[#1E2532] hover:text-white hover:border-gray-500'}`}>
              <svg className="w-4 h-4" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <span className="font-bold text-xs">{post.likesCount}</span>
            </button>

            {/* Comment */}
            <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151A25] border border-[#1E2532] text-gray-400 hover:text-white hover:border-[#00F0FF]/50 transition-all active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <span className="font-bold text-xs">{post.commentsCount}</span>
            </button>

            {/* Share */}
            <button onClick={handleShare} className="flex items-center justify-center w-8 h-8 rounded-full bg-[#151A25] border border-[#1E2532] text-gray-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/50 transition-all active:scale-95" title="Share Post">
              <svg className="w-4 h-4 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>

          {/* Right Side: Message, Save (Call button is moved to CTA) */}
          <div className="flex items-center gap-2">
            {/* Message */}
            <Link to={`/messages/${post.author?._id}`} className="flex items-center justify-center w-8 h-8 rounded-full bg-[#151A25] border border-[#1E2532] text-gray-400 hover:text-[#0057FF] hover:border-[#0057FF]/50 hover:shadow-[0_0_10px_rgba(0,87,255,0.2)] transition-all active:scale-95" title="Message User">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </Link>
            
            {/* Save */}
            <button onClick={handleSave} className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#151A25] border transition-all active:scale-95 ${post.isSaved ? 'text-yellow-400 border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'text-gray-400 border-[#1E2532] hover:text-white hover:border-gray-500'}`} title="Save Post">
              <svg className="w-4 h-4" fill={post.isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </button>
          </div>
        </div>

        {/* Post Details */}
        <div className="space-y-1.5">
          
          {/* Tagged Users */}
          {post.taggedUsers && post.taggedUsers.length > 0 && (
             <p className="text-[10px] font-black text-[#00F0FF] mb-1">With {post.taggedUsers.join(', ')}</p>
          )}

          <h3 className="font-black text-white text-[15px] tracking-wide truncate">{post.title}</h3>

          {/* DYNAMIC HUB DATA INJECTION (Badges) */}
          {!isSocial && (
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {/* Only show price tag here if it's Free or something, since the main price is on the image. But leaving it in case image doesn't load */}
              {post.salary && <span className="bg-[#1E2532] text-green-400 px-2 py-1 rounded text-[10px] font-black">{post.salary}</span>}
              {post.restaurantName && <span className="bg-[#1E2532] text-orange-400 px-2 py-1 rounded text-[10px] font-black">🍽️ {post.restaurantName}</span>}
              {post.jobRole && <span className="bg-[#1E2532] text-[#00F0FF] px-2 py-1 rounded text-[10px] font-black">{post.jobRole}</span>}
              {post.marketplaceCategory && <span className="bg-[#1E2532] text-yellow-400 px-2 py-1 rounded text-[10px] font-black">{post.marketplaceCategory}</span>}
              {post.educationCategory && <span className="bg-[#1E2532] text-indigo-400 px-2 py-1 rounded text-[10px] font-black">🎓 {post.educationCategory}</span>}
            </div>
          )}

          {/* ── LOCATION TAG (Social Mode) ── */}
          {post.locationTag && (
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <IoMdPin className="text-[#00F0FF]" size={12} />
              {post.locationTag}
            </div>
          )}

          {/* ── REAL ESTATE SPECS (Hide if Social) ── */}
          {(post.area && !isSocial) && (
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              {post.area} <span className="text-[#00F0FF] px-1">•</span> {post.bedrooms ? `${post.bedrooms} BHK` : post.propertyType}
            </p>
          )}

          {post.description && (
            <p className="text-xs text-gray-300 line-clamp-2 mt-2 leading-relaxed">{post.description}</p>
          )}

          {/* Glowing Hashtags */}
          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.hashtags.slice(0, 4).map(tag => (
                <Link key={tag} to={`/search?hashtag=${tag}`} className="text-[10px] font-bold tracking-wide text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/20 px-2.5 py-1 rounded-md hover:bg-[#00F0FF]/20 transition-colors">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* THE NEW DYNAMIC CTA BUTTON (Replaced old Contact UI) */}
          {renderCTA()}

          {/* Large Action Buttons (Map / Near Me) */}
          {(post.location?.lat && post.location?.lng) && !isSocial && (
            <div className="mt-4 pt-4 border-t border-[#1E2532]">
              <div className="flex gap-3">
                <a 
                  href={`https://www.google.com/maps/search/$${encodeURIComponent(post.location.lat + ',' + post.location.lng)}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 text-center inline-flex items-center justify-center gap-1.5 text-[11px] font-black tracking-wide uppercase bg-[#151A25] border border-[#1E2532] text-gray-400 hover:text-white px-3 py-3 rounded-xl transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                  View on Map
                </a>

                <button
                  onClick={() => setShowNearbySearch(!showNearbySearch)}
                  className={`flex-1 text-center inline-flex items-center justify-center gap-1.5 text-[11px] font-black tracking-wide uppercase border px-3 py-3 rounded-xl transition-all ${showNearbySearch ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-[#151A25] hover:bg-[#1E2532] text-gray-400 border-[#1E2532] hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  Near Me
                </button>
              </div>

              {/* Glassmorphism Nearby Search Input */}
              {showNearbySearch && (
                <div className="animate-fade-in flex gap-2 mt-3 bg-[#151A25] p-2.5 rounded-xl border border-[#1E2532] shadow-inner">
                  <input
                    type="text"
                    placeholder="e.g. Schools, Hospitals..."
                    value={nearbyQuery}
                    onChange={(e) => setNearbyQuery(e.target.value)}
                    className="flex-1 bg-[#0B0F19] border border-[#1E2532] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#00F0FF]/50 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') executeNearbySearch();
                    }}
                  />
                  <button
                    onClick={executeNearbySearch}
                    className="bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white text-xs font-black tracking-wide px-4 py-2 rounded-lg transition-all active:scale-95 shadow-[0_2px_10px_rgba(0,240,255,0.3)]"
                  >
                    GO
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="text-[9px] text-gray-500 mt-5 font-black uppercase tracking-widest">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      
      {showComments && (
        <CommentSheet
          postId={post._id}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setPost(p => ({ ...p, commentsCount: p.commentsCount + 1 }))}
        />
      )}

      {showShare && (
        <ShareSheet 
          post={post} 
          onClose={() => setShowShare(false)} 
        />
      )}
    </article>
  );
}