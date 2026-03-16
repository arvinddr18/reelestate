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
  const [showReels, setShowReels] = useState(false);
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
          onReelClick={() => toast.success("Opening Reels Mode... 🎬")} 
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
    </div>
  );
}