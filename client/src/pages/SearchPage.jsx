/**
 * pages/SearchPage.jsx
 * Premium Super App Search Engine with Users, Posts, Hashtags, and Advanced Filters.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { IoMdSearch, IoMdArrowBack, IoMdOptions, IoMdClose, IoMdPerson, IoMdImages } from 'react-icons/io';
import api from '../services/api';
import toast from 'react-hot-toast';

const formatPrice = (p) => {
  if (!p) return '';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)}Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
  return `₹${p.toLocaleString('en-IN')}`;
};

// ─── THE MASTER CATEGORY LIST ───
const SEARCH_CATEGORIES = [
  { id: 'All', name: 'All Hubs', icon: '🌍' },
  { id: 'Sale Hub', name: 'Sale Hub', icon: '🏠' },
  { id: 'Rents', name: 'Rents', icon: '🔑' },
  { id: 'PGs & Co-Living', name: 'PGs & Hostels', icon: '🛏️' },
  { id: 'Home Services', name: 'Services', icon: '🛠️' },
  { id: 'Jobs & Gigs', name: 'Jobs', icon: '💼' },
  { id: 'Education', name: 'Education', icon: '🎓' },
  { id: 'Marketplace', name: 'Market', icon: '🛍️' },
  { id: 'Auto & Motors', name: 'Motors', icon: '🚗' },
  { id: 'Food & Cafes', name: 'Food', icon: '🍔' },
  { id: 'Local Events', name: 'Events', icon: '🎟️' },
  { id: 'Cinema', name: 'Cinema', icon: '🍿' },
  { id: 'Travel & Trips', name: 'Travel', icon: '✈️' },
  { id: 'Gym & Fitness', name: 'Fitness', icon: '💪' },
  { id: 'Sports', name: 'Sports', icon: '⚽' },
  { id: 'Fashion', name: 'Fashion', icon: '👗' },
  { id: 'Beauty & Care', name: 'Beauty', icon: '💅' },
  { id: 'Tech & Gadgets', name: 'Tech', icon: '💻' },
  { id: 'Pets', name: 'Pets', icon: '🐾' },
  { id: 'Kids', name: 'Kids', icon: '🧸' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Core Search State
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [hashtag, setHashtag] = useState(searchParams.get('hashtag') || '');
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'users'
  
  // Advanced Filter State
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('');

  // Results State
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // The Master Search Function
  const search = useCallback(async (q, tag, category, minP, maxP, cond, tab) => {
    if (!q && !tag && category === 'All' && !minP && !maxP && !cond) { 
      setPosts([]); setUsers([]); return; 
    }
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const postParams = { q, hashtag: tag };
      if (category !== 'All') postParams.mainCategory = category;
      if (minP) postParams.minPrice = minP;
      if (maxP) postParams.maxPrice = maxP;
      if (cond) postParams.condition = cond;

      const [postsRes, usersRes] = await Promise.all([
        api.get('/posts/search', { params: postParams }),
        tab === 'users' ? api.get('/users/search', { params: { q } }) : Promise.resolve({ data: { data: [] } }),
      ]);
      
      setPosts(postsRes.data.data || postsRes.data);
      setUsers(usersRes.data.data || usersRes.data);
      setShowFilters(false);
    } catch {
      toast.error('Search failed to load.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync with URL params on load
  useEffect(() => {
    const tag = searchParams.get('hashtag') || '';
    const q = searchParams.get('q') || '';
    setHashtag(tag);
    setQuery(q);
    if (q || tag) search(q, tag, activeCategory, minPrice, maxPrice, condition, activeTab);
  }, [searchParams]);

  // Handle Form Submission
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query && !hashtag && activeCategory === 'All') return;
    
    setSearchParams(hashtag ? { hashtag } : { q: query });
    search(query, hashtag, activeCategory, minPrice, maxPrice, condition, activeTab);
  };

  const clearSearch = () => {
    setQuery(''); setHashtag(''); setActiveCategory('All');
    setMinPrice(''); setMaxPrice(''); setCondition('');
    setPosts([]); setUsers([]); setHasSearched(false);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white relative pb-24 font-sans">
      
      {/* ─── STICKY SEARCH HEADER ─── */}
      <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-[#1E2532] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-2xl mx-auto">
          
          {/* Top Row: Back, Search Input, Options */}
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 shrink-0 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#00F0FF]/50 transition-colors">
              <IoMdArrowBack size={20} />
            </button>
            
            <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
              <div className="absolute left-4 text-[#00F0FF]">
                <IoMdSearch size={22} />
              </div>
              <input 
                type="text" 
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHashtag(''); }}
                placeholder="Search properties, jobs, users..." 
                className="w-full bg-[#151A25] border border-[#1E2532] rounded-2xl py-3.5 pl-12 pr-10 text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50 transition-colors shadow-inner"
              />
              {query && (
                <button type="button" onClick={clearSearch} className="absolute right-4 text-gray-500 hover:text-white">
                  <IoMdClose size={18} />
                </button>
              )}
            </form>

            <button onClick={() => setShowFilters(!showFilters)} className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center transition-all ${showFilters || minPrice || condition ? 'bg-gradient-to-br from-[#0057FF] to-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'bg-[#151A25] border border-[#1E2532] text-gray-400 hover:text-white'}`}>
              <IoMdOptions size={20} />
            </button>
          </div>

          {/* Hashtag Active Pill */}
          {hashtag && (
            <div className="px-4 pb-2">
              <div className="inline-flex items-center gap-2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-full px-4 py-1.5">
                <span className="text-[#00F0FF] font-black text-xs">#{hashtag}</span>
                <button onClick={clearSearch} className="text-[#00F0FF] hover:text-white text-sm">✕</button>
              </div>
            </div>
          )}

          {/* TABS: Posts vs Users */}
          <div className="px-4 pb-3">
            <div className="flex gap-2 bg-[#151A25] border border-[#1E2532] rounded-xl p-1">
              {[
                { id: 'posts', label: 'Explore Posts', icon: <IoMdImages /> },
                { id: 'users', label: 'Find People', icon: <IoMdPerson /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if(query) search(query, hashtag, activeCategory, minPrice, maxPrice, condition, tab.id); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all
                    ${activeTab === tab.id ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Quick Select (Only show if Posts tab is active) */}
          {activeTab === 'posts' && (
            <div className="px-4 pb-4 pt-1 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x">
              {SEARCH_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setHasSearched(false); }}
                  className={`snap-start whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/50 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                      : 'bg-[#151A25] text-gray-500 border border-[#1E2532] hover:text-white'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* ─── ADVANCED FILTERS DROPDOWN ─── */}
          {showFilters && activeTab === 'posts' && (
            <div className="px-4 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300 border-t border-[#1E2532]">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[9px] font-black text-[#00F0FF] uppercase tracking-widest block mb-1.5 pl-2">Min Price (₹)</label>
                  <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" className="w-full bg-[#0B0F19] border border-[#1E2532] rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-[#00F0FF] uppercase tracking-widest block mb-1.5 pl-2">Max Price (₹)</label>
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any" className="w-full bg-[#0B0F19] border border-[#1E2532] rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[9px] font-black text-[#00F0FF] uppercase tracking-widest block mb-1.5 pl-2">Condition</label>
                <div className="flex gap-2">
                  {['New', 'Used'].map(cond => (
                    <button key={cond} type="button" onClick={() => setCondition(condition === cond ? '' : cond)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${condition === cond ? 'bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF]' : 'bg-[#0B0F19] border-[#1E2532] text-gray-400'}`}>
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={clearSearch} className="flex-1 bg-[#151A25] border border-[#1E2532] text-gray-400 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                  Clear Filters
                </button>
                <button onClick={handleSearch} className="flex-1 bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[0_5px_15px_rgba(0,240,255,0.3)] active:scale-95 transition-transform">
                  Apply & Search
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ─── MAIN RESULTS AREA ─── */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="aspect-[4/5] bg-[#151A25] border border-[#1E2532] rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Initial "Blank" State */}
        {!loading && !hasSearched && !query && !hashtag && (
          <div className="flex flex-col items-center justify-center text-center mt-20 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,240,255,0.1)] mb-6">
              🔍
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Find Anything.</h2>
            <p className="text-sm text-gray-400 font-bold max-w-xs leading-relaxed">
              Search the <span className="text-[#00F0FF]">Nodexa</span> network for jobs, homes, cars, gadgets, and people.
            </p>
          </div>
        )}

        {/* ─── POSTS RESULTS ─── */}
        {activeTab === 'posts' && !loading && hasSearched && (
          <div>
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center mt-20 animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mb-4">🛸</div>
                <h2 className="text-xl font-black text-white mb-2">No properties found</h2>
                <p className="text-xs text-gray-400 font-bold max-w-xs">Try adjusting your filters, category, or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-4 duration-500">
                {posts.map(post => (
                  <Link key={post._id} to={`/post/${post._id}`} className="bg-[#151A25] border border-[#1E2532] rounded-2xl overflow-hidden group hover:border-[#00F0FF]/50 transition-all shadow-lg flex flex-col h-full">
                    <div className="aspect-square bg-[#0B0F19] overflow-hidden relative">
                      {post.mediaType === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-black text-3xl">🎬</div>
                      ) : (
                        <img src={post.images?.[0]?.url} alt="" className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${post.mediaFilter || ''}`} />
                      )}
                      {post.mainCategory !== 'Social' && (
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black text-[#00F0FF] uppercase tracking-widest">
                          {post.mainCategory}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-grow justify-between">
                      <div>
                        <p className="text-xs font-black text-white truncate mb-1">{post.title || 'Update'}</p>
                        {post.price > 0 && <p className="text-xs text-[#00F0FF] font-black mb-1">{formatPrice(post.price)}</p>}
                        {post.district && <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{post.district}, {post.state}</p>}
                      </div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {post.hashtags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[8px] text-[#00F0FF] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── USERS RESULTS ─── */}
        {activeTab === 'users' && !loading && hasSearched && (
          <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center mt-20 animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mb-4">👤</div>
                <h2 className="text-xl font-black text-white mb-2">No users found</h2>
                <p className="text-xs text-gray-400 font-bold">Try searching a different username.</p>
              </div>
            ) : (
              users.map(u => (
                <Link key={u._id} to={`/profile/${u._id}`} className="flex items-center gap-4 bg-[#151A25] border border-[#1E2532] rounded-2xl p-4 hover:border-[#00F0FF]/50 transition-all group">
                  {u.profilePhoto ? (
                    <img src={u.profilePhoto} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#00F0FF] transition-all" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0057FF] to-[#00F0FF] flex items-center justify-center font-bold text-lg text-white">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-black text-white text-base group-hover:text-[#00F0FF] transition-colors">@{u.username}</p>
                    {u.fullName && <p className="text-xs text-gray-300 font-bold">{u.fullName}</p>}
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">{u.role || 'User'}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  );
}