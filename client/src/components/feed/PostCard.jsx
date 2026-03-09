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

export default function PostCard({ post: initialPost }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

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
    <article className="card max-w-[470px] mx-auto mb-4 border border-zinc-800">
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-3">
        <Link to={`/profile/${post.author._id}`} className="flex items-center gap-2 group">
          {post.author.profilePhoto ? (
            <img src={post.author.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/50" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm">
              {post.author.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold group-hover:text-orange-400 transition-colors">
              @{post.author.username}
              {post.author.isVerified && <span className="ml-1 text-orange-500">✓</span>}
            </p>
            <p className="text-xs text-zinc-500 capitalize">{post.author.role}</p>
          </div>
        </Link>
        {/* Location badge */}
        {post.district && (
          <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
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
              className="cover"
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
        <div className="absolute top-3 left-3 bg-orange-500/90 text-white text-xs font-semibold px-2 py-1 rounded-full capitalize">
          {post.propertyType}
        </div>

        {/* Views count */}
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          👁 {post.viewsCount?.toLocaleString()}
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm transition-transform active:scale-95 ${post.isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`}>
              <span className="text-xl">{post.isLiked ? '❤️' : '🤍'}</span>
              <span>{post.likesCount}</span>
            </button>

            {/* Comment */}
            <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
              <span className="text-xl">💬</span>
              <span>{post.commentsCount}</span>
            </button>

            {/* Share / Contact Seller */}
            {post.author._id !== user?._id && (
              <Link to={`/messages/${post.author._id}`} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-orange-400 transition-colors">
                <span className="text-xl">✉️</span>
                <span className="hidden sm:inline text-xs">Contact</span>
              </Link>
            )}
          </div>

          {/* Save */}
          <button onClick={handleSave} className={`text-xl transition-transform active:scale-95 ${post.isSaved ? 'text-yellow-400' : 'text-zinc-400 hover:text-white'}`}>
            {post.isSaved ? '🔖' : '🏷️'}
          </button>
        </div>

        {/* ── Property Info ── */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm truncate max-w-[70%]">{post.title}</h3>
            <span className="text-orange-400 font-bold text-sm">{formatPrice(post.price)}</span>
          </div>

          {post.area && (
            <p className="text-xs text-zinc-500">{post.area} • {post.bedrooms ? `${post.bedrooms} BHK` : post.propertyType}</p>
          )}

          {post.description && (
            <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{post.description}</p>
          )}

          {/* Hashtags */}
          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {post.hashtags.slice(0, 4).map(tag => (
                <Link key={tag} to={`/search?hashtag=${tag}`} className="text-xs text-orange-400 hover:text-orange-300">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
          {/* Google Maps Button */}
{post.location?.lat && post.location?.lng && (
  <div className="mt-2">
    <a 
      href={`https://www.google.com/maps/search/?api=1&query=${post.location.lat},${post.location.lng}`}
      target="_blank" 
      rel="noreferrer" 
      className="inline-flex items-center gap-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-full transition-colors"
      onClick={e => e.stopPropagation()}
    >
      🗺️ View on Map
    </a>
  </div>
)}
          <p className="text-xs text-zinc-600 mt-1">
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