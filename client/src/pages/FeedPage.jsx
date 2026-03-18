import React, { useState, useEffect } from 'react';
import CategoryBar from '../components/CategoryBar'; // Jumps up one folder to find CategoryBar
import PostCard from '../components/feed/PostCard';     // Jumps up, goes into feed folder for PostCard
import ReelSwiper from '../components/reels/ReelSwiper'; // Jumps up, goes into reels folder
import api from '../services/api';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSub, setActiveSub] = useState('All');
  
  // 2. ADD THE STATE TO SHOW/HIDE REELS
  const [showReels, setShowReels] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, activeSub]);

 const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // ── SMART FILTER START ──
      const params = {};
      
      // If the user clicks 'Sale Hub' or 'Rents', we tell the backend.
      // If they click 'All', we send NOTHING so the backend gives us EVERY post (old and new).
      if (activeCategory !== 'All') {
        params.mainCategory = activeCategory;
      }
      
      if (activeSub !== 'All' && activeSub !== 'None') {
        params.subCategory = activeSub;
      }
      // ── SMART FILTER END ──

      const res = await api.get('/posts', { params });
      setPosts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white relative">
      
      {/* ── THE CATEGORY BAR ── */}
      <CategoryBar 
        activeCategory={activeCategory}
        activeSub={activeSub}
        onFilterChange={(cat) => { setActiveCategory(cat); setActiveSub('All'); }}
        onSubSelect={(sub) => setActiveSub(sub)}
        
        // 3. TRIGGER REELS WHEN STORY CIRCLE IS CLICKED
        onReelClick={() => setShowReels(true)} 
      />

      {/* ── THE POST FEED ── */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              // 4. OPTIONAL: OPEN REELS IF A USER CLICKS THE POST IMAGE
              onMediaClick={() => setShowReels(true)} 
            />
          ))
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20 opacity-40 font-bold uppercase tracking-widest text-xs">
            No posts found in this hub yet.
          </div>
        )}
      </div>

      {/* ── 5. THE FULL SCREEN REEL SWIPER MODAL ── */}
      {showReels && (
        <ReelSwiper 
          posts={posts} 
          onClose={() => setShowReels(false)} 
        />
      )}

    </div>
  );
}