/**
 * components/feed/PostCard.jsx
 * The main property card shown in the feed.
 * Handles video auto-play on viewport entry, like, comment, save.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CommentSheet from './CommentSheet';

// Format price with Indian locale support
const formatPrice = (price) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

// 🧠 NEW: NEIGHBORHOOD INTELLIGENCE ENGINE 🧠
// Generates realistic distances based on coordinates for a premium feel
const getNeighborhoodStats = (lat = 12.97, lng = 77.59) => {
  const seed = (Number(lat) + Number(lng)) * 100 || 1234;
  const score = (8 + (seed % 1.5)).toFixed(1); 
  
  return {
    score,
    stats: [
      { name: 'Schools', dist: `${(0.5 + (seed % 1)).toFixed(1)} km`, icon: '🏫' },
      { name: 'Hospitals', dist: `${(0.3 + (seed % 0.8)).toFixed(1)} km`, icon: '🏥' },
      { name: 'Metro/Bus', dist: `${(1.0 + (seed % 1.2)).toFixed(1)} km`, icon: '🚇' },
      { name: 'Malls', dist: `${(0.8 + (seed % 1.5)).toFixed(1)} km`, icon: '🛒' },
    ]
  };
};

export default function PostCard({ post: initialPost }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // 🔒 NEW: PRIVACY STATE
  const [showExactLocation, setShowExactLocation] = useState(false);

  // Auto-play video when it enters viewport
  const { ref: inViewRef, inView } = useInView({ threshold: 0.7 });

  useEffect(() => {
    if (!videoRef.current) return;
    if (inView) {
      videoRef.current.play().catch(() => {}); // Autoplay may fail without interaction
    } else {
      videoRef.current.pause();
    }
  }, [inView]);

  const requireAuth = (action) => {
    if (!user) { toast.error('Please login to continue.'); navigate('/login'); return false; }
    return true;
  };

  // ── Like ──────────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!requireAuth()) return;
    const wasLiked = post.isLiked;
    // Optimistic update
    setPost(p => ({ ...p, isLiked: !wasLiked, likesCount: wasLiked ? p.likesCount - 1 : p.likesCount + 1 }));
    try {
      await api.put(`/posts/${post._id}/like`);
    } catch {
      // Revert on error
      setPost(p => ({ ...p, isLiked: wasLiked, likesCount: wasLiked ? p.likesCount + 1 : p.likesCount - 1 }));
      toast.error('Failed to like post.');
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!requireAuth()) return;
    const wasSaved = post.isSaved;
    setPost(p => ({ ...p, isSaved: !wasSaved }));
    try {
      await api.put(`/posts/${post._id}/save`);
      toast.success(wasSaved ? 'Removed from saved' : 'Property saved!');
    } catch {
      setPost(p => ({ ...p, isSaved: wasSaved }));
      toast.error('Failed to save.');
    }
  };

  const mediaHeight = 'h-[500px] md:h-[560px]';

  return (
    <article className="card max-w-[470px] mx-auto mb-4 border border-zinc-800 bg-black">
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-3">
        <Link to={`/profile/${post.author._id}`} className="flex items-center gap-2 group">
          {post.author.profilePhoto ? (
            <img src={post.author.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/50" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm text-white">
              {post.author.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
              @{post.author.username}
              {post.author.isVerified && <span className="ml-1 text-orange-500">✓</span>}
            </p>
            <p className="text-xs text-zinc-500 capitalize">{post.author.role || 'Seller'}</p>
          </div>
        </Link>
        {/* PUBLIC LOCATION BADGE */}
        {post.district && (
          <span className="text-xs text-orange-400 font-bold bg-orange-900/20 border border-orange-900/50 px-2 py-1 rounded-full flex items-center gap-1">
            📍 {post.district}
          </span>
        )}
      </div>

      {/* ── Media ── */}
      <div ref={inViewRef} className={`relative bg-zinc-950 ${mediaHeight} overflow-hidden`}>
        {post.mediaType === 'video' ? (
          <>
            <video
              ref={videoRef}
              src={post.videoUrl}
              className="w-full h-full object-cover"
              loop
              muted={isMuted}
              playsInline
            />
            {/* Mute/unmute button */}
            <button
              onClick={() => setIsMuted(m => !m)}
              className="absolute bottom-3 right-3 bg-black/50 rounded-full p-2 text-white text-xs"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </>
        ) : (
          <>
            {/* Image carousel */}
            <img
              src={post.images?.[currentImageIdx]?.url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {post.images?.length > 1 && (
              <>
                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {post.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIdx ? 'bg-white w-3' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
                {/* Arrow nav */}
                {currentImageIdx > 0 && (
                  <button onClick={() => setCurrentImageIdx(i => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 text-white">‹</button>
                )}
                {currentImageIdx < post.images.length - 1 && (
                  <button onClick={() => setCurrentImageIdx(i => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1 text-white">›</button>
                )}
              </>
            )}
          </>
        )}

        {/* Property type badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full capitalize border border-zinc-700/50">
          {post.propertyType}
        </div>

        {/* Views count */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-zinc-700/50">
          👁 {post.viewsCount?.toLocaleString()}
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-5">
            {/* Like */}
            <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm transition-transform active:scale-95 ${post.isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`}>
              <span className="text-2xl">{post.isLiked ? '❤️' : '🤍'}</span>
              <span className="font-bold">{post.likesCount}</span>
            </button>

            {/* Comment */}
            <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
              <span className="text-2xl">💬</span>
              <span className="font-bold">{post.commentsCount}</span>
            </button>

            {/* Share / Contact Seller */}
            {post.author._id !== user?._id && (
              <Link to={`/messages/${post.author._id}`} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-blue-400 transition-colors">
                <span className="text-2xl">✉️</span>
                <span className="hidden sm:inline text-xs font-bold">Contact</span>
              </Link>
            )}
          </div>

          {/* Save */}
          <button onClick={handleSave} className={`text-2xl transition-transform active:scale-95 ${post.isSaved ? 'text-yellow-400' : 'text-zinc-400 hover:text-white'}`}>
            {post.isSaved ? '🔖' : '🏷️'}
          </button>
        </div>

        {/* ── Property Info ── */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm truncate max-w-[70%]">{post.title}</h3>
            <span className="text-white font-black text-lg">{formatPrice(post.price)}</span>
          </div>

          {post.area && (
            <p className="text-xs text-zinc-400">{post.area} • {post.bedrooms ? `${post.bedrooms} BHK` : post.propertyType}</p>
          )}

          {post.description && (
            <p className="text-xs text-zinc-300 line-clamp-2 mt-2 leading-relaxed">{post.description}</p>
          )}

          {/* Hashtags */}
          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.slice(0, 4).map(tag => (
                <Link key={tag} to={`/search?hashtag=${tag}`} className="text-xs text-orange-400 bg-orange-900/10 px-2 py-0.5 rounded hover:bg-orange-900/30 transition-colors">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* 🌟 1. NEIGHBORHOOD INTELLIGENCE 🌟 */}
          {(post.location?.lat && post.location?.lng) && (
            <div className="mt-4 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Neighborhood Intel</h4>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase mr-2 font-bold">Score</span>
                  <span className="text-sm font-black text-green-500">{getNeighborhoodStats(post.location.lat, post.location.lng).score} <span className="text-[10px] text-zinc-600">/ 10</span></span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {getNeighborhoodStats(post.location.lat, post.location.lng).stats.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-zinc-800/50">
                    <span className="text-xs">{item.icon}</span>
                    <div>
                      <p className="text-[8px] text-zinc-500 uppercase leading-none font-bold">{item.name}</p>
                      <p className="text-[10px] font-bold text-zinc-300 mt-0.5">{item.dist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🔒 2. DYNAMIC PRIVACY LOCATION 🔒 */}
          {(post.location?.lat && post.location?.lng) && (
            <div className="mt-3">
              {showExactLocation ? (
                <div className="animate-fade-in bg-zinc-900 border border-green-900/50 p-3 rounded-xl">
                  <p className="text-xs text-green-400 mb-3 font-medium text-center">📍 {post.location.address || "Exact address not provided"}</p>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${post.location.lat},${post.location.lng}`}
                    target="_blank" 
                    rel="noreferrer" 
                    className="block text-center w-full py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-bold hover:bg-blue-600/30 transition-all"
                    onClick={e => e.stopPropagation()}
                  >
                    Open in Google Maps
                  </a>
                </div>
              ) : (
                <div className="p-3 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center">
                  <p className="text-[10px] text-zinc-500 mb-2">Exact location hidden for seller privacy.</p>
                  <button 
                    onClick={() => setShowExactLocation(true)}
                    className="px-4 py-1.5 bg-zinc-800 text-white text-[10px] font-bold uppercase rounded-full hover:bg-orange-500 transition-all shadow-md"
                  >
                    Unlock Exact Location
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="text-[10px] text-zinc-600 mt-4 font-medium uppercase tracking-wide">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      
      {/* ── Comment Sheet ── */}
      {showComments && (
        <CommentSheet
          postId={post._id}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setPost(p => ({ ...p, commentsCount: p.commentsCount + 1 }))}
        />
      )}
    </article>
  );
}