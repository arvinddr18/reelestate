/**
 * components/feed/CommentSheet.jsx
 * Slide-up bottom sheet showing comments for a post.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CommentSheet({ postId, onClose, onCommentAdded }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/posts/${postId}/comments`);
        setComments(data.data);
      } catch {
        toast.error('Failed to load comments.');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (!user) { toast.error('Please login to comment.'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      setComments(prev => [data.data, ...prev]);
      setText('');
      onCommentAdded?.();
    } catch {
      toast.error('Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-2xl z-50 max-h-[75vh] flex flex-col md:max-w-[470px] md:mx-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-zinc-600 rounded-full" />
        </div>
        <h3 className="text-center text-sm font-semibold pb-3 border-b border-zinc-800">Comments</h3>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading ? (
            <div className="text-center text-zinc-500 text-sm py-8">Loading...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-zinc-500 text-sm py-8">No comments yet. Be the first!</div>
          ) : (
            comments.map(comment => (
              <div key={comment._id} className="flex gap-3">
                <Link to={`/profile/${comment.author._id}`}>
                  {comment.author.profilePhoto ? (
                    <img src={comment.author.profilePhoto} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {comment.author.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1">
                  <span className="text-xs font-semibold mr-2">@{comment.author.username}</span>
                  <span className="text-sm text-zinc-300">{comment.text}</span>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        {user && (
          <div className="p-4 border-t border-zinc-800 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Add a comment..."
              className="flex-1 bg-zinc-800 rounded-full px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className="text-orange-500 font-semibold text-sm disabled:opacity-40"
            >
              Post
            </button>
          </div>
        )}
      </div>
    </>
  );
}
