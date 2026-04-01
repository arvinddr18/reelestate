import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  IoMdArrowBack, IoMdSearch, IoMdMic, IoMdImage, 
  IoMdCheckmark, IoMdAdd, IoMdMore, IoMdPulse 
} from 'react-icons/io';
import { useAuth } from '../context/AuthContext';

// ─── CONNECT TO BACKEND (BULLETPROOF URL) ───
const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const API_URL = RAW_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

export default function Messages() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dbUsers, setDbUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeChat, setActiveChat] = useState(null);

  // ─── FETCH ENTIRE NETWORK ───
  useEffect(() => {
    const fetchNetwork = async () => {
      const userId = currentUser?._id || currentUser?.id;
      if (!userId) return; 

      try {
        const token = localStorage.getItem('reelestate_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        let combinedNetwork = [];

        try {
          const followingRes = await axios.get(`${API_URL}/api/users/${userId}/following`, { headers });
          if (followingRes.data?.success && Array.isArray(followingRes.data.data)) {
            combinedNetwork = [...combinedNetwork, ...followingRes.data.data];
          }
        } catch (err) {
          console.error("🔴 Following Fetch Error:", err.message);
        }

        try {
          const followersRes = await axios.get(`${API_URL}/api/users/${userId}/followers`, { headers });
          if (followersRes.data?.success && Array.isArray(followersRes.data.data)) {
            combinedNetwork = [...combinedNetwork, ...followersRes.data.data];
          }
        } catch (err) {
          console.error("🔴 Followers Fetch Error:", err.message);
        }

        const uniqueUsers = [];
        const seenIds = new Set();
        
        combinedNetwork.forEach(user => {
          if (!user) return; 
          const uId = user._id || user.id;
          if (!uId) return; 
          if (String(uId) === String(userId)) return; 
          
          if (!seenIds.has(String(uId))) {
            seenIds.add(String(uId));
            uniqueUsers.push(user);
          }
        });

        setDbUsers(uniqueUsers);
      } catch (err) {
        console.error("Critical error fetching network:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNetwork();
  }, [currentUser]);

  // ─── BULLETPROOF SEARCH FILTER ───
  const filteredUsers = dbUsers.filter(u => {
    if (!searchQuery) return true; 
    
    const query = searchQuery.toLowerCase().trim();
    const fullName = (u.fullName || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    
    return fullName.includes(query) || username.includes(query);
  });

  return (
    <div className="h-[100dvh] w-full bg-[#05070A] text-white font-sans flex overflow-hidden relative">
      
      {/* ─── PREMIUM AMBIENT BACKGROUND ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#030407]">
        {/* Soft, slow-breathing gradient orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(98,42,165,0.15)_0%,_rgba(0,0,0,0)_70%)] blur-[80px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,_rgba(0,140,255,0.1)_0%,_rgba(0,0,0,0)_70%)] blur-[100px] animate-[pulse_10s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-[radial-gradient(circle,_rgba(255,51,102,0.05)_0%,_rgba(0,0,0,0)_70%)] blur-[60px]" />
        
        {/* Very subtle noise texture for a premium matte finish */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      {/* ─── LEFT PANE: MESSAGES LIST ─── */}
      <div className={`w-full md:w-[400px] lg:w-[450px] h-full flex flex-col bg-black/20 backdrop-blur-md border-r border-[#1E2532] z-10 shrink-0 transition-transform duration-500 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        
        <header className="px-6 py-5 shrink-0 relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#00F0FF] transition-colors shadow-lg backdrop-blur-md">
                <IoMdArrowBack size={20} />
              </button>
              
              <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-wide text-white">
                  Messages
                </h1>
                {/* 👇 RESTORED: Heartbeat Pulse & Quantum Encrypted 👇 */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <IoMdPulse className="text-[#00F0FF] animate-pulse" size={14} />
                  <span className="text-[9px] font-bold text-[#00F0FF] uppercase tracking-[0.15em] opacity-80">Quantum Encrypted</span>
                </div>
              </div>
            </div>

            <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-110 transition-transform">
              <IoMdAdd size={24} />
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-full p-1.5 flex items-center shadow-inner focus-within:border-[#00F0FF]/50 transition-colors backdrop-blur-xl">
            <div className="w-10 h-10 flex items-center justify-center text-[#00F0FF]/70">
              <IoMdSearch size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search your network..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white font-bold outline-none placeholder-gray-400"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-4 px-4 pt-2 relative z-10">
          
          {!loading && dbUsers.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest drop-shadow-md">Active Radar</h2>
                <span className="text-[10px] font-black text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded-full border border-[#00F0FF]/30 backdrop-blur-md">
                  {dbUsers.length} Networked
                </span>
              </div>
              
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
                {dbUsers.slice(0, 10).map(user => (
                  <div key={user._id || user.id} onClick={() => setActiveChat(user)} className="snap-start shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full border border-dashed border-[#00F0FF] animate-[spin_10s_linear_infinite] group-hover:rotate-180 transition-transform duration-[3000ms]" />
                      <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-xl border-2 border-white/10 overflow-hidden relative z-10 flex items-center justify-center text-xl font-bold shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                        ) : (
                          (user.fullName || user.username || 'U')[0].toUpperCase()
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00F0FF] rounded-full border-[3px] border-[#0B0F19] z-20 shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
                    </div>
                    <span className="text-[10px] font-black text-gray-200 uppercase tracking-wider truncate w-16 text-center drop-shadow-md">
                      {user.fullName || user.username}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 drop-shadow-md">Encrypted Channels</h2>
            
            {loading ? (
              <div className="text-center py-10 text-[#00F0FF] animate-pulse font-bold text-sm tracking-widest uppercase">
                Decrypting Network...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-bold text-sm">
                {searchQuery ? "No matches found." : "No networked users found."}
              </div>
            ) : (
              filteredUsers.map(user => (
                <div 
                  key={user._id || user.id} 
                  onClick={() => setActiveChat(user)} 
                  className={`block p-4 rounded-[24px] backdrop-blur-md transition-all duration-300 cursor-pointer group relative overflow-hidden border ${activeChat?._id === user._id ? 'bg-[#00F0FF]/20 border-[#00F0FF]/50 shadow-[0_0_20px_rgba(0,240,255,0.2)]' : 'bg-black/40 border-white/10 hover:border-white/30 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF]/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative shrink-0 flex items-center justify-center w-14 h-14 rounded-full border-2 border-transparent bg-[#1E2532]/50 shadow-lg overflow-hidden text-lg font-bold">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        (user.fullName || user.username || 'U')[0].toUpperCase()
                      )}
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00F0FF] rounded-full border-2 border-[#151A25]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-black truncate ${activeChat?._id === user._id ? 'text-[#00F0FF]' : 'text-white'}`}>
                          {user.fullName || `@${user.username}`}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 truncate">
                          <span className="text-[11px] font-bold truncate text-gray-300">
                            Tap to open secure channel...
                          </span>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                            <div className="flex -space-x-1">
                              <IoMdCheckmark className="text-[#00F0FF]" size={14} />
                              <IoMdCheckmark className="text-[#00F0FF]" size={14} />
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANE: THE DATA TERMINAL ─── */}
      <div className={`flex-1 h-full flex flex-col relative bg-transparent z-0 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Holographic Blueprint Grid */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0, 240, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {activeChat ? (
          <>
            {/* Active Chat Header */}
            <div className="h-20 px-6 bg-black/60 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between z-20 shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveChat(null)} className="md:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 backdrop-blur-md">
                  <IoMdArrowBack size={20} />
                </button>
                <div className="w-12 h-12 rounded-full p-[1.5px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                   <div className="w-full h-full rounded-full bg-[#1E2532] border-2 border-[#0B0F19] overflow-hidden flex items-center justify-center text-white font-bold">
                     {activeChat.profilePhoto ? (
                        <img src={activeChat.profilePhoto} className="w-full h-full object-cover" alt="avatar" />
                     ) : (
                        (activeChat.fullName || activeChat.username || 'U')[0].toUpperCase()
                     )}
                   </div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-white font-black text-[16px]">{activeChat.fullName || `@${activeChat.username}`}</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse shadow-[0_0_5px_#00F0FF]" />
                    <span className="text-[#00F0FF] text-[10px] font-bold tracking-widest uppercase">Secure Channel Sync</span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white backdrop-blur-md">
                <IoMdMore size={20} />
              </button>
            </div>

            {/* Messages Area (Mocked) */}
            <div className="flex-1 overflow-y-auto p-6 z-10 flex flex-col gap-6 no-scrollbar bg-[#05070A]/80 backdrop-blur-md">
              <div className="flex justify-center mb-4 mt-4">
                <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[9px] font-black text-gray-400 tracking-widest uppercase shadow-lg">Encryption Started • Today</span>
              </div>

              {/* RECEIVED MESSAGE - Soft Dark Glass */}
              <div className="flex flex-col items-start w-full group">
                <div className="bg-[#121826]/80 backdrop-blur-xl border border-white/5 px-5 py-3.5 rounded-3xl rounded-tl-xl max-w-[85%] md:max-w-[65%] relative shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,140,255,0.1)] transition-shadow duration-300">
                  <div className="absolute inset-0 rounded-3xl rounded-tl-xl bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                  <p className="text-gray-100 text-[15px] leading-relaxed mb-1.5 font-medium tracking-wide">Network established. Ready to securely exchange property assets.</p>
                  <span className="text-gray-500 text-[10px] font-semibold tracking-wider">10:41 AM</span>
                </div>
              </div>

              {/* SENT MESSAGE - Premium Purple/Pink Gradient Glow */}
              <div className="flex flex-col items-end w-full group mt-2">
                <div className="bg-gradient-to-br from-[#801fd6]/80 to-[#c11f70]/80 backdrop-blur-xl border border-white/10 px-5 py-3.5 rounded-3xl rounded-tr-xl max-w-[85%] md:max-w-[65%] relative shadow-[0_8px_25px_rgba(193,31,112,0.25)] hover:shadow-[0_12px_35px_rgba(193,31,112,0.35)] transition-shadow duration-300">
                  <div className="absolute inset-0 rounded-3xl rounded-tr-xl bg-gradient-to-b from-white/[0.1] to-transparent pointer-events-none" />
                  <p className="text-white text-[15px] leading-relaxed mb-1.5 font-medium tracking-wide drop-shadow-sm">Confirmed. Standing by for data transmission. 🚀</p>
                  <div className="flex justify-end items-center gap-1.5">
                    <span className="text-white/70 text-[10px] font-semibold tracking-wider drop-shadow-sm">10:42 AM</span>
                    <div className="flex -space-x-1">
                      <IoMdCheckmark className="text-white" size={14} />
                      <IoMdCheckmark className="text-white" size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div> {/* <-- THIS IS THE MISSING DIV THAT FIXES THE ERROR */}

            {/* FLOATING CAPSULE INPUT */}
            <div className="p-4 md:p-8 bg-transparent z-20 shrink-0 pb-8 md:pb-8 relative flex justify-center">
              {/* Soft shadow below the bar */}
              <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#030407] to-transparent pointer-events-none" />
              
              <div className="relative w-full max-w-3xl flex items-center gap-2 bg-[#1A1F2E]/60 backdrop-blur-2xl border border-white/10 p-1.5 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.5)] focus-within:border-white/20 focus-within:bg-[#1A1F2E]/80 transition-all duration-300">
                
                <button className="w-10 h-10 rounded-full bg-transparent hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0 ml-1 group">
                  <IoMdAdd size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
                
                <input 
                  type="text" 
                  placeholder="Message..." 
                  className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder-gray-500 font-medium px-2"
                />
                
                <button className="w-10 h-10 rounded-full bg-transparent hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0">
                  <IoMdMic size={22} />
                </button>
                
                <button className="w-10 h-10 rounded-full bg-gradient-to-r from-[#801fd6] to-[#c11f70] flex items-center justify-center text-white hover:scale-105 transition-transform shadow-[0_4px_15px_rgba(193,31,112,0.4)] shrink-0 mr-1">
                  <svg className="w-4 h-4 translate-x-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty Space for Desktop */
          <div className="flex-1 flex flex-col items-center justify-center z-10 bg-transparent relative pointer-events-none"></div>
        )}
      </div>

    </div>
  );
}