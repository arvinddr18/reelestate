import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  IoMdArrowBack, IoMdSearch, IoMdMic, IoMdImage, 
  IoMdCheckmark, IoMdAdd, IoMdMore, IoMdPulse 
} from 'react-icons/io';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export default function Messages() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dbUsers, setDbUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── FETCH ENTIRE NETWORK (WITH X-RAY LOGS) ───
  useEffect(() => {
    const fetchNetwork = async () => {
      const userId = currentUser?._id || currentUser?.id;
      if (!userId) return; 

      console.log("🔵 1. Fetching network for User ID:", userId); // X-RAY

      try {
        const token = localStorage.getItem('reelestate_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        let combinedNetwork = [];

        // Fetch Following
        try {
          const followingRes = await axios.get(`${API_URL}/api/users/${userId}/following`, { headers });
          console.log("🟡 2. RAW 'Following' Response:", followingRes.data); // X-RAY
          if (followingRes.data?.success && Array.isArray(followingRes.data.data)) {
            combinedNetwork = [...combinedNetwork, ...followingRes.data.data];
          }
        } catch (err) {
          console.error("🔴 Following Fetch Error:", err.message);
        }

        // Fetch Followers
        try {
          const followersRes = await axios.get(`${API_URL}/api/users/${userId}/followers`, { headers });
          console.log("🟠 3. RAW 'Followers' Response:", followersRes.data); // X-RAY
          if (followersRes.data?.success && Array.isArray(followersRes.data.data)) {
            combinedNetwork = [...combinedNetwork, ...followersRes.data.data];
          }
        } catch (err) {
          console.error("🔴 Followers Fetch Error:", err.message);
        }

        console.log("🟣 4. Combined Raw Array before cleaning:", combinedNetwork); // X-RAY

        // Clean Data
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

        console.log("🟢 5. Final Cleaned Users given to UI:", uniqueUsers); // X-RAY

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
    if (!searchQuery) return true; // If search is empty, show everyone
    
    const query = searchQuery.toLowerCase().trim();
    const fullName = (u.fullName || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    
    return fullName.includes(query) || username.includes(query);
  });

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
              placeholder="Search your network..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white font-bold outline-none placeholder-gray-600"
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 space-y-8 relative z-10">
        
        {/* ─── ACTIVE RADAR ─── */}
        {!loading && dbUsers.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Radar</h2>
              <span className="text-[10px] font-black text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded-full border border-[#00F0FF]/30">
                {dbUsers.length} Networked
              </span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x">
              {dbUsers.slice(0, 10).map(user => (
                <Link to={`/messages/${user._id || user.id}`} key={user._id || user.id} className="snap-start shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full border border-dashed border-[#00F0FF] animate-[spin_10s_linear_infinite] group-hover:rotate-180 transition-transform duration-[3000ms]" />
                    <div className="w-16 h-16 rounded-full bg-[#151A25] border-2 border-[#0B0F19] overflow-hidden relative z-10 flex items-center justify-center text-xl font-bold">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                      ) : (
                        (user.fullName || user.username || 'U')[0].toUpperCase()
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00F0FF] rounded-full border-[3px] border-[#0B0F19] z-20 shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider truncate w-16 text-center">
                    {user.fullName || user.username}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── FLOATING THREADS (Real Users List) ─── */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-[#00F0FF] animate-pulse font-bold text-sm tracking-widest uppercase">
              Decrypting Network...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-bold text-sm">
              {searchQuery ? "No matches found." : "No networked users found."}
            </div>
          ) : (
            filteredUsers.map(user => (
              <Link 
                key={user._id || user.id} 
                to={`/messages/${user._id || user.id}`} 
                className="block p-4 rounded-[24px] bg-[#151A25]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-[#1E2532] hover:border-[#2A3441] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative shrink-0 flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#0B0F19] bg-[#1E2532] shadow-lg overflow-hidden text-lg font-bold">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      (user.fullName || user.username || 'U')[0].toUpperCase()
                    )}
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00F0FF] rounded-full border-2 border-[#151A25]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-black truncate text-white">
                        {user.fullName || `@${user.username}`}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold truncate text-gray-500">
                            Tap to open secure channel...
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                         <div className="flex -space-x-1">
                            <IoMdCheckmark className="text-gray-500" size={14} />
                            <IoMdCheckmark className="text-gray-500" size={14} />
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

      </main>
    </div>
  );
}