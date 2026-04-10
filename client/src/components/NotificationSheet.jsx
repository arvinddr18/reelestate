import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose, IoMdNotifications, IoMdChatboxes, IoMdHeart, IoMdCalendar, IoMdPricetag, IoMdSettings } from 'react-icons/io';

const NOTIFS = [
  { id: 1, type: 'live', user: '@fit_raj', sub: 'Join workout stream', time: '1m ago', color: '#ff3366' },
  { id: 2, type: 'follow', user: '@rahul', sub: 'wants to follow you', time: '5m ago', color: '#00f0ff' },
  { id: 3, type: 'like', user: '@anita + 24 others', sub: 'liked your reel ❤️', time: '20m ago', color: '#ff3366' },
  { id: 4, type: 'comment', user: '@rahul', sub: 'commented: "Great workout!" 💬', time: '30m ago', color: '#00f0ff' },
  { id: 5, type: 'booking', user: 'Gym slot', sub: 'available today at 6 PM 📅', time: '45m ago', color: '#00ff9d' },
];

export default function NotificationSheet({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('Social');

  const tabs = [
    { name: 'All', icon: null },
    { name: 'Chats', icon: <IoMdChatboxes /> },
    { name: 'Social', icon: <IoMdHeart /> },
    { name: 'Bookings', icon: <IoMdCalendar /> },
    { name: 'Offers', icon: <IoMdPricetag /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
          />

          {/* Slide-in Panel */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-[#05070A]/95 backdrop-blur-3xl border-l border-white/10 z-[1000] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-white/5">
              <h2 className="text-white text-2xl font-black tracking-tight">Notifications</h2>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500/20 transition-all">
                <IoMdClose size={24} />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="px-4 py-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-black/20">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                    activeTab === tab.name 
                    ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                    : 'bg-white/5 border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.name} {tab.icon}
                </button>
              ))}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
              {NOTIFS.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.06] transition-all overflow-hidden ${n.type === 'live' ? 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''}`}
                >
                  {n.type === 'live' && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />}
                  
                  <div className="flex gap-4 items-start relative z-10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10 shrink-0 overflow-hidden shadow-lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-white font-bold text-sm truncate">{n.user} <span className="font-medium text-gray-400">{n.sub}</span></p>
                        <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0 ml-2">{n.time}</span>
                      </div>
                      
                      {/* Contextual Buttons */}
                      <div className="mt-3 flex gap-2">
                        {n.type === 'live' && <button className="px-6 py-1.5 rounded-lg bg-red-500 text-white text-[11px] font-black uppercase tracking-widest shadow-[0_5px_15px_rgba(239,68,68,0.4)] hover:scale-105 transition-transform">Join</button>}
                        {n.type === 'follow' && (
                          <>
                            <button className="px-4 py-1.5 rounded-lg bg-[#00f0ff] text-black text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all">Accept</button>
                            <button className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:text-red-500 transition-all">Decline</button>
                          </>
                        )}
                        {(n.type === 'like' || n.type === 'comment') && <button className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20">View</button>}
                        {n.type === 'booking' && <button className="px-4 py-1.5 rounded-lg bg-[#00ff9d] text-black text-[11px] font-black uppercase tracking-widest shadow-[0_5px_15px_rgba(0,255,157,0.3)]">Book Now</button>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Bottom Smart Nudge */}
              <div className="mt-4 p-5 rounded-3xl bg-gradient-to-br from-[#00f0ff]/20 to-transparent border border-[#00f0ff]/30">
                <p className="text-white font-black text-sm mb-1">Haven't worked out today? 💪</p>
                <div className="flex justify-between items-center">
                  <p className="text-[#00f0ff] text-xs font-bold">100 new interactions today</p>
                  <button className="px-4 py-2 rounded-xl bg-[#00f0ff] text-black text-[10px] font-black uppercase tracking-tighter shadow-lg">Get Moving</button>
                </div>
              </div>
            </div>

            {/* Footer Settings */}
            <button className="m-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-gray-400 hover:text-white transition-all group">
              <IoMdSettings className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-xs font-black uppercase tracking-widest">Notification Settings</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}