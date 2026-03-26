import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IoMdArrowBack, IoMdSearch, IoMdMic, IoMdImage, 
  IoMdCheckmark, IoMdAdd, IoMdMore, IoMdPulse 
} from 'react-icons/io';

export default function Messages() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all'); // all, unread, business
  const [searchQuery, setSearchQuery] = useState('');

  // ─── DUMMY DATA FOR 2045 ───
  const activeUsers = [
    { id: 1, name: 'Aravind', img: 'https://i.pravatar.cc/150?img=11', isLive: true },
    { id: 2, name: 'Sarah_Real', img: 'https://i.pravatar.cc/150?img=44', isLive: true },
    { id: 3, name: 'Vortex', img: 'https://i.pravatar.cc/150?img=33', isLive: false },
    { id: 4, name: 'Elena', img: 'https://i.pravatar.cc/150?img=47', isLive: true },
    { id: 5, name: 'Marcus', img: 'https://i.pravatar.cc/150?img=15', isLive: true },
  ];

  const chatThreads = [
    {
      id: 'chat1',
      user: { name: 'Aravind D R', img: 'https://i.pravatar.cc/150?img=11', isOnline: true },
      lastMessage: 'Are we still on for the property tour?',
      time: 'Just now',
      unread: 3,
      type: 'text',
      isTyping: true,
      category: 'business'
    },
    {
      id: 'chat2',
      user: { name: 'Sarah Jenkins', img: 'https://i.pravatar.cc/150?img=44', isOnline: true },
      lastMessage: '0:14',
      time: '10:42 AM',
      unread: 1,
      type: 'voice',
      category: 'all'
    },
    {
      id: 'chat3',
      user: { name: 'Neo Estates', img: 'https://i.pravatar.cc/150?img=33', isOnline: false },
      lastMessage: 'Sent an image',
      time: 'Yesterday',
      unread: 0,
      type: 'image',
      status: 'read',
      category: 'business'
    },
    {
      id: 'chat4',
      user: { name: 'Tech Gadgets Hub', img: 'https://i.pravatar.cc/150?img=15', isOnline: false },
      lastMessage: 'Your order has been shipped via Drone.',
      time: 'Mon',
      unread: 0,
      type: 'text',
      status: 'delivered',
      category: 'all'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans overflow-x-hidden relative pb-20">
      
      {/* ─── CYBERPUNK AMBIENT BACKGROUND ─── */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-[#0057FF]/10 to-transparent pointer-events-none" />
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00F0FF] opacity-5 blur-[150px] rounded-full pointer-events-none" />

      {/* ─── HOLOGRAPHIC HEADER ─── */}
      <header className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-2xl border-b border-[#1E2532] px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-gray-400 hover:text-[#00F0FF] transition-colors">
              <IoMdArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tighter italic text-white flex items-center gap-2">
                COMMS HUB <IoMdPulse className="text-[#00F0FF] animate-pulse" />
              </h1>
              <p className="text-[9px] font-black text-[#00F0FF] uppercase tracking-[0.2em]">Quantum Encrypted</p>
            </div>
          </div>
          
          <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-110 transition-transform">
            <IoMdAdd size={24} />
          </button>
        </div>

        {/* Smart Search Pill */}
        <div className="max-w-3xl mx-auto mt-5">
          <div className="bg-[#151A25]/90 border border-[#1E2532] rounded-full p-1.5 flex items-center shadow-inner focus-within:border-[#00F0FF]/50 transition-colors">
            <div className="w-10 h-10 flex items-center justify-center text-gray-500">
              <IoMdSearch size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search neural network..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white font-bold outline-none placeholder-gray-600"
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 space-y-8 relative z-10">
        
        {/* ─── ACTIVE RADAR (The 2045 Stories Alternative) ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Radar</h2>
            <span className="text-[10px] font-black text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded-full border border-[#00F0FF]/30">{activeUsers.filter(u => u.isLive).length} Online</span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x">
            {activeUsers.map(user => (
              <div key={user.id} className="snap-start shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="relative">
                  {/* Glowing Orbit Ring */}
                  <div className={`absolute -inset-1 rounded-full border border-dashed transition-transform duration-[3000ms] group-hover:rotate-180 ${user.isLive ? 'border-[#00F0FF] animate-[spin_10s_linear_infinite]' : 'border-[#1E2532]'}`} />
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-[#151A25] border-2 border-[#0B0F19] overflow-hidden relative z-10">
                    <img src={user.img} alt={user.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  </div>
                  {/* Online Dot */}
                  {user.isLive && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00F0FF] rounded-full border-[3px] border-[#0B0F19] z-20 shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
                  )}
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-wider">{user.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SMART FILTERS ─── */}
        <div className="flex gap-2 border-b border-[#1E2532] pb-1">
          {['all', 'unread', 'business'].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`pb-3 px-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeFilter === filter ? 'text-[#00F0FF]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {filter}
              {activeFilter === filter && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
              )}
            </button>
          ))}
        </div>

        {/* ─── FLOATING THREADS (The Chat List) ─── */}
        <div className="space-y-3">
          {chatThreads.map(chat => (
            // In a real app, this Link goes to /messages/${chat.id}
            <Link 
              key={chat.id} 
              to={`/messages/${chat.id}`} 
              className={`block p-4 rounded-[24px] bg-[#151A25]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden ${
                chat.unread > 0 
                  ? 'border border-[#00F0FF]/40 shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]' 
                  : 'border border-[#1E2532] hover:border-[#2A3441]'
              }`}
            >
              
              {/* Subtle neon hover sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

              <div className="flex items-center gap-4 relative z-10">
                
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img src={chat.user.img} alt={chat.user.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#0B0F19] shadow-lg" />
                  {chat.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00F0FF] rounded-full border-2 border-[#151A25]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-black truncate ${chat.unread > 0 ? 'text-white' : 'text-gray-200'}`}>
                      {chat.user.name}
                    </h3>
                    <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 ${chat.unread > 0 ? 'text-[#00F0FF]' : 'text-gray-500'}`}>
                      {chat.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    
                    {/* Dynamic Message Preview */}
                    <div className="flex-1 truncate">
                      {chat.isTyping ? (
                        <span className="text-[11px] font-bold text-[#00F0FF] italic flex items-center gap-1">
                          Typing<span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 truncate">
                          
                          {/* Message Type Icons */}
                          {chat.type === 'voice' && <IoMdMic className="text-[#F5A623] shrink-0" size={14} />}
                          {chat.type === 'image' && <IoMdImage className="text-purple-400 shrink-0" size={14} />}
                          
                          {/* Mini Soundwave for Voice */}
                          {chat.type === 'voice' && (
                            <div className="flex items-center gap-[2px] mr-1">
                              {[1, 3, 2, 4, 2].map((h, i) => (
                                <div key={i} className={`w-0.5 bg-[#F5A623] rounded-full h-${h}`} style={{ height: `${h * 3}px` }} />
                              ))}
                            </div>
                          )}

                          <span className={`text-xs font-bold truncate ${chat.unread > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                            {chat.lastMessage}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status & Badges */}
                    <div className="shrink-0 flex items-center gap-2">
                      {chat.unread > 0 ? (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] flex items-center justify-center text-[9px] font-black text-white shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                          {chat.unread}
                        </div>
                      ) : (
                        chat.status === 'read' ? (
                          <div className="flex -space-x-1">
                            <IoMdCheckmark className="text-[#00F0FF]" size={14} />
                            <IoMdCheckmark className="text-[#00F0FF]" size={14} />
                          </div>
                        ) : chat.status === 'delivered' ? (
                          <div className="flex -space-x-1">
                            <IoMdCheckmark className="text-gray-500" size={14} />
                            <IoMdCheckmark className="text-gray-500" size={14} />
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}