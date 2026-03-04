/**
 * pages/SavedPage.jsx
 * Shows bookmarked properties for the logged-in user.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const formatPrice = (p) => {
  if (p >= 10000000) return `₹${(p/10000000).toFixed(1)}Cr`;
  if (p >= 100000) return `₹${(p/100000).toFixed(1)}L`;
  return `₹${p.toLocaleString('en-IN')}`;
};

export default function SavedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/posts/saved');
        setPosts(data.data);
      } catch {
        toast.error('Failed to load saved properties.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Saved Properties</h1>

      {posts.length === 0 ? (
        <div className="text-center py-24 text-zinc-500">
          <p className="text-4xl mb-3">🔖</p>
          <p className="text-lg font-medium">No saved properties</p>
          <p className="text-sm mt-2">Tap the bookmark icon on posts to save them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {posts.map(post => (
            <Link key={post._id} to={`/post/${post._id}`} className="bg-zinc-900 rounded-xl overflow-hidden hover:ring-1 hover:ring-orange-500 transition-all group">
              <div className="aspect-square bg-zinc-800 overflow-hidden">
                {post.mediaType === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>
                ) : (
                  <img src={post.images?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold truncate">{post.title}</p>
                <p className="text-sm text-orange-400 font-bold mt-0.5">{formatPrice(post.price)}</p>
                <p className="text-xs text-zinc-500 mt-1">{post.district}, {post.state}</p>
                <p className="text-xs text-zinc-600 mt-1">by @{post.author?.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
