/**
 * pages/PostDetailPage.jsx
 * Full-screen Super App detail view with smart grids, sticky CTA, and comments.
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IoMdArrowBack, IoMdShareAlt, IoMdHeartEmpty, IoMdHeart, IoMdPin, IoMdTime, IoMdLink, IoMdTrash, IoMdBookmark } from 'react-icons/io';

const formatPrice = (p) => {
  if (!p) return '';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)}Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
  return `₹${p.toLocaleString('en-IN')}`;
};

// ─── HELPER: DYNAMIC DETAIL BADGE ───
const DetailBadge = ({ label, value, icon }) => {
  if (!value) return null;
  return (
    <div className="bg-[#151A25] border border-[#1E2532] p-3 rounded-2xl flex flex-col gap-1 shadow-sm hover:border-[#00F0FF]/30 transition-colors">
      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
        {icon} {label}
      </span>
      <span className="text-sm font-bold text-white truncate">{value}</span>
    </div>
  );
};

export default function PostDetailPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${postId}`),
          api.get(`/posts/${postId}/comments`),
        ]);
        setPost(postRes.data.data || postRes.data);
        setComments(commentsRes.data.data || commentsRes.data);
      } catch {
        toast.error('Post not found.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [postId, navigate]);

  const handleLike = async () => {
    if (!user) return toast.error('Please login.');
    const wasLiked = post.isLiked;
    setPost(p => ({ ...p, isLiked: !wasLiked, likesCount: wasLiked ? p.likesCount - 1 : p.likesCount + 1 }));
    await api.put(`/posts/${postId}/like`).catch(() => {
      setPost(p => ({ ...p, isLiked: wasLiked, likesCount: wasLiked ? p.likesCount + 1 : p.likesCount - 1 }));
    });
  };

  const handleSave = async () => {
    if (!user) return toast.error('Please login.');
    const wasSaved = post.isSaved;
    setPost(p => ({ ...p, isSaved: !wasSaved }));
    await api.put(`/posts/${postId}/save`);
    toast.success(wasSaved ? 'Removed from saved' : 'Saved to collection!');
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const { data } = await api.post(`/posts/${postId}/comments`, { text: commentText });
    setComments(prev => [data.data, ...prev]);
    setCommentText('');
    setPost(p => ({ ...p, commentsCount: p.commentsCount + 1 }));
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    await api.delete(`/posts/${postId}`);
    toast.success('Post deleted successfully.');
    navigate(-1);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0F19]">
      <div className="w-10 h-10 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!post) return null;

  const isSocial = post.postType === 'Social' || post.mainCategory === 'Social';
  const hasLinks = post.swiggyLink || post.zomatoLink || post.restaurantWebsite;

  // ─── DYNAMIC CTA BOTTOM BAR LOGIC ───
  const renderStickyFooter = () => {
    if (isSocial) return null; // Social doesn't need a buy button

    let btnText = "Contact Seller";
    let btnColor = "bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white shadow-[0_0_20px_rgba(0,240,255,0.3)]";
    let link = `tel:${post.phone || post.author?.phone}`;

    if (post.mainCategory === 'Food & Cafes') {
      if (hasLinks) {
        btnText = "Order Now";
        btnColor = "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]";
        link = post.swiggyLink || post.zomatoLink || post.restaurantWebsite;
      } else {
        btnText = "Call Restaurant";
      }
    } else if (post.mainCategory === 'Jobs & Gigs') {
      btnText = "Apply Now";
      btnColor = "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]";
    }

    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl border-t border-[#1E2532] p-4 pb-8 flex items-center gap-4 animate-in slide-in-from-bottom duration-500">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-4">
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{post.price > 0 ? 'Total Price' : 'Price'}</span>
            <span className="text-xl font-black text-[#00F0FF]">{post.price > 0 ? formatPrice(post.price) : 'Free / TBA'}</span>
          </div>
          <a href={link} target={hasLinks ? "_blank" : "_self"} rel="noreferrer" className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-transform active:scale-95 ${btnColor}`}>
            {btnText}
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pb-32 relative overflow-x-hidden font-sans">
      
      {/* ─── FLOATING TOP BAR (Back & Delete) ─── */}
      <div className="absolute top-6 left-4 right-4 z-50 flex justify-between items-center max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <IoMdArrowBack size={20} />
        </button>

        {(user?._id === post.author?._id || user?.role === 'admin') && (
          <button onClick={handleDelete} className="w-10 h-10 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors">
            <IoMdTrash size={18} />
          </button>
        )}
      </div>

      {/* ─── EDGE-TO-EDGE HERO MEDIA ─── */}
      <div className="relative w-full aspect-[4/5] sm:aspect-video bg-black max-w-2xl mx-auto">
        {post.mediaType === 'video' ? (
          <video src={post.videoUrl} controls autoPlay muted loop className={`w-full h-full object-cover ${post.mediaFilter || ''}`} />
        ) : (
          <>
            <img src={post.images?.[imgIdx]?.url} alt="" className={`w-full h-full object-cover transition-all duration-300 ${post.mediaFilter || ''}`} />
            {post.images?.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-10">
                {post.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`h-2 rounded-full transition-all ${i === imgIdx ? 'bg-[#00F0FF] w-6' : 'bg-white/50 w-2 hover:bg-white'}`} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Floating Category Badge */}
        {!isSocial && (
          <div className="absolute top-6 right-4 bg-[#0B0F19]/80 backdrop-blur-md text-[#00F0FF] text-[10px] font-black tracking-widest px-4 py-2 rounded-full uppercase border border-[#00F0FF]/30">
            {post.mainCategory}
          </div>
        )}
      </div>

      {/* ─── MAIN CONTENT BODY (Slides up over media) ─── */}
      <main className="relative -mt-6 bg-[#0B0F19] rounded-t-[32px] border-t border-[#1E2532] px-5 pt-8 pb-10 max-w-2xl mx-auto z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        
        {/* Title & Engagement Actions */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white">{post.title || (isSocial ? 'Social Update' : 'Listing')}</h1>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={handleLike} className={`w-12 h-12 rounded-full flex items-center justify-center bg-[#151A25] border transition-colors ${post.isLiked ? 'text-red-500 border-red-500/30' : 'text-white border-[#1E2532] hover:border-[#00F0FF]/50'}`}>
              {post.isLiked ? <IoMdHeart size={24} /> : <IoMdHeartEmpty size={24} />}
            </button>
            <button onClick={handleSave} className={`w-12 h-12 rounded-full flex items-center justify-center bg-[#151A25] border transition-colors ${post.isSaved ? 'text-yellow-400 border-yellow-400/30' : 'text-white border-[#1E2532] hover:border-[#00F0FF]/50'}`}>
               <IoMdBookmark size={22} />
            </button>
          </div>
        </div>

        {/* Meta Row: Location & Date */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-[#1E2532]">
          {(post.locationTag || post.district) && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <IoMdPin className="text-[#00F0FF]" size={16} /> {post.locationTag || post.district}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <IoMdTime className="text-gray-500" size={16} /> {formatDistanceToNow(new Date(post.createdAt))} ago
          </div>
        </div>

        {/* ─── THE SMART GRID: DYNAMIC SPECS ─── */}
        {!isSocial && (
          <div className="mb-8">
            <h3 className="text-[11px] font-black text-[#00F0FF] uppercase tracking-[0.2em] mb-4">Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Jobs */}
              <DetailBadge label="Job Role" value={post.jobRole} icon="👔" />
              <DetailBadge label="Salary" value={post.salary} icon="💵" />
              <DetailBadge label="Work Mode" value={post.workMode} icon="💻" />
              <DetailBadge label="Experience" value={post.experience} icon="⭐" />
              <DetailBadge label="Job Type" value={post.jobType} icon="📋" />
              
              {/* Real Estate */}
              <DetailBadge label="Property" value={post.propertyType !== 'other' ? post.propertyType : null} icon="🏠" />
              <DetailBadge label="Area" value={post.area} icon="📏" />
              <DetailBadge label="Bedrooms" value={post.bedrooms ? `${post.bedrooms} BHK` : null} icon="🛏️" />
              <DetailBadge label="Rooms" value={post.rooms} icon="🚪" />
              
              {/* Food & Cafes */}
              <DetailBadge label="Restaurant" value={post.restaurantName} icon="🍽️" />
              <DetailBadge label="Dish Name" value={post.dishName} icon="🥘" />
              <DetailBadge label="Cuisine" value={post.cuisine} icon="🍜" />
              <DetailBadge label="Dietary" value={post.dietary} icon="🌱" />
              <DetailBadge label="Offer" value={post.offer} icon="🔥" />
              
              {/* Marketplace / General */}
              <DetailBadge label="Brand" value={post.brand} icon="🏷️" />
              <DetailBadge label="Condition" value={post.condition} icon="✨" />
              <DetailBadge label="Category" value={post.marketplaceCategory || post.kidsCategory} icon="📦" />
              
              {/* Pets */}
              <DetailBadge label="Breed" value={post.breed} icon="🐕" />
              <DetailBadge label="Age" value={post.age || post.ageGroup} icon="⏳" />
              <DetailBadge label="Vaccinated" value={post.vaccinated} icon="💉" />

              {/* Travel */}
              <DetailBadge label="Destination" value={post.destination} icon="📍" />
              <DetailBadge label="Duration" value={post.duration} icon="⏱️" />
              <DetailBadge label="Package" value={post.packageType} icon="🎒" />
              
              {/* Education */}
              <DetailBadge label="Institute" value={post.institute} icon="🏫" />
              <DetailBadge label="Mode" value={post.educationMode} icon="📱" />
              <DetailBadge label="Eligibility" value={post.eligibility} icon="✅" />
            </div>
          </div>
        )}

        {/* Description */}
        {post.description && (
          <div className="mb-8">
            <h3 className="text-[11px] font-black text-[#00F0FF] uppercase tracking-[0.2em] mb-4">Description</h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{post.description}</p>
          </div>
        )}

        {/* External Links (If any) */}
        {hasLinks && (
          <div className="mb-10 p-5 rounded-3xl bg-gradient-to-br from-[#151A25] to-[#0B0F19] border border-[#1E2532]">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">External Links</h3>
            <div className="space-y-4">
              {post.swiggyLink && <a href={post.swiggyLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors"><IoMdLink size={20}/> Order on Swiggy</a>}
              {post.zomatoLink && <a href={post.zomatoLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-bold text-red-500 hover:text-red-400 transition-colors"><IoMdLink size={20}/> Order on Zomato</a>}
              {post.restaurantWebsite && <a href={post.restaurantWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-bold text-[#00F0FF] hover:text-white transition-colors"><IoMdLink size={20}/> Official Website</a>}
            </div>
          </div>
        )}

        {/* Post Stats */}
        <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 pt-4 border-t border-[#1E2532] mb-10">
          <span className="flex items-center gap-1.5"><IoMdHeart size={14} className="text-red-500"/> {post.likesCount} Likes</span>
          <span>💬 {post.commentsCount} Comments</span>
          <span>👁 {post.viewsCount} Views</span>
          <span>🔖 {post.savesCount} Saves</span>
        </div>

        {/* ─── AUTHOR CARD ─── */}
        <Link to={`/profile/${post.author?._id}`} className="block p-5 rounded-3xl bg-[#151A25] border border-[#1E2532] hover:border-[#00F0FF]/50 transition-colors mb-10 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {post.author?.profilePhoto ? (
                <img src={post.author.profilePhoto} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#00F0FF] transition-all" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0057FF] to-[#00F0FF] flex items-center justify-center font-bold text-lg text-white">
                  {post.author?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Posted By</p>
                <h3 className="text-base font-black text-white group-hover:text-[#00F0FF] transition-colors">@{post.author?.username}</h3>
              </div>
            </div>
            <span className="text-gray-500 group-hover:text-[#00F0FF] transition-colors">❯</span>
          </div>
        </Link>

        {/* ─── COMMENTS SECTION ─── */}
        <div className="space-y-6 pt-6 border-t border-[#1E2532]">
          <h2 className="text-lg font-black text-white">Comments ({post.commentsCount})</h2>

          {user ? (
            <div className="flex gap-3">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-[#151A25] border border-[#1E2532] rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-[#00F0FF]/50 transition-colors"
              />
              <button onClick={handleComment} className="bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                Post
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Log in to post a comment.</p>
          )}

          <div className="space-y-5 mt-8">
            {comments.map(c => (
              <div key={c._id} className="flex gap-4">
                <Link to={`/profile/${c.author?._id}`} className="shrink-0">
                  {c.author?.profilePhoto ? (
                    <img src={c.author.profilePhoto} className="w-10 h-10 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0057FF] to-[#00F0FF] flex items-center justify-center text-xs font-bold text-white">
                      {c.author?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="bg-[#151A25] border border-[#1E2532] rounded-2xl rounded-tl-none p-4 flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-black text-white">@{c.author?.username}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{formatDistanceToNow(new Date(c.createdAt))}</span>
                  </div>
                  <p className="text-sm text-gray-300">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Render the Sticky Order/Apply/Contact Footer */}
      {renderStickyFooter()}
    </div>
  );
}