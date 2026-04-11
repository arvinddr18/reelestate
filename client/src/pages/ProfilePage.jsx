import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdSettings, IoMdGrid, IoMdList, IoMdLock, IoMdShare, IoMdArrowBack, IoMdPin } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('grid');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for visual design - Replace with your API call
  useEffect(() => {
    // simulate fetching
    setTimeout(() => {
      setUserData({
        name: "Aravind D R",
        username: "arvinddr",
        bio: "Hahhash",
        location: "Tarikere",
        role: "SELLER",
        status: "LIVE NODE",
        stats: { posts: 18, network: 1, reach: "2,574" }
      });
      setLoading(false);
    }, 800);
  }, [id]);

  const tabs = [
    { id: 'grid', label: 'GRID', icon: <IoMdGrid /> },
    { id: 'list', label: 'LIST', icon: <IoMdList /> },
    { id: 'vault', label: 'VAULT', icon: <IoMdLock /> },
  ];

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#0B0F19]"><div className="w-12 h-12 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden pb-20">
      
      {/* ─── 🛰️ TOP NAVIGATION BAR ─── */}
      <div className="px-6 py-8 flex justify-between items-center relative z-20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/50 transition-all active:scale-90">
          <IoMdArrowBack size={22} />
        </button>
        <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/50 transition-all group">
          <IoMdShare size={20} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        
        {/* ─── 🔮 MAIN PROFILE CARD ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="relative bg-[#151A25]/60 backdrop-blur-3xl rounded-[48px] border border-white/5 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0057FF]/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#00F0FF]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            
            {/* THE NEURAL AVATAR RING */}
            <div className="relative w-40 h-40 shrink-0">
               {/* Animated Outer Orbit */}
               <div className="absolute inset-0 rounded-full border-[2px] border-dashed border-[#00F0FF]/30 animate-[spin_15s_linear_infinite]" />
               {/* Pulse Ring */}
               <div className="absolute -inset-1 rounded-full border border-[#00F0FF]/20 animate-pulse" />
               
               <div className="w-full h-full rounded-full p-2 bg-gradient-to-tr from-[#0057FF]/20 to-[#00F0FF]/20 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
                  <img 
                    src={`https://i.pravatar.cc/300?u=${userData.username}`} 
                    className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                    alt="avatar" 
                  />
               </div>
            </div>

            {/* INFO PANEL */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-lg">{userData.name}</h1>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-[10px] font-black uppercase tracking-widest hover:bg-[#00F0FF] hover:text-black transition-all">
                  <IoMdSettings /> System Config
                </button>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black tracking-tighter text-gray-400 uppercase">@{userData.username}</span>
                <span className="px-3 py-1 rounded-lg bg-[#0057FF]/20 border border-[#0057FF]/50 text-[10px] font-black text-[#0057FF] uppercase tracking-widest">{userData.role}</span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[10px] font-black text-[#00ff9d] uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-ping" /> {userData.status}
                </span>
              </div>

              <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-md mb-4">{userData.bio}</p>
              
              <div className="flex items-center justify-center md:justify-start gap-1 text-[#00F0FF]/60 font-bold text-xs">
                <IoMdPin /> <span className="uppercase tracking-widest">{userData.location}</span>
              </div>
            </div>
          </div>

          {/* ─── 📊 THE METRICS MATRIX ─── */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-12 border-t border-white/5">
            {[
              { label: "Total Posts", val: userData.stats.posts },
              { label: "Network Size", val: userData.stats.network, color: "text-[#bc00dd]" },
              { label: "Global Reach", val: userData.stats.reach, color: "text-white" }
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-pointer">
                <p className={`text-2xl md:text-3xl font-black mb-1 transition-all group-hover:scale-110 ${stat.color || 'text-white'}`}>
                  {stat.val}
                </p>
                <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-[#00F0FF] transition-colors">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── 🎮 THE NAVIGATION CONSOLE (TABS) ─── */}
        <div className="mt-12 flex justify-center">
          <div className="flex bg-[#151A25]/80 backdrop-blur-xl p-1.5 rounded-[24px] border border-white/5 gap-2 shadow-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-8 py-3 rounded-2xl text-[11px] font-black tracking-widest transition-all duration-500 overflow-hidden ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeProfileTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#0057FF] to-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                  />
                )}
                <span className="relative z-10 text-lg">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 🖼️ THE DATA GRID (CONTENT) ─── */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-20"
            >
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="aspect-square rounded-[32px] bg-[#151A25] border border-white/5 overflow-hidden group relative cursor-pointer shadow-lg hover:shadow-[#00F0FF]/10 transition-all duration-500">
                  <img 
                    src={`https://picsum.photos/500/500?random=${item + 50}`} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                    alt="content" 
                  />
                  {/* Holographic Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <div className="flex items-center gap-2 text-[#00F0FF] font-black text-[10px] tracking-widest uppercase">
                      <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" /> View Node
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}