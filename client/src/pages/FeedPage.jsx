import React, { useState, useEffect } from 'react';
import CategoryBar from '../components/CategoryBar';
import PostCard from '../components/feed/PostCard'; 
import ReelSwiper from '../components/reels/ReelSwiper';
import api from '../services/api';
import toast from 'react-hot-toast';

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
      // If category is NOT 'All', we filter. 
      // If it IS 'All', we send no params so the backend returns EVERYTHING.
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

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white relative">
      
      <CategoryBar 
        activeCategory={activeCategory}
        activeSub={activeSub}
        onFilterChange={(cat) => { setActiveCategory(cat); setActiveSub('All'); }}
        onSubSelect={(sub) => setActiveSub(sub)}
        onReelClick={() => setShowReels(true)} 
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          posts.length > 0 ? (
            posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onMediaClick={() => setShowReels(true)} 
              />
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">No posts found in this hub yet.</p>
              <button 
                onClick={() => setActiveCategory('All')}
                className="text-[#00F0FF] text-[10px] font-black underline"
              >
                Back to All Posts
              </button>
            </div>
          )
        )}
      </div>

      {showReels && posts.length > 0 && (
        <ReelSwiper 
          posts={posts} 
          onClose={() => setShowReels(false)} 
        />
      )}

    </div>
  );
}