import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdAutoAwesome, MdMessage, MdOutlineAlternateEmail } from 'react-icons/md';
import { IoMdChatbubbles, IoMdInformationCircle } from 'react-icons/io';

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('nodexa_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch alerts from your new backend route
      const res = await axios.get('https://reelestate-backend.onrender.com/api/users/notifications/all', config);
      setNotifications(res.data.data);
      
      // Silently mark them as read in the background
      await axios.post('https://reelestate-backend.onrender.com/api/users/notifications/mark-read', {}, config);
    } catch (error) {
      console.error("Failed to load alerts", error);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Dynamic Icon & Color Engine based on Notification Type
  const getStyling = (type) => {
    switch (type) {
      case 'nod': return { icon: <MdAutoAwesome size={18} />, color: 'text-[#00F0FF]', bg: 'bg-[#00F0FF]/10', border: 'border-[#00F0FF]/30' };
      case 'message': return { icon: <MdMessage size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
      case 'tag': return { icon: <MdOutlineAlternateEmail size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
      case 'comment': return { icon: <IoMdChatbubbles size={18} />, color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/10', border: 'border-[#F5A623]/30' };
      default: return { icon: <IoMdInformationCircle size={18} />, color: 'text-gray-400', bg: 'bg-[#1E2532]', border: 'border-gray-600' };
    }
  };

  if (loading) return <div className="text-center py-10 text-[#00F0FF] animate-pulse">Scanning Network...</div>;

  return (
    <div className="w-full max-w-md mx-auto bg-[#0B0F19] border border-[#1E2532] rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
      
      {/* HEADER */}
      <div className="p-6 border-b border-[#1E2532] bg-[#151A25]/50 flex justify-between items-center">
        <h2 className="text-xl font-black text-white tracking-tight">System Alerts</h2>
        <span className="text-[10px] font-black text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-full border border-[#00F0FF]/20 uppercase tracking-widest">
          Live Feed
        </span>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm font-bold">No new alerts in your network.</div>
        ) : (
          notifications.map((note) => {
            const style = getStyling(note.type);
            
            return (
              <div key={note._id} className={`flex items-start gap-4 p-5 border-b border-[#1E2532] hover:bg-[#151A25] transition-colors cursor-pointer relative ${!note.isRead ? 'bg-[#151A25]/30' : ''}`}>
                
                {/* Unread Dot Indicator */}
                {!note.isRead && <div className="absolute top-5 left-2 w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />}

                {/* Avatar / Icon Container */}
                <div className="relative shrink-0 mt-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                    <img src={note.sender?.profilePhoto || `https://ui-avatars.com/api/?name=${note.sender?.username}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  {/* Floating Action Badge */}
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border ${style.bg} ${style.color} ${style.border}`}>
                    {style.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <p className="text-sm text-gray-300 leading-snug">
                    <span className="font-black text-white">@{note.sender?.username}</span> {note.content}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1.5">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}