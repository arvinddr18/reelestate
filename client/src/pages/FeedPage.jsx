/**
 * pages/FeedPage.jsx
 * Main Instagram-style feed with infinite scroll and filters.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import PostCard from '../components/feed/PostCard';
import FilterBar from '../components/feed/FilterBar';
import CategoryBar from '../components/CategoryBar';

export default function FeedPage() {
  const [isPaused, setIsPaused] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [showReels, setShowReels] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (showStories && !isPaused) { // Only run if NOT paused
      interval = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            setShowStories(false);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [showStories, isPaused]); // Added isPaused here
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const observerRef = useRef(null);
  const sentinelRef = useRef(null); // Invisible element at bottom triggers next load

  // Fetch posts from API
  const fetchPosts = useCallback(async (pageNum, currentFilters, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 10, ...currentFilters };
      const { data } = await api.get('/posts/feed', { params });

      if (reset) {
        setPosts(data.data);
      } else {
        setPosts(prev => [...prev, ...data.data]);
      }

      setHasMore(pageNum < data.pagination.totalPages);
    } catch {
      toast.error('Failed to load feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts(1, filters, true);
    setPage(1);
  }, [filters]);

  // Infinite scroll — observe sentinel element
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          setPage(prev => {
            const next = prev + 1;
            fetchPosts(next, filters);
            return next;
          });
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, filters]);

  const handleCategorySelect = (categoryName) => {
    if (categoryName === 'All') {
      setFilters({}); 
    } else {
      // We clear subCategory when a new main category is picked
      setFilters({ propertyType: categoryName });
    }
  };

  const handleSubSelect = (subName) => {
    setFilters(prev => ({
      ...prev,
      // If user clicks the same sub-cat again, it removes the filter (toggle)
      subCategory: prev.subCategory === subName ? undefined : subName
    }));
  };

  const handleRefresh = async () => {
    await fetchPosts(1, filters, true);
    setPage(1);
    toast.success('Feed updated! ✨');
  };

  return (
    /* Main container: Force height to 100% of the viewport and hide outside scroll */
    <div className="h-screen flex flex-col bg-brand-950 overflow-hidden">
      
      {/* 1. Category Bar: Sticky at the top, forced horizontal scroll */}
      <div className="flex-none z-50 bg-brand-950/80 backdrop-blur-md border-b border-white/5">
        <CategoryBar 
          activeCategory={filters.propertyType || 'All'} 
          onFilterChange={handleCategorySelect}
          activeSub={filters.subCategory}
          onSubSelect={handleSubSelect}
          onReelClick={() => setShowStories(true)} // Change 'onReelClick' to match your prop
        />
      </div>

      {/* 2. Floating Refresh Button (Improved Positioning) */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={handleRefresh}
          className="price-badge-glow text-white px-5 py-2 rounded-full text-[11px] font-black animate-bounce flex items-center gap-2 border border-white/10"
        >
          ✨ NEW POSTS
        </button>
      </div>

      {/* 3. The Feed: Scrollable area that fits the remaining screen */}
      <div className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory">
        
        {/* Skeleton Loading (Midnight Theme) */}
        {loading && posts.length === 0 && (
          <div className="flex gap-5 px-6 py-6 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center min-w-[75px]">
                <div className="w-16 h-16 rounded-full animate-shimmer" />
                <div className="w-12 h-2 mt-3 rounded animate-shimmer" />
              </div>
            ))}
          </div>
        )}

        {/* Post List */}
        <div className="max-w-[500px] mx-auto pb-24">
          {posts.length === 0 && !loading ? (
            <div className="text-center py-32 text-brand-100">
              <p className="text-5xl mb-6">🏘️</p>
              <p className="text-xl font-bold text-white">No properties found</p>
              <p className="text-sm mt-2 opacity-60">Try adjusting your filters</p>
            </div>
          ) : (
            posts.map(post => (
              /* Each card is a snap item to make it feel like a Reel */
              <div key={post._id} className="snap-start snap-always min-h-[80vh] flex flex-col justify-center">
                <PostCard post={post} />
              </div>
            ))
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-10" />

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-brand-100/40 text-[10px] font-bold uppercase tracking-widest py-12">
              You've seen everything 🎉
            </p>
         )}
        </div>
      </div>

      {/* ── 📽️ FULL SCREEN STORY OVERLAY ── */}
      {showStories && (
        <div 
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in zoom-in duration-300 cursor-pointer"
      >
          
          {/* Top Progress Bars & Close Button */}
          <div className="p-4 flex flex-col gap-4 bg-gradient-to-b from-black/80 to-transparent">
            
            {/* ── DYNAMIC PROGRESS BAR ── */}
            <div className="flex gap-1.5 h-1 w-full px-2">
              <div className="flex-1 bg-white/20 rounded-full h-full overflow-hidden">
                <div 
                  className="h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-75 ease-linear" 
                  style={{ width: `${storyProgress}%` }} 
                />
              </div>
              <div className="flex-1 bg-white/20 rounded-full h-full" />
              <div className="flex-1 bg-white/20 rounded-full h-full" />
            </div>
            
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-brand-500 bg-brand-900 shadow-lg" />
                <span className="font-bold text-white text-sm tracking-tight">Daily Activities</span>
              </div>
              <button 
                onClick={() => setShowStories(false)} 
                className="text-white text-3xl p-2 hover:scale-110 active:scale-90 transition-transform"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Vertical Story Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
             <div className="w-24 h-24 rounded-full border-2 border-brand-500/30 flex items-center justify-center animate-pulse">
                <span className="text-4xl">⚡</span>
             </div>
             <p className="mt-6 text-brand-100/60 font-black tracking-[0.3em] uppercase text-[10px]">
               Viewing Activity...
             </p>
          </div>

          {/* Bottom Interaction Area */}
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-4 max-w-md mx-auto">
              <input 
                type="text" 
                placeholder="Send a message..." 
                className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 text-sm text-white outline-none focus:border-brand-500 transition-colors"
              />
              <button className="text-2xl active:scale-90 transition-transform">❤️</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}