import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoMdAdd, IoMdSearch } from 'react-icons/io';
import PostCard from '../components/feed/PostCard'; 
import ReelSwiper from '../components/reels/ReelSwiper';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── THE MASTER CATEGORY LIST ───
const FEED_CATEGORIES = [
  { id: 'All', name: 'For You', icon: '✨' },
  { id: 'Social', name: 'Social', icon: '📸' },
  { id: 'Jobs & Gigs', name: 'Jobs', icon: '💼' },
  { id: 'Sale Hub', name: 'Real Estate', icon: '🏢' },
  { id: 'Food & Cafes', name: 'Food', icon: '🍔' },
  { id: 'Marketplace', name: 'Market', icon: '🛍️' },
  { id: 'Auto & Motors', name: 'Motors', icon: '🚗' },
  { id: 'Tech & Gadgets', name: 'Tech', icon: '💻' },
  { id: 'Education', name: 'Education', icon: '🎓' },
  { id: 'Travel & Trips', name: 'Travel', icon: '✈️' },
  { id: 'Pets', name: 'Pets', icon: '🐾' },
  { id: 'Kids', name: 'Kids', icon: '🧸' },
];

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSub, setActiveSub] = useState('All');
  const [showReels, setShowReels] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, activeSub]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {};

      // ── SMART FILTER LOGIC ──
      if (activeCategory !== 'All') {
        params.mainCategory = activeCategory; 
      }
      
      if (activeSub !== 'All' && activeSub !== 'None') {
        params.subCategory = activeSub;
      }

      const res = await api.get('/posts', { params });
      setPosts(res.data.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Could not load posts.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    setActiveSub('All'); // Reset sub-category when main category changes
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white relative pb-24">
      
      {/* ─── PREMIUM GLASS HEADER ─── */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-[#1E2532] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        
        {/* Top Navbar */}
        <div className="px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter italic bg-gradient-to-r from-[#0057FF] to-[#00F0FF] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            NODEXA
          </h1>
          <div className="flex items-center gap-3">
            <Link to="/search" className="w-10 h-10 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-gray-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/50 transition-all">
              <IoMdSearch size={20} />
            </Link>
            <Link to="/create" className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105 transition-transform active:scale-95">
              <IoMdAdd size={24} />
            </Link>
          </div>
        </div>

        {/* ─── THE SHAPE-SHIFTING CATEGORY BAR ─── */}
        <div className="px-4 pb-4 pt-1">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x">
            {FEED_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`snap-start whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white shadow-[0_4px_15px_rgba(0,240,255,0.4)] border border-transparent scale-105'
                      : 'bg-[#151A25]/80 text-gray-400 border border-[#1E2532] hover:bg-[#1E2532] hover:text-white'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ─── MAIN FEED CONTENT ─── */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          // SKELETON LOADING STATE (Replaced basic spinner with premium skeletons)
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-full h-[400px] bg-[#151A25] border border-[#1E2532] rounded-[32px] animate-pulse overflow-hidden shadow-xl">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-[#1E2532]" />
                  <div className="space-y-2">
                    <div className="w-24 h-3 bg-[#1E2532] rounded-full" />
                    <div className="w-16 h-2 bg-[#1E2532] rounded-full" />
                  </div>
                </div>
                <div className="w-full h-[250px] bg-[#1E2532]/50" />
              </div>
            ))}
          </div>
        ) : (
          posts.length > 0 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {posts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onMediaClick={() => setShowReels(true)} 
                />
              ))}
            </div>
          ) : (
            // PREMIUM EMPTY STATE
            <div className="flex flex-col items-center justify-center text-center mt-20 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,240,255,0.1)] mb-6">
                {FEED_CATEGORIES.find(c => c.id === activeCategory)?.icon || '✨'}
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Nothing here yet!</h2>
              <p className="text-sm text-gray-400 font-bold max-w-xs mb-8">
                Be the first to post something amazing in the <span className="text-[#00F0FF]">{activeCategory}</span> category.
              </p>
              {activeCategory !== 'All' ? (
                <button 
                  onClick={() => handleCategoryClick('All')}
                  className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest hover:underline"
                >
                  Back to All Posts
                </button>
              ) : (
                <Link to="/create" className="bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[11px] shadow-[0_10px_30px_rgba(0,240,255,0.3)] hover:scale-105 active:scale-95 transition-all">
                  Create a Post
                </Link>
              )}
            </div>
          )
        )}
      </main>

      {/* ─── REEL SWIPER (Kept exactly as you had it) ─── */}
      {showReels && posts.length > 0 && (
        <ReelSwiper 
          posts={posts} 
          onClose={() => setShowReels(false)} 
        />
      )}

    </div>
  );
}