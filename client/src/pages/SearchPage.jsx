/**
 * pages/SearchPage.jsx
 * Search properties by keyword or hashtag, and find users.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const formatPrice = (p) => {
  if (p >= 10000000) return `₹${(p/10000000).toFixed(1)}Cr`;
  if (p >= 100000) return `₹${(p/100000).toFixed(1)}L`;
  return `₹${p.toLocaleString('en-IN')}`;
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [hashtag, setHashtag] = useState(searchParams.get('hashtag') || '');
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'users'
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q, tag) => {
    if (!q && !tag) { setPosts([]); setUsers([]); return; }
    setLoading(true);
    try {
      const [postsRes, usersRes] = await Promise.all([
        api.get('/posts/search', { params: { q, hashtag: tag } }),
        activeTab === 'users' ? api.get('/users/search', { params: { q } }) : Promise.resolve({ data: { data: [] } }),
      ]);
      setPosts(postsRes.data.data);
      setUsers(usersRes.data.data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const tag = searchParams.get('hashtag') || '';
    const q = searchParams.get('q') || '';
    setHashtag(tag);
    setQuery(q);
    search(q, tag);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(hashtag ? { hashtag } : { q: query });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setHashtag(''); }}
          placeholder="Search properties, locations..."
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary px-5">Search</button>
      </form>

      {/* Hashtag hint */}
      {hashtag && (
        <div className="flex items-center gap-2 mb-4 bg-zinc-900 rounded-xl px-4 py-2">
          <span className="text-orange-400 font-medium">#{hashtag}</span>
          <button onClick={() => setSearchParams({})} className="text-zinc-500 hover:text-white text-sm">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-6">
        {['posts', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors
              ${activeTab === tab ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Posts Results */}
      {activeTab === 'posts' && !loading && (
        <div>
          {posts.length === 0 && (query || hashtag) ? (
            <div className="text-center py-16 text-zinc-500">
              <p className="text-3xl mb-2">🔍</p>
              <p>No properties found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {posts.map(post => (
                <Link key={post._id} to={`/post/${post._id}`} className="bg-zinc-900 rounded-xl overflow-hidden group hover:ring-1 hover:ring-orange-500 transition-all">
                  <div className="aspect-square bg-zinc-800 overflow-hidden">
                    {post.mediaType === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>
                    ) : (
                      <img src={post.images?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold truncate">{post.title}</p>
                    <p className="text-xs text-orange-400 font-bold">{formatPrice(post.price)}</p>
                    <p className="text-xs text-zinc-500 truncate">{post.district}, {post.state}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {post.hashtags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs text-orange-400/70">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Results */}
      {activeTab === 'users' && !loading && (
        <div className="space-y-3">
          {users.length === 0 && query ? (
            <div className="text-center py-16 text-zinc-500">
              <p className="text-3xl mb-2">👤</p>
              <p>No users found</p>
            </div>
          ) : (
            users.map(u => (
              <Link key={u._id} to={`/profile/${u._id}`} className="flex items-center gap-3 bg-zinc-900 rounded-xl p-3 hover:bg-zinc-800 transition-colors">
                {u.profilePhoto ? (
                  <img src={u.profilePhoto} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center font-bold">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">@{u.username}</p>
                  {u.fullName && <p className="text-xs text-zinc-400">{u.fullName}</p>}
                  <p className="text-xs text-zinc-500 capitalize">{u.role}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Initial state */}
      {!query && !hashtag && !loading && (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-4xl mb-3">🔍</p>
          <p>Search for properties or users</p>
          <p className="text-sm mt-2">Try keywords like "2bhk", "villa", city names</p>
        </div>
      )}
    </div>
  );
}
