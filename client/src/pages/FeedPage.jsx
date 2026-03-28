// At the top of FeedPage.jsx
import importedLogo from '../assets/nodexa-logo.png';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineDoubleArrow, MdShield } from 'react-icons/md'; // 👈 Fixed Shield Import
import { IoMdSearch, IoMdAdd } from 'react-icons/io'; // 👈 Cleaned up duplicates
import PostCard from '../components/feed/PostCard'; 
import ReelSwiper from '../components/reels/ReelSwiper';
import myLogo from '../assets/logo.png'; 
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── THE MASTER CATEGORY LIST ───
const FEED_CATEGORIES = [
  { id: 'All', name: 'For You', icon: '✨' },
  { id: 'Social', name: 'Social', icon: '📸' },
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

// ─── THE UNBEATABLE "NEURAL-LINK" MAGNETIC PULL TRIGGER ───
export function ScrollTrigger() {
  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState(null);
  const [currentPull, setCurrentPull] = useState(0); 
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDragStart = (e) => {
    setTouchStart(e.clientX || e.targetTouches?.[0]?.clientX);
  };

  const handleDragMove = (e) => {
    if (!touchStart) return;
    const currentX = e.clientX || e.targetTouches?.[0]?.clientX;
    const distance = touchStart - currentX;

    if (distance > 0) {
      setCurrentPull(distance);
    }
  };

  const handleDragEnd = () => {
    if (!touchStart) return;
    
    if (currentPull > 120) {
      navigate('/scroll');
    }
    
    setTouchStart(null);
    setCurrentPull(0);
  };

  const isDragging = currentPull > 0;
  const pullPercentage = Math.min((currentPull / 120) * 100, 100).toFixed(0);

  return (
    <>
      <style>
        {`
          @keyframes horizontalRocket {
            0% { transform: translate(20px, -50%); opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { transform: translate(-400px, -50%); opacity: 0; }
          }
          .animate-rocket-horizontal {
            animation: horizontalRocket 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        `}
      </style>

      <div 
        className={`fixed right-0 top-0 h-screen z-[100] flex items-center justify-end ${touchStart ? 'w-screen' : 'w-24'}`}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        
        {showHint && (
          <div className="absolute top-1/2 right-12 flex items-center pointer-events-none animate-rocket-horizontal">
             <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#0057FF] to-[#00F0FF]" />
             <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_20px_6px_#00F0FF]" />
          </div>
        )}

        <div 
          className="absolute right-0 flex items-center h-full pointer-events-none"
          style={{ 
            transform: `translateX(-${isDragging ? currentPull : 0}px)`,
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <div 
            className="absolute right-0 h-[150vh] bg-[#05070A] shadow-[-30px_0_50px_rgba(0,240,255,0.2)]"
            style={{ 
              width: `${isDragging ? currentPull + 50 : 0}px`, 
              opacity: isDragging ? 0.95 : 0 
            }}
          />

          <div 
            className="relative flex items-center opacity-0 transition-opacity duration-300"
            style={{ opacity: isDragging ? 1 : 0 }}
          >
            <div className="w-16 h-[1px] bg-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
            <div className="flex flex-col items-end mr-6 whitespace-nowrap">
              <span className="text-[#00F0FF] text-[8px] font-black tracking-[0.3em] uppercase animate-pulse">
                Decrypting Node
              </span>
              <span className={`text-3xl font-black italic tracking-tighter ${pullPercentage >= 100 ? 'text-white drop-shadow-[0_0_20px_#fff]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#0057FF] to-[#00F0FF]'}`}>
                {pullPercentage}%
              </span>
            </div>
          </div>

          <div 
            className={`absolute right-0 flex items-center bg-[#0B0F19]/90 backdrop-blur-md border-y border-l border-[#00F0FF]/40 rounded-l-full py-10 px-2 transition-all duration-300 ${showHint && !isDragging ? 'translate-x-0' : 'translate-x-[120%]'}`}
          >
            <div className="flex flex-col items-center text-[#00F0FF]">
               <MdOutlineDoubleArrow className="rotate-180 text-2xl mb-1" />
               <span className="text-[10px] font-black tracking-[0.4em] text-white uppercase drop-shadow-md ml-1" style={{ writingMode: 'vertical-rl' }}>
                 Scroll
               </span>
            </div>
          </div>
        </div>

        <div 
          className="fixed inset-0 bg-white z-[200] pointer-events-none"
          style={{
            opacity: pullPercentage >= 100 ? 1 : 0,
            transition: 'opacity 0.1s ease-in'
          }}
        />

      </div>
    </>
  );
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSub, setActiveSub] = useState('All');
  const [showReels, setShowReels] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, activeSub]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {};

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
    setActiveSub('All'); 
  };

  const filteredCategoriesForModal = FEED_CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white relative pb-24">

      <ScrollTrigger />
      
      {/* ─── PREMIUM GLASS HEADER ─── */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-[#1E2532] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        
        {/* ─── ULTRA PREMIUM TOP NAVBAR ─── */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md relative">
          
          {/* Left Side: Flawless Branding Lockup */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer z-10">
            
            {/* YOUR EXACT RAW ASSET LOGO */}
            <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">
               <img src={importedLogo} alt="Nodexa" className="w-full h-full object-contain" />
            </div>
            
            {/* Razor-Sharp Text */}
            <h1 className="text-2xl mt-1 font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all duration-300">
              NODEXA
            </h1>
          </Link>
            
           

          {/* Right Side: Search Icon */}
          <Link to="/search" className="w-10 h-10 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-gray-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/50 transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] z-10">
            <IoMdSearch size={20} />
          </Link>
          
          {/* Subtle bottom border glow line */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/20 to-transparent opacity-50" />
        </div>
        
        {/* ─── THE SHAPE-SHIFTING CATEGORY BAR ─── */}
        <div className="px-4 pb-4 pt-1">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x">
            
            {/* ── BROWSE ALL BUTTON ── */}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="snap-start flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#1E2532] text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:bg-[#00F0FF]/10 transition-all duration-300"
            >
              <span className="text-sm">🎛️</span> Browse All
            </button>

            {FEED_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`snap-start flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
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
        
        {/* ─── ⚡ NEXT-GEN STORY PORTALS (Only on 'For You') ─── */}
        {activeCategory === 'All' && (
          <div className="mb-8 overflow-x-auto no-scrollbar pb-4 pt-2 -mx-4 px-4">
            <div className="flex gap-3 items-center">
              
              {/* 1. THE "CREATE" PORTAL */}
              <button className="w-[84px] h-[120px] shrink-0 rounded-[28px] relative overflow-hidden group bg-gradient-to-b from-[#151A25] to-[#0B0F19] border border-[#1E2532] flex flex-col items-center justify-center hover:border-[#00F0FF]/50 transition-all active:scale-95 shadow-lg">
                {/* Glowing Plus Icon */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] flex items-center justify-center mb-3 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] group-hover:scale-110 transition-all duration-300">
                  <IoMdAdd size={24} className="text-white" />
                </div>
                <span className="text-[9px] font-black text-white uppercase tracking-widest z-10">Create</span>
                {/* Subtle background glow */}
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#0057FF]/20 blur-xl rounded-full" />
              </button>

              {/* 2. THE USER STORY PORTALS */}
              {[1, 2, 3, 4, 5, 6].map((story) => (
                <button 
                  key={story} 
                  onClick={() => setShowReels(true)} 
                  className="w-[84px] h-[120px] shrink-0 rounded-[28px] relative group p-[2px] bg-gradient-to-b from-[#0057FF] via-[#00F0FF] to-transparent hover:to-[#00F0FF] transition-all active:scale-95 shadow-[0_8px_20px_rgba(0,87,255,0.15)] hover:shadow-[0_8px_25px_rgba(0,240,255,0.3)]"
                >
                  {/* The Inner Glass Card */}
                  <div className="w-full h-full rounded-[26px] overflow-hidden relative bg-[#0B0F19]">
                    <img 
                      src={`https://picsum.photos/200/300?random=${story}`} 
                      alt="story preview" 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-90 transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center z-10 transform group-hover:-translate-y-1 transition-transform duration-300">
                      <div className="relative mb-1.5">
                        <img 
                          src={`https://i.pravatar.cc/150?img=${story * 10}`} 
                          alt="avatar" 
                          className="w-7 h-7 rounded-full border-[1.5px] border-[#00F0FF] object-cover" 
                        />
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00F0FF] rounded-full border-2 border-[#0B0F19] animate-pulse" />
                      </div>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest truncate w-[90%] text-center drop-shadow-md">
                        User {story}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              
            </div>
          </div>
        )}
        
        {loading ? (
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

      {/* ─── REEL SWIPER ─── */}
      {showReels && posts.length > 0 && (
        <ReelSwiper 
          posts={posts} 
          onClose={() => setShowReels(false)} 
        />
      )}

      {/* ─── CATEGORY GRID MODAL WITH SEARCH ─── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[100] bg-[#0B0F19]/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black italic tracking-tighter text-white">ALL HUBS</h2>
            <button onClick={() => setShowCategoryModal(false)} className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest border border-[#00F0FF]/30 px-3 py-1.5 rounded-full hover:bg-[#00F0FF]/10 transition-colors">
              Close
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-[#151A25] border border-[#1E2532] rounded-2xl p-4 flex items-center gap-3 mb-8 focus-within:border-[#00F0FF]/50 transition-colors shadow-inner">
            <IoMdSearch className="text-gray-500" size={24} />
            <input
              type="text"
              placeholder="Search categories..."
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
              className="bg-transparent text-sm text-white outline-none w-full font-bold placeholder-gray-600"
              autoFocus
            />
          </div>

          {/* Grid View */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto no-scrollbar pb-20">
            {filteredCategoriesForModal.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  handleCategoryClick(cat.id);
                  setShowCategoryModal(false);
                  setCategorySearchQuery(''); 
                }}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all active:scale-95 ${activeCategory === cat.id ? 'bg-[#00F0FF]/10 border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-[#151A25] border-[#1E2532] hover:border-[#00F0FF]/50 hover:bg-[#1E2532]'}`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest text-center">{cat.name}</span>
              </button>
            ))}
            
            {filteredCategoriesForModal.length === 0 && (
              <div className="col-span-full text-center text-gray-500 text-sm font-bold mt-10">
                No categories found matching "{categorySearchQuery}".
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}