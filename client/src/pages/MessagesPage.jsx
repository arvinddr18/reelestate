import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  IoMdArrowBack, IoMdSearch, IoMdCheckmark, IoMdAdd, IoMdPulse 
} from 'react-icons/io';
import { useAuth } from '../context/AuthContext';

// 🚨 IMPORT YOUR REAL CHAT ROOM HERE!
import ChatRoom from './ChatRoom'; 

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const API_URL = RAW_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

export default function Messages() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dbUsers, setDbUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  // Fetch Network
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
          if (followingRes.data?.success && Array.isArray(followingRes.data.data)) combinedNetwork = [...combinedNetwork, ...followingRes.data.data];
        } catch (err) {}

        try {
          const followersRes = await axios.get(`${API_URL}/api/users/${userId}/followers`, { headers });
          if (followersRes.data?.success && Array.isArray(followersRes.data.data)) combinedNetwork = [...combinedNetwork, ...followersRes.data.data];
        } catch (err) {}

        const uniqueUsers = [];
        const seenIds = new Set();
        combinedNetwork.forEach(user => {
          if (!user) return; 
          const uId = user._id || user.id;
          if (!uId || String(uId) === String(userId)) return; 
          if (!seenIds.has(String(uId))) {
            seenIds.add(String(uId));
            uniqueUsers.push(user);
          }
        });
        setDbUsers(uniqueUsers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNetwork();
  }, [currentUser]);

  const filteredUsers = dbUsers.filter(u => {
    if (!searchQuery) return true; 
    const query = searchQuery.toLowerCase().trim();
    const fullName = (u.fullName || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    return fullName.includes(query) || username.includes(query);
  });

  return (
    <div className="relative w-full h-[100dvh] md:h-full bg-[#05070A] text-white font-sans flex overflow-hidden">
      
      {/* AMBIENT BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#05070A]">
        <div className="absolute inset-0 opacity-50 mix-blend-screen bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute top-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,_rgba(193,31,112,0.15)_0%,_rgba(0,0,0,0)_70%)] blur-[80px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(0,140,255,0.1)_0%,_rgba(0,0,0,0)_70%)] blur-[100px] animate-[pulse_10s_ease-in-out_infinite_alternate]" />
      </div>

      {/* ─── LEFT PANE: USER LIST ─── */}
      <div className={`w-full md:w-[400px] lg:w-[450px] h-full flex flex-col bg-black/20 backdrop-blur-md border-r border-[#1E2532] z-10 shrink-0 transition-transform duration-500 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <header className="px-6 py-5 shrink-0 relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#00F0FF] transition-colors shadow-lg backdrop-blur-md">
                <IoMdArrowBack size={20} />
              </button>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-wide text-white">Messages</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <IoMdPulse className="text-[#00F0FF] animate-pulse" size={14} />
                  <span className="text-[9px] font-bold text-[#00F0FF] uppercase tracking-[0.15em] opacity-80">Quantum Encrypted</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-full p-1.5 flex items-center shadow-inner focus-within:border-[#00F0FF]/50 transition-colors backdrop-blur-xl">
            <div className="w-10 h-10 flex items-center justify-center text-[#00F0FF]/70"><IoMdSearch size={20} /></div>
            <input type="text" placeholder="Search your network..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-sm text-white font-bold outline-none placeholder-gray-400" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-4 px-4 pt-2 relative z-10">
          <div className="space-y-3">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 drop-shadow-md">Encrypted Channels</h2>
            {loading ? (
              <div className="text-center py-10 text-[#00F0FF] animate-pulse font-bold text-sm tracking-widest uppercase">Decrypting Network...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-bold text-sm">No networked users found.</div>
            ) : (
              filteredUsers.map(user => (
                <div key={user._id || user.id} onClick={() => setActiveChat(user)} className={`block p-4 rounded-[24px] backdrop-blur-md transition-all duration-300 cursor-pointer group relative overflow-hidden border ${activeChat?._id === user._id ? 'bg-white/10 border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] scale-[1.02]' : 'bg-[#121826]/40 border-transparent hover:bg-white/5 hover:border-white/10 hover:-translate-y-1'}`}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative shrink-0">
                      <div className={`absolute -inset-1 rounded-full border ${activeChat?._id === user._id ? 'border-[#00f0ff] animate-[pulse_2s_infinite]' : 'border-[#00ff9d] opacity-50'}`} />
                      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#1E2532]/50 overflow-hidden text-lg font-bold z-10">
                        {user.profilePhoto ? <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" /> : (user.fullName || user.username || 'U')[0].toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-black truncate ${activeChat?._id === user._id ? 'text-[#00F0FF]' : 'text-white'}`}>{user.fullName || `@${user.username}`}</h3>
                      <span className="text-[11px] font-bold truncate text-gray-300">Tap to open secure channel...</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANE: REAL CHAT ROOM INJECTION ─── */}
      <div className={`
        ${!activeChat ? 'hidden md:flex flex-1 relative items-center justify-center pointer-events-none' : ''}
        ${activeChat ? 'fixed inset-0 z-[9999] flex flex-col h-[100dvh] w-full bg-[#05070A] md:relative md:flex-1 md:h-full md:bg-transparent md:z-0' : ''}
      `}>
        {activeChat ? (
          /* 🚨 We pass the selected user to ChatRoom, and a function to close it! */
          <ChatRoom chatUser={activeChat} onBack={() => setActiveChat(null)} />
        ) : (
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(rgba(0, 240, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        )}
      </div>
    </div>
  );
}