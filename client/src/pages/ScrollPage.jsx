import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdHeart, IoMdText, IoMdBookmark, IoMdShareAlt, IoMdArrowBack } from 'react-icons/io';
import api from '../services/api';

export default function ScrollPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts');
        const data = res.data?.data || res.data || [];
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Simple, standard scroll tracking
  const handleScroll = (e) => {
    const container = e.target;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  // Standard image/video URL resolver
  const resolveMediaUrl = (source) => {
    if (!source) return '';
    if (typeof source === 'object' && source.url) return source.url;
    if (typeof source !== 'string') return '';
    if (source.startsWith('http') || source.startsWith('data:')) return source;
    const base = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';
    return `${base}${source.startsWith('/') ? '' : '/'}${source}`;
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#05070A] flex items-center justify-center text-white">
        Loading Streams...
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-screen w-full bg-[#05070A] flex flex-col items-center justify-center text-white">
        <h2 className="text-xl font-bold mb-4">No posts found</h2>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-800 rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black relative flex justify-center">
      
      {/* Top Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-4 z-50 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors"
      >
        <IoMdArrowBack size={24} />
      </button>

      {/* Main Scroll Container */}
      <div 
        onScroll={handleScroll}
        className="w-full max-w-md h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10"
      >
        {posts.map((post, index) => {
          if (!post) return null;

          const mediaUrl = resolveMediaUrl(post.images?.[0]?.url || post.image);
          const isVideo = post.mediaType === 'video' || mediaUrl.match(/\.(mp4|webm|ogg)$/i);
          const isActive = index === activeIndex;

          return (
            <div key={post._id || index} className="w-full h-screen snap-start snap-always relative bg-[#05070A]">
              
              {/* Media Content */}
              {isVideo && mediaUrl ? (
                <video 
                  src={mediaUrl} 
                  className="w-full h-full object-cover" 
                  loop 
                  muted={!isActive} // Only un-mute if it is the active video
                  autoPlay={isActive} // Play automatically if active
                  playsInline 
                />
              ) : mediaUrl ? (
                <img src={mediaUrl} alt="Post" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">No Media</div>
              )}

              {/* Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none" />

              {/* Bottom Left Info (User & Property Details) */}
              <div className="absolute bottom-6 left-4 right-16 z-20">
                
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3 cursor-pointer">
                  <img 
                    src={resolveMediaUrl(post.author?.profilePhoto) || `https://ui-avatars.com/api/?name=${post.author?.username || 'U'}&background=333&color=fff`} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                  />
                  <div>
                    <p className="text-white font-bold text-sm">@{post.author?.username || 'user'}</p>
                    <p className="text-gray-300 text-xs">{post.author?.role || 'Seller'}</p>
                  </div>
                </div>

                {/* Property Details */}
                <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-2">
                  {post.title || 'Untitled Property'}
                </h3>
                
                <p className="text-[#00F0FF] font-black text-xl mb-2">
                  {post.price ? `₹${Number(post.price).toLocaleString('en-IN')}` : 'Contact for Price'}
                </p>

                {post.description && (
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {post.description}
                  </p>
                )}
              </div>

              {/* Right Side Icons */}
              <div className="absolute bottom-8 right-4 z-20 flex flex-col gap-6 items-center">
                
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:text-red-500 transition-colors">
                    <IoMdHeart size={24} />
                  </div>
                  <span className="text-white text-xs font-bold">{post.likesCount || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:text-blue-400 transition-colors">
                    <IoMdText size={24} />
                  </div>
                  <span className="text-white text-xs font-bold">{post.comments?.length || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:text-yellow-400 transition-colors">
                    <IoMdBookmark size={24} />
                  </div>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:text-green-400 transition-colors">
                    <IoMdShareAlt size={24} />
                  </div>
                </button>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}