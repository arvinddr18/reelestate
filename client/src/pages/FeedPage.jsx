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
    <div className="min-h-screen bg-black">
      {/* Filter bar */}
    <CategoryBar 
        activeCategory={filters.propertyType || 'All'} 
        onFilterChange={handleCategorySelect}
        activeSub={filters.subCategory}
        onSubSelect={handleSubSelect}
      />

      {/* Floating Refresh Button (Instagram Style) */}
      <div className="flex justify-center sticky top-24 z-40 h-0">
        <button 
          onClick={handleRefresh}
          className="bg-orange-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full shadow-lg text-[12px] font-bold animate-bounce flex items-center gap-2 border border-orange-400"
        >
          ✨ New Posts
        </button>
      </div>
      
     {/* --- Skeleton Loading for Circles (Shows while loading first page) --- */}
      {loading && posts.length === 0 && (
        <div className="flex gap-5 px-4 py-4 overflow-hidden bg-black no-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center min-w-[70px]">
              <div className="w-14 h-14 rounded-full animate-shimmer" />
              <div className="w-10 h-2 mt-2 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      )}

      {/* Feed */}
      <div className="py-4 px-2">
        {posts.length === 0 && !loading ? (
          <div className="text-center py-24 text-zinc-500">
            <p className="text-4xl mb-4">🏠</p>
            <p className="text-lg font-medium">No properties found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />

        {!hasMore && posts.length > 0 && (
          <p className="text-center text-zinc-600 text-sm py-8">You've seen all properties 🎉</p>
        )}
      </div>
    </div>
  );
}
