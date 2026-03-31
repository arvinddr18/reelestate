import React from 'react';

export default function ExploreScreen() {
  return (
    <div className="flex justify-center bg-gray-100 min-h-screen font-sans">
      {/* Mobile Device Container */}
      <div className="w-full max-w-[400px] bg-white h-[100dvh] relative overflow-hidden flex flex-col shadow-2xl sm:rounded-3xl sm:h-[800px] sm:my-8 border border-gray-200">
        
        {/* Scrollable Content Area - Adjusted padding to fit everything */}
        <div className="flex-1 overflow-y-auto pb-20 [&::-webkit-scrollbar]:hidden">
          
          {/* Header Section - Reduced top padding */}
          <div className="px-5 pt-6 pb-2">
            <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              🔥 Trending Today
            </h1>
            
            {/* Category Filter */}
            <div className="flex gap-2 mt-3 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1">
              {['All', 'Food', 'Fitness', 'Travel'].map((tab, i) => (
                <button 
                  key={tab}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    i === 0 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Cards Section - Uniform Heights */}
          <div className="flex gap-3 px-5 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden pb-2">
            
            {/* Featured Card #1 - Resized to match others */}
            <div className="min-w-[160px] h-[230px] rounded-[20px] relative overflow-hidden snap-center flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/20">
              <img 
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=600&fit=crop" 
                alt="Trending 1" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
              
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                <span className="text-white text-2xl font-black drop-shadow-md">#1</span>
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                  🔥 +18%
                </span>
              </div>
              <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                2.5M Likes
              </div>
            </div>

            {/* Secondary Card #2 - Matched height */}
            <div className="min-w-[160px] h-[230px] rounded-[20px] relative overflow-hidden snap-center flex-shrink-0 shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=600&fit=crop" 
                alt="Trending 2" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70"></div>
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-lg font-bold px-2.5 py-0.5 rounded-lg">#2</div>
              <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                1.8M Likes
              </div>
            </div>

            {/* Secondary Card #3 - Matched height */}
            <div className="min-w-[160px] h-[230px] rounded-[20px] relative overflow-hidden snap-center flex-shrink-0 shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1600607687920-4e2a09c15e13?w=400&h=600&fit=crop" 
                alt="Trending 3" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70"></div>
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-lg font-bold px-2.5 py-0.5 rounded-lg">#3</div>
              <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                1.2M
              </div>
            </div>
          </div>

          {/* For You Section */}
          <div className="px-5 mt-2">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-3 text-gray-900">
              🎬 For You
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Grid Item 1 - Resized to match Trending cards */}
              <div className="rounded-[20px] h-[230px] relative overflow-hidden shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=600&fit=crop" 
                  alt="For You 1" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-2 right-2 flex flex-col gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
                      <span className="text-red-500 text-xs">❤️</span>
                    </div>
                    <span className="text-white text-[10px] font-semibold drop-shadow">16.2K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
                      <span className="text-white text-xs">💬</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Item 2 - Resized to match Trending cards */}
              <div className="rounded-[20px] h-[230px] relative overflow-hidden shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=600&fit=crop" 
                  alt="For You 2" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-2 right-2 flex flex-col gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
                      <span className="text-white text-xs">🤍</span>
                    </div>
                    <span className="text-white text-[10px] font-semibold drop-shadow">231</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
                      <span className="text-white text-xs">💬</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 w-full h-16 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.08)] sm:rounded-b-3xl flex justify-around items-center px-2 z-50">
          
          <button className="flex flex-col items-center gap-0.5 text-gray-900 p-2">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-[9px] font-semibold">Home</span>
          </button>
          
          <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-900 transition-colors p-2">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg>
            <span className="text-[9px] font-medium">Explore</span>
          </button>

          {/* Elevated Center Button */}
          <div className="relative -top-5">
            <button className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white hover:scale-105 transition-transform">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </button>
          </div>

          <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-900 transition-colors p-2">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            <span className="text-[9px] font-medium">Messages</span>
          </button>

          <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-900 transition-colors p-2">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span className="text-[9px] font-medium">Profile</span>
          </button>

        </div>
      </div>
    </div>
  );
}