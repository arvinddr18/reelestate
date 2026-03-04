/**
 * pages/PostDetailPage.jsx
 * Full-screen property detail view with all info, comments, and contact.
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatPrice = (p) => {
  if (p >= 10000000) return `₹${(p/10000000).toFixed(1)}Cr`;
  if (p >= 100000) return `₹${(p/100000).toFixed(1)}L`;
  return `₹${p.toLocaleString('en-IN')}`;
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
        setPost(postRes.data.data);
        setComments(commentsRes.data.data);
      } catch {
        toast.error('Post not found.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [postId]);

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
    toast.success(wasSaved ? 'Removed from saved' : 'Saved!');
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const { data } = await api.post(`/posts/${postId}/comments`, { text: commentText });
    setComments(prev => [data.data, ...prev]);
    setCommentText('');
    setPost(p => ({ ...p, commentsCount: p.commentsCount + 1 }));
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/posts/${postId}`);
    toast.success('Post deleted.');
    navigate('/');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!post) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 text-sm">
        ← Back
      </button>

      {/* Media */}
      <div className="rounded-2xl overflow-hidden bg-zinc-900 mb-4">
        {post.mediaType === 'video' ? (
          <video src={post.videoUrl} controls className="w-full max-h-96 object-contain bg-black" />
        ) : (
          <div className="relative">
            <img src={post.images?.[imgIdx]?.url} alt="" className="w-full max-h-96 object-cover" />
            {post.images?.length > 1 && (
              <div className="flex justify-center gap-1 absolute bottom-3 left-0 right-0">
                {post.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-2 h-2 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Author + Actions */}
      <div className="flex items-center justify-between mb-4">
        <Link to={`/profile/${post.author._id}`} className="flex items-center gap-2">
          {post.author.profilePhoto ? (
            <img src={post.author.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm">
              {post.author.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">@{post.author.username}</p>
            <p className="text-xs text-zinc-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button onClick={handleLike} className={`text-2xl ${post.isLiked ? 'text-red-500' : 'text-zinc-400'}`}>{post.isLiked ? '❤️' : '🤍'}</button>
          <button onClick={handleSave} className={`text-2xl ${post.isSaved ? 'text-yellow-400' : 'text-zinc-400'}`}>{post.isSaved ? '🔖' : '🏷️'}</button>
          {(user?._id === post.author._id || user?.role === 'admin') && (
            <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm">🗑️</button>
          )}
        </div>
      </div>

      {/* Property Details Card */}
      <div className="bg-zinc-900 rounded-2xl p-4 mb-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold">{post.title}</h1>
          <span className="text-orange-400 font-bold text-lg whitespace-nowrap">{formatPrice(post.price)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full capitalize">{post.propertyType}</span>
          {post.area && <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full">{post.area}</span>}
          {post.bedrooms && <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full">{post.bedrooms} BHK</span>}
          {post.bathrooms && <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full">{post.bathrooms} Bath</span>}
        </div>

        {/* Location */}
        <div className="text-sm text-zinc-400">
          📍 {[post.taluk, post.district, post.state, post.country].filter(Boolean).join(', ')}
        </div>

        {post.description && <p className="text-sm text-zinc-300 leading-relaxed">{post.description}</p>}

        {/* Stats */}
        <div className="flex gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-800">
          <span>❤️ {post.likesCount} likes</span>
          <span>💬 {post.commentsCount} comments</span>
          <span>👁 {post.viewsCount} views</span>
          <span>🔖 {post.savesCount} saves</span>
        </div>

        {/* Hashtags */}
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.map(tag => (
              <Link key={tag} to={`/search?hashtag=${tag}`} className="text-xs text-orange-400 hover:text-orange-300">#{tag}</Link>
            ))}
          </div>
        )}
      </div>

      {/* Contact Seller CTA */}
      {user && user._id !== post.author._id && (
        <Link
          to={`/messages/${post.author._id}`}
          className="btn-primary w-full py-3 text-center block mb-6 rounded-xl font-semibold"
        >
          💬 Contact Seller
        </Link>
      )}

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="font-semibold">Comments ({post.commentsCount})</h2>

        {user && (
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              placeholder="Add a comment..."
              className="flex-1 input-field text-sm"
            />
            <button onClick={handleComment} className="btn-primary px-4">Post</button>
          </div>
        )}

        {comments.map(c => (
          <div key={c._id} className="flex gap-3">
            <Link to={`/profile/${c.author._id}`}>
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {c.author.username?.[0]?.toUpperCase()}
              </div>
            </Link>
            <div>
              <span className="text-xs font-semibold mr-2">@{c.author.username}</span>
              <span className="text-sm text-zinc-300">{c.text}</span>
              <p className="text-xs text-zinc-600 mt-0.5">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
