/**
 * components/feed/PostCard.jsx
 * The main property card shown in the feed.
 */
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CommentSheet from './CommentSheet';
import ShareSheet from './ShareSheet'; // Add this line

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

  const { ref: inViewRef, inView } = useInView({ threshold: 0.7 });
  
  useEffect(() => {
    if (!videoRef.current) return;

    if (inView) {
      // play() returns a promise in modern browsers
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If auto-play is blocked, we make sure it's muted and try again
          setIsMuted(true);
        });
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
      toast.success(wasSaved ? 'Removed from saved' : 'Property saved!');
    } catch {
      setPost(p => ({ ...p, isSaved: wasSaved }));
      toast.error('Failed to save.');
    }
  };

  const handleShare = () => {
    // This opens your custom Instagram-style Share Sheet
    setShowShare(true);
  };

  const handleCall = () => {
    if (!requireAuth()) return;
    const phoneNumber = post.phone || post.author.phone;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast.error("No phone number provided for this property.");
    }
  };

  const executeNearbySearch = () => {
    if (nearbyQuery.trim()) {
      const strictQuery = `${nearbyQuery} near ${post.location.lat},${post.location.lng}`;
      const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(strictQuery)}`;
      window.open(mapUrl, '_blank');
    } else {
      toast.error("Please enter a place to search (e.g., Hospital)");
    }
  };

  const mediaHeight = 'h-[500px] md:h-[560px]';

  return (
    <article className="card max-w-[470px] mx-auto mb-4 border border-zinc-800 bg-black">
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
        {post.district && (
          <span className="text-xs text-orange-400 font-bold bg-orange-900/20 border border-orange-900/50 px-2 py-1 rounded-full flex items-center gap-1">
            📍 {post.district}
          </span>
        )}
      </div>

      <div ref={inViewRef} onDoubleClick={handleLike} className={`relative bg-zinc-950 ${mediaHeight} overflow-hidden cursor-pointer`}>
        {post.mediaType === 'video' ? (
          <>
          <video ref={videoRef} src={post.videoUrl} className="w-full h-full object-cover" loop muted={isMuted} playsInline preload="auto" />
            <button onClick={() => setIsMuted(m => !m)} className="absolute bottom-3 right-3 bg-black/50 rounded-full p-2 text-white text-xs">
              {isMuted ? '🔇' : '🔊'}
            </button>
          </>
        ) : (
          <>
            <img src={post.images?.[currentImageIdx]?.url} alt={post.title} className="w-full h-full object-cover" />
            {post.images?.length > 1 && (
              <>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {post.images.map((_, i) => (
                    <button key={i} onClick={() => setCurrentImageIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIdx ? 'bg-white w-3' : 'bg-white/50'}`} />
                  ))}
                </div>
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

        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full capitalize border border-zinc-700/50">
          {post.propertyType}
        </div>

        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-zinc-700/50">
          👁 {post.viewsCount?.toLocaleString()}
        </div>
      </div>

      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          
          <div className="flex items-center gap-5">
            <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm transition-transform active:scale-95 ${post.isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`}>
              <span className="text-2xl">{post.isLiked ? '❤️' : '🤍'}</span>
              <span className="font-bold">{post.likesCount}</span>
            </button>

            <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
              <span className="text-2xl">💬</span>
              <span className="font-bold">{post.commentsCount}</span>
            </button>

            <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-blue-400 transition-transform active:scale-95" title="Share Post">
              <span className="text-2xl">📤</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* THESE WILL NOW ALWAYS SHOW */}
            <button onClick={handleCall} className="text-2xl text-zinc-400 hover:text-green-500 transition-transform active:scale-95" title="Call Seller">
              📞
            </button>
            
            <Link to={`/messages/${post.author._id}`} className="text-2xl text-zinc-400 hover:text-blue-500 transition-transform active:scale-95" title="Message Seller">
              ✉️
            </Link>
            
            <button onClick={handleSave} className={`text-2xl transition-transform active:scale-95 ${post.isSaved ? 'text-yellow-400' : 'text-zinc-400 hover:text-white'}`} title="Save Property">
              {post.isSaved ? '🔖' : '🏷️'}
            </button>
          </div>
        </div>

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

          {/* 📱 VISUAL PHONE NUMBER BADGE */}
          {post.phone && (
            <div className="mt-3 inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg shadow-sm">
              <span className="text-sm">📞</span>
              <div>
                <p className="text-[9px] text-zinc-500 uppercase font-bold leading-none mb-1">Contact Property</p>
                <p className="text-xs font-black text-green-400 leading-none">{post.phone}</p>
              </div>
            </div>
          )}

          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.slice(0, 4).map(tag => (
                <Link key={tag} to={`/search?hashtag=${tag}`} className="text-xs text-orange-400 bg-orange-900/10 px-2 py-0.5 rounded hover:bg-orange-900/30 transition-colors">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {(post.location?.lat && post.location?.lng) && (
            <div className="mt-4 pt-3 border-t border-zinc-900">
              <div className="flex gap-2">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${post.location.lat},${post.location.lng}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 text-center inline-flex items-center justify-center gap-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  🗺️ View on Map
                </a>

                <button
                  onClick={() => setShowNearbySearch(!showNearbySearch)}
                  className={`flex-1 text-center inline-flex items-center justify-center gap-1 text-[11px] font-bold border px-3 py-2 rounded-lg transition-colors ${showNearbySearch ? 'bg-orange-500 text-white border-orange-500' : 'bg-zinc-800 hover:bg-zinc-700 text-orange-400 border-zinc-700'}`}
                >
                  🔍 Near Me
                </button>
              </div>

              {showNearbySearch && (
                <div className="animate-fade-in flex gap-2 mt-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800 shadow-inner">
                  <input
                    type="text"
                    placeholder="e.g. Schools, Hospitals..."
                    value={nearbyQuery}
                    onChange={(e) => setNearbyQuery(e.target.value)}
                    className="flex-1 bg-black border border-zinc-700 rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') executeNearbySearch();
                    }}
                  />
                  <button
                    onClick={executeNearbySearch}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-all active:scale-95"
                  >
                    Go
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