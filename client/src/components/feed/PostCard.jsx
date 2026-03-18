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
import ShareSheet from './ShareSheet';

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
        playPromise.catch(() => {
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
      toast.success(wasSaved ? 'Removed from saved' : 'Property saved!');
    } catch {
      setPost(p => ({ ...p, isSaved: wasSaved }));
      toast.error('Failed to save.');
    }
  };

  const handleShare = () => {
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
      const mapUrl = `http://googleusercontent.com/maps.google.com/2{encodeURIComponent(strictQuery)}`;
      window.open(mapUrl, '_blank');
    } else {
      toast.error("Please enter a place to search (e.g., Hospital)");
    }
  };

  const mediaHeight = 'h-[500px] md:h-[560px]';

  return (
    // Deep Navy Background with subtle borders matching the new theme
    <article className="card max-w-[470px] mx-auto mb-6 border border-[#1E2532] bg-[#0B0F19] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      
      {/* ── HEADER (Author Info) ── */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/profile/${post.author._id}`} className="flex items-center gap-3 group">
          {post.author.profilePhoto ? (
            <img src={post.author.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00F0FF]/50 transition-all group-hover:ring-[#00F0FF]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0057FF] to-[#00F0FF] flex items-center justify-center font-bold text-sm text-white shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              {post.author.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-black text-white tracking-wide group-hover:text-[#00F0FF] transition-colors">
              @{post.author.username}
              {post.author.isVerified && <span className="ml-1 text-[#00F0FF] drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">✓</span>}
            </p>
            <p className="text-xs text-gray-400 capitalize font-medium">{post.author.role || 'Seller'}</p>
          </div>
        </Link>
        {post.district && (
          <span className="text-[10px] text-gray-300 font-bold tracking-wide uppercase bg-[#151A25] border border-[#1E2532] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
            📍 {post.district}
          </span>
        )}
      </div>

      {/* ── MEDIA CONTAINER ── */}
      <div ref={inViewRef} onDoubleClick={handleLike} className={`relative bg-[#0B0F19] ${mediaHeight} overflow-hidden cursor-pointer`}>
        {post.mediaType === 'video' ? (
          <>
          <video ref={videoRef} src={post.videoUrl} className="w-full h-full object-cover" loop muted={isMuted} playsInline preload="auto" />
            <button onClick={() => setIsMuted(m => !m)} className="absolute bottom-3 right-3 bg-[#0B0F19]/60 backdrop-blur-md rounded-full p-2 text-white text-xs border border-white/10 hover:bg-[#0B0F19]/80 transition-colors">
              {isMuted ? '🔇' : '🔊'}
            </button>
          </>
        ) : (
          <>
            <img src={post.images?.[currentImageIdx]?.url} alt={post.title} className="w-full h-full object-cover" />
            {post.images?.length > 1 && (
              <>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-[#0B0F19]/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                  {post.images.map((_, i) => (
                    <button key={i} onClick={() => setCurrentImageIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIdx ? 'bg-[#00F0FF] w-4 shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'bg-white/50 w-1.5 hover:bg-white'}`} />
                  ))}
                </div>
                {currentImageIdx > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(i => i - 1); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#0B0F19]/50 backdrop-blur-md rounded-full p-2 text-white border border-white/10 hover:bg-[#00F0FF]/20 transition-colors">‹</button>
                )}
                {currentImageIdx < post.images.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(i => i + 1); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#0B0F19]/50 backdrop-blur-md rounded-full p-2 text-white border border-white/10 hover:bg-[#00F0FF]/20 transition-colors">›</button>
                )}
              </>
            )}
          </>
        )}

        {/* Floating Glassmorphism Property Type Tag (Golden Gradient) */}
        <div className="absolute top-4 left-4 bg-gradient-to-r from-[#F5A623] to-[#F76B1C] text-white text-[10px] font-black tracking-wider px-3 py-1.5 rounded-full capitalize shadow-[0_4px_12px_rgba(245,166,35,0.4)]">
          {post.propertyType}
        </div>

        {/* Floating Glassmorphism Views Tag */}
        <div className="absolute top-4 right-4 bg-[#0B0F19]/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/10 shadow-sm flex items-center gap-1.5">
          <span className="opacity-80">👁</span> {post.viewsCount?.toLocaleString()}
        </div>

        {/* Big Animated Heart Overlay */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <span className="text-8xl animate-heart-pop drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">❤️</span>
          </div>
        )}
      </div>

      {/* ── CONTENT & ACTIONS ── */}
      <div className="p-4 pb-5">
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-5">
            <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm transition-transform active:scale-95 ${post.isLiked ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-gray-400 hover:text-white'}`}>
              <span className="text-2xl">{post.isLiked ? '❤️' : '🤍'}</span>
              <span className="font-bold">{post.likesCount}</span>
            </button>

            <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors active:scale-95">
              <span className="text-2xl drop-shadow-sm">💬</span>
              <span className="font-bold">{post.commentsCount}</span>
            </button>

            <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#00F0FF] transition-all active:scale-95" title="Share Post">
              <span className="text-2xl drop-shadow-sm">📤</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleCall} className="text-2xl text-gray-400 hover:text-green-400 transition-transform active:scale-95 drop-shadow-sm" title="Call Seller">
              📞
            </button>
            <Link to={`/messages/${post.author._id}`} className="text-2xl text-gray-400 hover:text-[#0057FF] transition-transform active:scale-95 drop-shadow-sm" title="Message Seller">
              ✉️
            </Link>
            <button onClick={handleSave} className={`text-2xl transition-transform active:scale-95 drop-shadow-sm ${post.isSaved ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`} title="Save Property">
              {post.isSaved ? '🔖' : '🏷️'}
            </button>
          </div>
        </div>

        {/* Post Details */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-white text-[15px] tracking-wide truncate max-w-[70%]">{post.title}</h3>
            {/* Glowing Golden Price */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] to-[#F76B1C] font-black text-lg drop-shadow-sm">
              {formatPrice(post.price)}
            </span>
          </div>

          {post.area && (
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              {post.area} <span className="text-[#00F0FF] px-1">•</span> {post.bedrooms ? `${post.bedrooms} BHK` : post.propertyType}
            </p>
          )}

          {post.description && (
            <p className="text-xs text-gray-300 line-clamp-2 mt-2 leading-relaxed">{post.description}</p>
          )}

          {/* 📱 VISUAL PHONE NUMBER BADGE (Glass Theme) */}
          {post.phone && (
            <div className="mt-3 inline-flex items-center gap-3 bg-[#151A25] border border-[#1E2532] px-4 py-2.5 rounded-xl shadow-sm hover:border-[#00F0FF]/40 transition-colors cursor-pointer" onClick={handleCall}>
              <span className="text-lg drop-shadow-sm">📞</span>
              <div>
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider leading-none mb-1.5">Contact Property</p>
                <p className="text-xs font-black text-[#00F0FF] leading-none drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">{post.phone}</p>
              </div>
            </div>
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

          {/* Location Buttons (Cyan/Navy theme) */}
          {(post.location?.lat && post.location?.lng) && (
            <div className="mt-4 pt-4 border-t border-[#1E2532]">
              <div className="flex gap-3">
                <a 
                  href={`http://googleusercontent.com/maps.google.com/3{post.location.lat},${post.location.lng}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 text-center inline-flex items-center justify-center gap-1.5 text-[11px] font-black tracking-wide uppercase bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white px-3 py-3 rounded-xl shadow-[0_4px_15px_rgba(0,240,255,0.3)] hover:opacity-90 transition-opacity"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="text-sm">🗺️</span> View on Map
                </a>

                <button
                  onClick={() => setShowNearbySearch(!showNearbySearch)}
                  className={`flex-1 text-center inline-flex items-center justify-center gap-1.5 text-[11px] font-black tracking-wide uppercase border px-3 py-3 rounded-xl transition-all ${showNearbySearch ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-[#151A25] hover:bg-[#1E2532] text-gray-400 border-[#1E2532] hover:text-white'}`}
                >
                  <span className="text-sm">🔍</span> Near Me
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