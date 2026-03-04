/**
 * pages/AdminPage.jsx
 * Admin panel for managing users and posts.
 */

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AdminPage() {
  const [tab, setTab] = useState('stats'); // 'stats' | 'users' | 'posts'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await api.get('/admin/stats');
    setStats(data.data);
  };

  const fetchUsers = async (search = '') => {
    setLoading(true);
    const { data } = await api.get('/admin/users', { params: { search } });
    setUsers(data.data);
    setLoading(false);
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/posts');
    setPosts(data.data);
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'users') fetchUsers(userSearch);
    if (tab === 'posts') fetchPosts();
  }, [tab]);

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Deactivate @${username}?`)) return;
    await api.delete(`/admin/users/${userId}`);
    toast.success(`@${username} deactivated.`);
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: false } : u));
  };

  const handleRemovePost = async (postId) => {
    if (!confirm('Remove this post?')) return;
    await api.delete(`/admin/posts/${postId}`);
    toast.success('Post removed.');
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, isActive: false } : p));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🛡️ Admin Panel
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-xl">
        {['stats', 'users', 'posts'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors
              ${tab === t ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            {t === 'stats' ? '📊 Stats' : t === 'users' ? '👥 Users' : '🏠 Posts'}
          </button>
        ))}
      </div>

      {/* ── Stats ── */}
      {tab === 'stats' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'text-blue-400' },
            { label: 'Total Posts', value: stats.totalPosts, icon: '🏠', color: 'text-green-400' },
            { label: 'Active Posts', value: stats.activePosts, icon: '✅', color: 'text-orange-400' },
            { label: 'Buyers', value: stats.buyers, icon: '🛒', color: 'text-purple-400' },
            { label: 'Sellers', value: stats.sellers, icon: '🏗️', color: 'text-yellow-400' },
            { label: 'Removed', value: stats.totalPosts - stats.activePosts, icon: '🗑️', color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-zinc-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchUsers(userSearch)}
              placeholder="Search users..."
              className="input-field flex-1"
            />
            <button onClick={() => fetchUsers(userSearch)} className="btn-primary px-4">Search</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u._id} className={`flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3 ${!u.isActive ? 'opacity-40' : ''}`}>
                  <div className="flex items-center gap-3">
                    {u.profilePhoto ? (
                      <img src={u.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">@{u.username}</p>
                      <p className="text-xs text-zinc-500">{u.email} · <span className="capitalize">{u.role}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!u.isActive && <span className="text-xs text-red-400 bg-red-900/30 px-2 py-0.5 rounded">Deactivated</span>}
                    {u.isActive && u.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(u._id, u.username)}
                        className="text-red-400 hover:text-red-300 text-sm bg-red-900/20 hover:bg-red-900/40 px-3 py-1 rounded-lg transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Posts ── */}
      {tab === 'posts' && (
        <div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-2">
              {posts.map(post => (
                <div key={post._id} className={`flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3 ${!post.isActive ? 'opacity-40' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                      {post.mediaType === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center text-xl">🎬</div>
                      ) : (
                        <img src={post.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]">{post.title}</p>
                      <p className="text-xs text-zinc-500">by @{post.author?.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!post.isActive && <span className="text-xs text-red-400">Removed</span>}
                    {post.isActive && (
                      <button
                        onClick={() => handleRemovePost(post._id)}
                        className="text-red-400 hover:text-red-300 text-sm bg-red-900/20 hover:bg-red-900/40 px-3 py-1 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
