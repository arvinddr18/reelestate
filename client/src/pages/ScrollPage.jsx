import React, { useState } from 'react';

// Exact categories and emojis from your Home Page screenshots
const CATEGORIES = [
  { id: 'ALL', label: 'ALL', icon: '🌟' },
  { id: 'SOCIAL', label: 'SOCIAL', icon: '📸' },
  { id: 'SALE_HUB', label: 'SALE HUB', icon: '🏠' },
  { id: 'RENTS', label: 'RENTS', icon: '🔑' },
  { id: 'PGS_HOSTELS', label: 'PGS & HOSTELS', icon: '🛌' },
  { id: 'SERVICES', label: 'SERVICES', icon: '🛠️' },
  { id: 'JOBS', label: 'JOBS', icon: '💼' },
  { id: 'EDUCATION', label: 'EDUCATION', icon: '🎓' },
  { id: 'MARKET', label: 'MARKET', icon: '🛍️' },
  { id: 'MOTORS', label: 'MOTORS', icon: '🚗' },
  { id: 'FOOD', label: 'FOOD', icon: '🍔' },
  { id: 'PETS', label: 'PETS', icon: '🐾' },
  { id: 'EVENTS', label: 'EVENTS', icon: '🎟️' },
  { id: 'CINEMA', label: 'CINEMA', icon: '🍿' },
  { id: 'TRAVEL', label: 'TRAVEL', icon: '✈️' },
  { id: 'FITNESS', label: 'FITNESS', icon: '💪' },
  { id: 'SPORTS', label: 'SPORTS', icon: '⚽' },
  { id: 'FASHION', label: 'FASHION', icon: '👗' },
  { id: 'BEAUTY', label: 'BEAUTY', icon: '💅' },
  { id: 'TECH', label: 'TECH', icon: '💻' }
];

export default function ExploreScreen() {
  const [showReels, setShowReels] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // Set default to ALL

  const reelsData = [
    { id: 1, likes: '16.2K', img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=1000&fit=crop" },
    { id: 2, likes: '8.4K', img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=1000&fit=crop" },
    { id: 3, likes: '12.1K', img: "https://images.unsplash.com/photo-1600607687920-4e2a09c15e13?w=600&h=1000&fit=crop" },
  ];

  return (
    <div className="flex min-h-screen bg-[#05070A] font-sans text-white">
      
      {/* ========================================= */}
      {/* DESKTOP SIDEBAR (Hidden on Mobile)        */}
      {/* ========================================= */}
      <div className="hidden md:flex flex-col w-64 bg-[#080B12] border-r border-white/5 fixed h-full z-10 py-10 px-6 shadow-sm">
        <h1 className="text-2xl font-black mb-12 text-white tracking-tight">RealEstate.</h1>
        
        <nav className="flex flex-col gap-6">
          <button className="flex items-center gap-4 text-gray-500 hover:text-[#00F0FF] transition-colors font-semibold group">
            <svg className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-lg">Home</span>
          </button>
          
          <button className="flex items-center gap-4 text-[#00F0FF] font-bold group">
            <svg className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg>
            <span className="text-lg">Explore</span>
          </button>

          <button className="flex items-center gap-4 text-gray-500 hover:text-[#00F0FF] transition-colors font-semibold group mt-2">
            <div className="w-8 h-8 bg-[#00F0FF]/10 group-hover:bg-[#00F0FF]/20 text-[#00F0FF] rounded-full flex items-center justify-center transition-colors">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </div>
            <span className="text-lg">Create</span>
          </button>

          <button className="flex items-center gap-4 text-gray-500 hover:text-[#00F0FF] transition-colors font-semibold group mt-2">
            <svg className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            <span className="text-lg">Messages</span>
          </button>

          <button className="flex items-center gap-4 text-gray-500 hover:text-[#00F0FF] transition-colors font-semibold group">
            <svg className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span className="text-lg">Profile</span>
          </button>
        </nav>
      </div>

      {/* ========================================= */}
      {/* MAIN CONTENT AREA                         */}
      {/* ========================================= */}
      <div className="flex-1 w-full md:ml-64 flex justify-center bg-[#05070A] md:bg-[#05070A]">
         
         <div className="w-full max-w-[400px] md:max-w-[1000px] h-[100dvh] md:h-auto md:min-h-screen relative flex flex-col bg-[#05070A] md:bg-transparent shadow-2xl md:shadow-none md:py-10 md:px-8 overflow-hidden md:overflow-visible">
            
            <div className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-24 md:pb-0 transition-opacity duration-300 ${showReels ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'}`}>
                
                {/* Header */}
                <div className="px-5 md:px-0 pt-8 md:pt-0 pb-2">
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-white">
                    <span className="drop-shadow-[0_0_10px_rgba(255,100,0,0.8)]">🔥</span> Trending Today
                  </h1>
                  
                  {/* 👇 UPDATED: CATEGORY PILLS FROM YOUR SCREENSHOTS 👇 */}
                  <div className="flex gap-2 mt-4 md:mt-6 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1">
                    {CATEGORIES.map((cat) => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-5 py-2 md:py-2.5 md:px-6 rounded-full text-sm md:text-base font-semibold whitespace-nowrap transition-colors shadow-sm ${
                          selectedCategory === cat.id 
                          ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trending Horizontal Scroll */}
                <div className="flex gap-4 md:gap-6 px-5 md:px-0 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden py-4 md:py-6 items-center">
                  
                  <div className="min-w-[220px] h-[300px] md:min-w-[420px] md:h-[500px] rounded-[24px] md:rounded-[32px] relative overflow-hidden snap-center flex-shrink-0 shadow-[0_0_25px_rgba(0,240,255,0.2)] border border-[#00F0FF]/30 group">
                    <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=1000&fit=crop" alt="Trending 1" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#05070A]/90"></div>
                    
                    <div className="absolute top-4 md:top-6 left-4 md:left-6 flex flex-col items-start gap-1 md:gap-2">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] md:text-sm font-bold px-2 py-1 md:px-4 md:py-1.5 rounded-full shadow-lg">
                        🔥 +18% Trending
                      </span>
                      <span className="text-white text-5xl md:text-7xl font-black drop-shadow-lg mt-1 tracking-tighter">#1</span>
                    </div>

                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white text-sm md:text-lg font-medium flex items-center gap-1.5 md:gap-2">
                      <svg className="w-5 h-5 md:w-6 md:h-6 fill-current text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      2.5M Likes
                    </div>
                  </div>

                  <div className="min-w-[140px] h-[190px] md:min-w-[260px] md:h-[360px] rounded-[16px] md:rounded-[24px] relative overflow-hidden snap-center flex-shrink-0 shadow-[0_15px_30px_rgba(0,0,0,0.8)] border border-white/5 group">
                    <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=800&fit=crop" alt="Trending 2" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#05070A]/90"></div>
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-[#121826]/80 border border-white/10 backdrop-blur-md text-white text-sm md:text-2xl font-bold px-2 py-0.5 md:px-4 md:py-1 rounded-md md:rounded-xl">#2</div>
                    <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 text-white text-xs md:text-base font-medium flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 md:w-5 md:h-5 fill-current text-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      1.8M Likes
                    </div>
                  </div>

                  <div className="min-w-[140px] h-[190px] md:min-w-[260px] md:h-[360px] rounded-[16px] md:rounded-[24px] relative overflow-hidden snap-center flex-shrink-0 shadow-[0_15px_30px_rgba(0,0,0,0.8)] border border-white/5 group">
                    <img src="https://images.unsplash.com/photo-1600607687920-4e2a09c15e13?w=600&h=800&fit=crop" alt="Trending 3" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#05070A]/90"></div>
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-[#121826]/80 border border-white/10 backdrop-blur-md text-white text-sm md:text-2xl font-bold px-2 py-0.5 md:px-4 md:py-1 rounded-md md:rounded-xl">#3</div>
                    <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 text-white text-xs md:text-base font-medium flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 md:w-5 md:h-5 fill-current text-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      1.2M
                    </div>
                  </div>
                </div>

                {/* For You Section */}
                <div className="px-5 md:px-0 mt-2 md:mt-8 pb-6">
                  <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-4 md:mb-6 text-white">
                    <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">🎬</span> For You
                  </h2>
                  
                  {/* MOBILE VIEW */}
                  <div className="md:hidden relative w-full h-[240px] cursor-pointer group" onClick={() => setShowReels(true)}>
                    <div className="absolute top-3 right-0 w-[80%] h-[200px] rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10 transform translate-x-4 scale-90 rotate-2 opacity-80">
                      <img src={reelsData[1].img} alt="Next Reel" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40"></div>
                    </div>
                    <div className="absolute top-0 left-0 w-[85%] h-[240px] rounded-[24px] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.9)] z-10 border border-white/10">
                      <img src={reelsData[0].img} alt="Current Reel" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/90 via-black/20 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white pl-1 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                         </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="text-white">
                          <p className="font-bold text-sm">@luxury_estates</p>
                          <p className="text-[11px] opacity-80 mt-0.5">Modern hillside villa design...</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-red-500 text-sm drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">❤️</span>
                          </div>
                          <span className="text-white text-[10px] font-semibold drop-shadow">{reelsData[0].likes}</span>
                        </div>
                      </div>
                    </div>
                    <p className="absolute -bottom-8 w-full text-center text-xs text-gray-500 font-medium tracking-wide uppercase">Tap to watch reels</p>
                  </div>

                  {/* DESKTOP VIEW */}
                  <div className="hidden md:grid grid-cols-3 gap-6">
                    {reelsData.map((reel) => (
                      <div 
                        key={reel.id}
                        className="relative h-[450px] rounded-[24px] overflow-hidden group cursor-pointer shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_30px_rgba(0,240,255,0.15)] border border-white/5 transition-all duration-300"
                        onClick={() => setShowReels(true)}
                      >
                        <img src={reel.img} alt="Reel" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white pl-1 shadow-2xl">
                              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                           </div>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                          <div className="text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <p className="font-bold text-base">@luxury_estates</p>
                            <p className="text-sm opacity-80 mt-1">Property tour 🌊</p>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                              <span className="text-red-500 text-lg drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">❤️</span>
                            </div>
                            <span className="text-white text-xs font-bold">{reel.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
            </div>

            {/* ========================================= */}
            {/* MOBILE BOTTOM NAVIGATION (Hidden on MD)   */}
            {/* ========================================= */}
            {!showReels && (
              <div className="md:hidden absolute bottom-0 w-full h-20 bg-[#080B12]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-around items-center px-2 z-50 flex-shrink-0">
                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#00F0FF] transition-colors p-2">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                  <span className="text-[10px] font-semibold">Home</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-[#00F0FF] p-2">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg>
                  <span className="text-[10px] font-bold">Explore</span>
                </button>
                <div className="relative -top-6">
                  <button className="w-14 h-14 bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] rounded-full flex items-center justify-center text-black shadow-[0_5px_15px_rgba(0,240,255,0.4)] border-4 border-[#080B12] hover:scale-105 transition-transform">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  </button>
                </div>
                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#00F0FF] transition-colors p-2">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  <span className="text-[10px] font-semibold">Messages</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#00F0FF] transition-colors p-2">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  <span className="text-[10px] font-semibold">Profile</span>
                </button>
              </div>
            )}
         </div>
      </div>

      {/* ========================================= */}
      {/* REELS FULLSCREEN VIEWER (Overlay)         */}
      {/* ========================================= */}
      {showReels && (
        <div className="fixed inset-0 z-[100] bg-black/95 md:backdrop-blur-xl text-white flex flex-col md:flex-row justify-center items-center animate-in fade-in duration-300">
          
          <button 
            onClick={() => setShowReels(false)}
            className="absolute top-4 left-4 md:top-8 md:left-8 w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors z-50 cursor-pointer"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
          
          <div className="md:hidden absolute top-0 left-0 w-full p-4 pt-10 z-40 flex justify-center items-center bg-gradient-to-b from-[#05070A] to-transparent pointer-events-none">
            <span className="font-semibold text-sm tracking-widest drop-shadow-md text-[#00F0FF]">Reels</span>
          </div>

          <div className="w-full h-full md:w-[420px] md:h-[85vh] md:rounded-[32px] overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden relative shadow-[0_20px_60px_rgba(0,0,0,0.8)] md:border md:border-white/10 bg-[#05070A]">
            {reelsData.map((reel) => (
              <div key={reel.id} className="w-full h-full snap-start relative bg-[#05070A]">
                <img src={reel.img} alt="Reel" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/90 via-transparent to-black/20"></div>
                
                <div className="absolute right-4 bottom-24 md:bottom-20 flex flex-col gap-6 items-center">
                  <button className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <svg className="w-6 h-6 fill-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <span className="text-xs font-semibold">{reel.likes}</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                    </div>
                    <span className="text-xs font-semibold">124</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
                    </div>
                    <span className="text-xs font-semibold">Share</span>
                  </button>
                </div>

                <div className="absolute bottom-6 md:bottom-8 left-4 right-20">
                  <h3 className="font-bold text-lg mb-1 drop-shadow-md text-white">@modern_architecture</h3>
                  <p className="text-sm opacity-90 line-clamp-2 text-gray-200">Touring this amazing property today! Wait until you see the pool... 🌊🏡 #realestate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}