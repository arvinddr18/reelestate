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
  if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹ ${(price / 100000).toFixed(1)} L`;
  return `₹ ${price.toLocaleString('en-IN')}`;
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
      toast.success(wasSaved ? 'Removed from saved' : 'Property saved!');
    } catch {
      setPost(p => ({ ...p, isSaved: wasSaved }));
      toast.error('Failed to save.');
    }
  };

  const handleShare = () => setShowShare(true);

  const handleCall = () => {
    if (!requireAuth()) return;
    const phoneNumber = post.phone || post.author.phone;
    if (phoneNumber) window.location.href = `tel:${phoneNumber}`;
    else toast.error("No phone number provided.");
  };

  const executeNearbySearch = () => {
    if (nearbyQuery.trim()) {
      const strictQuery = `${nearbyQuery} near ${post.location.lat},${post.location.lng}`;
      const mapUrl = `http://googleusercontent.com/maps.google.com/5{encodeURIComponent(strictQuery)}`;
      window.open(mapUrl, '_blank');
    } else toast.error("Please enter a place to search.");
  };

  return (
    // Replaced pure black with #11151E to create card separation from the background
    <article className="max-w-[470px] mx-auto mb-6 bg-[#11151E] border border-[#1E2532] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      
      {/* ── HEADER (Author Info) ── */}
      <div className="flex items-center justify-between p-3.5">
        <Link to={`/profile/${post.author._id}`} className="flex items-center gap-3 group">
          {post.author.profilePhoto ? (
            <img src={post.author.profilePhoto} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-[#00F0FF]/30 group-hover:ring-[#00F0FF] transition-all" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0057FF] to-[#00F0FF] flex items-center justify-center font-bold text-sm text-white">
              {post.author.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-[13px] font-bold text-white tracking-wide group-hover:text-[#00F0FF] transition-colors">
              @{post.author.username}
              {post.author.isVerified && <span className="ml-1 text-[#00F0FF]">✓</span>}
            </p>
            <p className="text-[10px] text-gray-400 capitalize font-medium">{post.author.role || 'Seller'} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          </div>
        </Link>
        <button onClick={handleSave} className="p-2 text-xl active:scale-95 transition-transform">
          {post.isSaved ? <span className="text-yellow-400 drop-shadow-md">🔖</span> : <span className="text-gray-500 hover:text-white">🏷️</span>}
        </button>
      </div>

      {/* ── MEDIA WITH EXACT FLOATING BADGES ── */}
      <div ref={inViewRef} onDoubleClick={handleLike} className="relative w-full h-[320px] md:h-[400px] bg-black cursor-pointer">
        {post.mediaType === 'video' ? (
          <>
            <video ref={videoRef} src={post.videoUrl} className="w-full h-full object-cover" loop muted={isMuted} playsInline preload="auto" />
            <button onClick={(e) => { e.stopPropagation(); setIsMuted(m => !m); }} className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/10 opacity-0 hover:opacity-100 transition-opacity">
              <span className="bg-black/60 backdrop-blur-md rounded-full p-3 text-white border border-white/10">{isMuted ? '🔇 Unmute' : '🔊 Mute'}</span>
            </button>
          </>
        ) : (
          <>
            <img src={post.images?.[currentImageIdx]?.url} alt={post.title} className="w-full h-full object-cover" />
            {post.images?.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 bg-[#0B0F19]/60 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-white/10 z-10">
                {post.images.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIdx ? 'bg-white w-3' : 'bg-white/40 w-1.5'}`} />
                ))}
              </div>
            )}
          </>
        )}

        {/* 1. Top Left: Property Type (Golden Gradient) */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-[#F5A623] to-[#F76B1C] text-white text-[9px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase shadow-md">
          {post.propertyType || 'FOR SALE'}
        </div>

        {/* 2. Top Right: Views/Likes (Dark Glass) */}
        <div className="absolute top-3 right-3 bg-[#0B0F19]/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-sm">
          <span className="opacity-70 text-[10px]">🤍</span> {post.likesCount || '1.2k'}
        </div>

        {/* 3. Bottom Left: Location (Dark Glass) */}
        {post.district && (
          <div className="absolute bottom-3 left-3 bg-[#0B0F19]/80 backdrop-blur-md text-gray-200 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-sm">
            <span className="text-[#F5A623]">📍</span> {post.district}
          </div>
        )}

        {/* 4. Bottom Right: Price (Golden Gradient) */}
        <div className="absolute bottom-3 right-3 bg-gradient-to-r from-[#F5A623] to-[#F76B1C] text-white text-[13px] font-black tracking-wide px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(245,166,35,0.4)]">
          {formatPrice(post.price)}
        </div>

        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <span className="text-8xl animate-heart-pop drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">❤️</span>
          </div>
        )}
      </div>

      {/* ── CONTENT & ACTIONS ── */}
      <div className="p-4">
        
        {/* Title & Specs */}
        <div className="mb-3">
          <h3 className="font-bold text-white text-[15px] truncate mb-1">{post.title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-300 font-medium">{post.area || '1200 sqft'}</span>
            <span className="text-gray-600 text-[10px]">♦</span>
            <span className="text-[12px] text-gray-300 font-medium">{post.bedrooms ? `${post.bedrooms} BHK` : 'Property'}</span>
          </div>
        </div>

        {/* Hashtags/Features */}
        {post.hashtags?.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[14px]">🏢</span>
            {post.hashtags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] text-gray-400 font-medium">
                {tag} <span className="text-gray-600 ml-1">|</span>
              </span>
            ))}
          </div>
        )}

        {/* Stats Row (Matches "1.2k views  120 comments" from image) */}
        <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium mb-4">
          <span>{post.viewsCount?.toLocaleString() || 0} views</span>
          <button onClick={() => setShowComments(true)} className="hover:text-white transition-colors flex items-center gap-1">
            💬 {post.commentsCount}
          </button>
          <button onClick={handleLike} className={`${post.isLiked ? 'text-red-500' : 'hover:text-white'} transition-colors flex items-center gap-1`}>
            {post.isLiked ? '❤️' : '🤍'} {post.likesCount}
          </button>
          <button onClick={handleShare} className="hover:text-[#00F0FF] transition-colors ml-auto">
            📤 Share
          </button>
        </div>

        {/* ── EXACT 3-BUTTON ROW (Call, Chat, Map) ── */}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={handleCall} className="bg-[#151A25] border border-[#1E2532] hover:bg-[#1E2532] text-gray-300 hover:text-white rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm">
            <span className="text-[#00F0FF] text-[14px]">📞</span> Call
          </button>
          
          <Link to={`/messages/${post.author._id}`} className="bg-[#151A25] border border-[#1E2532] hover:bg-[#1E2532] text-gray-300 hover:text-white rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm">
            <span className="text-[#0057FF] text-[14px]">✉️</span> Chat
          </Link>
          
          <a href={`http://googleusercontent.com/maps.google.com/6${post.location?.lat},${post.location?.lng}`} target="_blank" rel="noreferrer" className="bg-[#151A25] border border-[#1E2532] hover:bg-[#1E2532] text-gray-300 hover:text-white rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm">
            <span className="text-[#F5A623] text-[14px]">🗺️</span> Map
          </a>
        </div>

        {/* Optional Sub-Action: Near Me Search Toggle */}
        <div className="mt-3 text-center">
          <button onClick={() => setShowNearbySearch(!showNearbySearch)} className="text-[10px] font-bold text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors">
            {showNearbySearch ? 'Close Search' : '🔍 Find Nearby Places'}
          </button>
          
          {showNearbySearch && (
            <div className="animate-fade-in flex gap-2 mt-2 bg-[#151A25] p-2 rounded-xl border border-[#1E2532] shadow-inner">
              <input
                type="text"
                placeholder="Hospitals, Schools..."
                value={nearbyQuery}
                onChange={(e) => setNearbyQuery(e.target.value)}
                className="flex-1 bg-[#0B0F19] border border-[#1E2532] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#00F0FF]/50 transition-colors"
                onKeyDown={(e) => { if (e.key === 'Enter') executeNearbySearch(); }}
              />
              <button
                onClick={executeNearbySearch}
                className="bg-[#1E2532] text-white hover:text-[#00F0FF] text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95 border border-[#2A3441]"
              >
                Go
              </button>
            </div>
          )}
        </div>

      </div>
      
      {showComments && (
        <CommentSheet postId={post._id} onClose={() => setShowComments(false)} onCommentAdded={() => setPost(p => ({ ...p, commentsCount: p.commentsCount + 1 }))} />
      )}
      {showShare && (
        <ShareSheet post={post} onClose={() => setShowShare(false)} />
      )}
    </article>
  );
}