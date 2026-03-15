import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ShareSheet({ post, onClose }) {
  const [search, setSearch] = useState('');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Followers & Following from your backend
  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        // You'll need an endpoint that returns both followers and following
        const { data } = await api.get('/users/connections'); 
        setConnections(data); 
      } catch (err) {
        console.error("Couldn't load friends");
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  const filtered = connections.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleExternalShare = (platform) => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-zinc-900 rounded-t-[30px] p-4 animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-6" onClick={onClose} />
        
        {/* Search Bar */}
        <div className="px-2 mb-4">
          <input 
            type="text" 
            placeholder="Search friends..." 
            className="w-full bg-zinc-800 border-none rounded-xl py-2.5 px-4 text-white text-sm outline-none focus:ring-1 ring-orange-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Friends List (Followers/Following) */}
        <div className="max-h-[350px] overflow-y-auto space-y-4 no-scrollbar px-2">
          {loading ? (
            <div className="text-center py-10 text-zinc-500 text-sm">Loading friends...</div>
          ) : filtered.length > 0 ? (
            filtered.map(friend => (
              <div key={friend._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500 overflow-hidden flex items-center justify-center text-white font-bold">
                    {friend.profilePhoto ? (
                      <img src={friend.profilePhoto} className="w-full h-full object-cover" alt="" />
                    ) : friend.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">@{friend.username}</p>
                    <p className="text-zinc-500 text-xs">{friend.fullName || 'Member'}</p>
                  </div>
                </div>
                <button className="bg-orange-500 text-white text-xs font-bold px-5 py-2 rounded-lg active:scale-95 transition-all">
                  Send
                </button>
              </div>
            ))
          ) : (
            <p className="text-zinc-500 text-center py-10 text-sm">No friends found</p>
          )}
        </div>

        {/* Bottom Apps Section */}
        <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-6 overflow-x-auto no-scrollbar pb-4">
          <div onClick={() => handleExternalShare('whatsapp')} className="flex flex-col items-center gap-2 cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-2xl">💬</div>
            <span className="text-[10px] text-zinc-400 font-bold">WhatsApp</span>
          </div>
          <div onClick={() => handleExternalShare('copy')} className="flex flex-col items-center gap-2 cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-2xl">🔗</div>
            <span className="text-[10px] text-zinc-400 font-bold">Copy Link</span>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-2xl">👤</div>
            <span className="text-[10px] text-zinc-400 font-bold">Facebook</span>
          </div>
        </div>
      </div>
    </div>
  );
}