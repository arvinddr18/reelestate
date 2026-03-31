import React, { useState } from 'react';

export default function ExploreScreen() {
  const [showReels, setShowReels] = useState(false);

  const reelsData = [
    { id: 1, likes: '16.2K', img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=1000&fit=crop" },
    { id: 2, likes: '8.4K', img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=1000&fit=crop" },
    { id: 3, likes: '12.1K', img: "https://images.unsplash.com/photo-1600607687920-4e2a09c15e13?w=600&h=1000&fit=crop" },
  ];

  return (
    <div className="flex items-center justify-center bg-gray-100 min-h-screen font-sans sm:py-6 sm:px-4">
      {/* Container: Dynamically scales on desktop (max-h-[90vh]) so it never gets cut off */}
      <div className="w-full max-w-[400px] bg-white h-[100dvh] sm:h-[760px] sm:max-h-[92vh] relative overflow-hidden flex flex-col shadow-2xl sm:rounded-[40px] border border-gray-200 sm:border-[6px] sm:border-gray-100">
        
        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden transition-opacity duration-300 relative ${showReels ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          
          <div className="px-5 pt-6 pb-2 sm:pt-5">
            <h1 className="text-2xl sm:text-xl font-bold flex items-center gap-2 text-gray-900">
              🔥 Trending Today
            </h1>
            
            <div className="flex gap-2 mt-4 sm:mt-3 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1">
              {['All', 'Villas', 'Apartments', 'Studios'].map((tab, i) => (
                <button 
                  key={tab}
                  className={`px-5 py-2 sm:py-1.5 sm:px-4 rounded-full text-sm sm:text-xs font-semibold whitespace-nowrap transition-colors ${
                    i === 0 ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 sm:gap-3 px-5 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden py-4 sm:py-2 items-center">
            
            {/* Featured Card #1 - Shrinks on Desktop (sm:h-[240px]) to prevent scroll */}
            <div className="min-w-[220px] h-[300px] sm:min-w-[180px] sm:h-[240px] rounded-[24px] relative overflow-hidden snap-center flex-shrink-0 shadow-[0_0_25px_rgba(59,130,246,0.35)] border border-blue-400/30 transition-all">
              <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=600&fit=crop" alt="Trending 1" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80"></div>
              
              <div className="absolute top-4 left-4 flex flex-col items-start gap-1">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                  🔥 +18% Trending
                </span>
                <span className="text-white text-5xl sm:text-4xl font-black drop-shadow-lg mt-1 tracking-tighter">#1</span>
              </div>

              <div className="absolute bottom-4 left-4 text-white text-sm sm:text-xs font-medium flex items-center gap-1.5">
                <svg className="w-5 h-5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                2.5M Likes
              </div>
            </div>

            {/* Secondary Card #2 - Shrinks on Desktop */}
            <div className="min-w-[140px] h-[190px] sm:min-w-[110px] sm:h-[150px] rounded-[16px] relative overflow-hidden snap-center flex-shrink-0 shadow-lg border border-gray-100 transition-all">
              <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=600&fit=crop" alt="Trending 2" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"></div>
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-sm sm:text-xs font-bold px-2 py-0.5 rounded-md">#2</div>
              <div className="absolute bottom-2 left-2 text-white text-xs sm:text-[10px] font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                1.8M
              </div>
            </div>

            {/* Secondary Card #3 - Shrinks on Desktop */}
            <div className="min-w-[140px] h-[190px] sm:min-w-[110px] sm:h-[150px] rounded-[16px] relative overflow-hidden snap-center flex-shrink-0 shadow-lg border border-gray-100 transition-all">
              <img src="https://images.unsplash.com/photo-1600607687920-4e2a09c15e13?w=400&h=600&fit=crop" alt="Trending 3" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"></div>
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-sm sm:text-xs font-bold px-2 py-0.5 rounded-md">#3</div>
              <div className="absolute bottom-2 left-2 text-white text-xs sm:text-[10px] font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                1.2M
              </div>
            </div>
          </div>

          {/* For You Section - Shrinks on Desktop */}
          <div className="px-5 mt-2 pb-6 sm:pb-2">
            <h2 className="text-xl sm:text-lg font-bold flex items-center gap-2 mb-4 sm:mb-2 text-gray-900">
              🎬 For You
            </h2>
            
            <div 
              className="relative w-full h-[240px] sm:h-[180px] cursor-pointer group transition-all"
              onClick={() => setShowReels(true)}
            >
              <div className="absolute top-3 right-0 w-[80%] h-[200px] sm:h-[150px] rounded-[20px] overflow-hidden shadow-lg transform translate-x-4 scale-90 rotate-2 opacity-80 transition-transform group-hover:rotate-6 group-hover:translate-x-6">
                <img src={reelsData[1].img} alt="Next Reel" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>

              <div className="absolute top-0 left-0 w-[85%] h-[240px] sm:h-[180px] rounded-[24px] sm:rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-10 transition-transform group-hover:-translate-y-1 group-hover:scale-[1.02] border border-white/50">
                <img src={reelsData[0].img} alt="Current Reel" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white pl-1 shadow-xl">
                      <svg className="w-6 h-6 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                   </div>
                </div>
                
                <div className="absolute bottom-4 sm:bottom-3 left-4 right-4 flex justify-between items-end">
                  <div className="text-white">
                    <p className="font-bold text-sm sm:text-xs">@luxury_estates</p>
                    <p className="text-[11px] sm:text-[9px] opacity-80 mt-0.5">Modern hillside villa design...</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-red-500 text-sm sm:text-xs">❤️</span>
                    </div>
                    <span className="text-white text-[10px] sm:text-[8px] font-semibold drop-shadow">{reelsData[0].likes}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs sm:text-[10px] text-gray-400 mt-6 sm:mt-4 font-medium tracking-wide uppercase">Tap to watch reels</p>
          </div>
        </div>

        {/* FULL SCREEN REELS MODAL */}
        {showReels && (
          <div className="absolute inset-0 z-[100] bg-black text-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-[inherit] overflow-hidden">
            <div className="absolute top-0 left-0 w-full p-4 pt-10 sm:pt-6 z-50 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
              <button 
                onClick={() => setShowReels(false)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              </button>
              <span className="font-semibold text-sm tracking-widest">Reels</span>
              <div className="w-10 h-10"></div> 
            </div>

            <div className="flex-1 overflow-y-auto snap-y snap-mandatory h-full [&::-webkit-scrollbar]:hidden">
              {reelsData.map((reel) => (
                <div key={reel.id} className="w-full h-full snap-start relative bg-gray-900">
                  <img src={reel.img} alt="Reel" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                  
                  <div className="absolute right-4 bottom-24 sm:bottom-20 flex flex-col gap-6 sm:gap-4 items-center">
                    <button className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6 sm:w-4 sm:h-4 fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      </div>
                      <span className="text-xs sm:text-[10px] font-semibold">{reel.likes}</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6 sm:w-4 sm:h-4 fill-white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                      </div>
                      <span className="text-xs sm:text-[10px] font-semibold">124</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                         <svg className="w-6 h-6 sm:w-4 sm:h-4 fill-white" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
                      </div>
                      <span className="text-xs sm:text-[10px] font-semibold">Share</span>
                    </button>
                  </div>

                  <div className="absolute bottom-6 sm:bottom-4 left-4 right-20">
                    <h3 className="font-bold text-lg sm:text-base mb-1">@modern_architecture</h3>
                    <p className="text-sm sm:text-xs opacity-90 line-clamp-2">Touring this amazing property today! Wait until you see the pool... 🌊🏡 #realestate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        {!showReels && (
          <div className="w-full h-20 sm:h-16 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.08)] flex justify-around items-center px-2 z-50 flex-shrink-0 relative">
            <button className="flex flex-col items-center gap-1 text-gray-900 p-2">
              <svg className="w-6 h-6 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              <span className="text-[10px] sm:text-[9px] font-semibold">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors p-2">
              <svg className="w-6 h-6 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg>
              <span className="text-[10px] sm:text-[9px] font-medium">Explore</span>
            </button>
            <div className="relative -top-6 sm:-top-5">
              <button className="w-14 h-14 sm:w-12 sm:h-12 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white hover:scale-105 transition-transform">
                <svg className="w-8 h-8 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </button>
            </div>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors p-2">
              <svg className="w-6 h-6 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              <span className="text-[10px] sm:text-[9px] font-medium">Messages</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors p-2">
              <svg className="w-6 h-6 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <span className="text-[10px] sm:text-[9px] font-medium">Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}