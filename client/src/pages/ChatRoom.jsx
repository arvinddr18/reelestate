import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { IoMdArrowBack, IoMdSend, IoMdMore, IoMdHappy, IoMdImage, IoMdMic } from 'react-icons/io';

export default function ChatRoom() {
  const { userId } = useParams(); 
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [message, setMessage] = useState('');
  const [chatUser, setChatUser] = useState({
    username: 'alex_investments',
    fullName: 'Alex Reynolds',
    profilePhoto: 'https://i.pravatar.cc/150?img=11',
    isOnline: true,
  });

  const [messages, setMessages] = useState([
    { _id: '1', text: 'Hey! I saw your new property listing in the Sale Hub.', senderId: 'them', time: '10:42 AM' },
    { _id: '2', text: 'Is it still available for a viewing this weekend?', senderId: 'them', time: '10:43 AM' },
    { _id: '3', text: 'Hello Alex! Yes, it is still available. I have open slots on Saturday afternoon.', senderId: 'me', time: '10:45 AM' },
    { _id: '4', text: 'Perfect. Let\'s lock in 2:00 PM.', senderId: 'them', time: '10:47 AM' },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = {
      _id: Date.now().toString(),
      text: message,
      senderId: 'me', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMsg]);
    setMessage('');
  };

  return (
    // We use min-h-[100dvh] and flex-col to perfectly structure the room
    <div className="min-h-[100dvh] flex flex-col bg-[#0B0F19] text-white relative font-sans overflow-hidden">
      
      {/* ─── AMBIENT BACKGROUND GLOWS (Fixed to viewport) ─── */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-[#0057FF] opacity-10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[10%] right-[-10%] w-96 h-96 bg-[#00F0FF] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      {/* ─── 1. FULL-WIDTH GLASS HEADER ─── */}
      <header className="sticky top-0 z-50 w-full bg-[#0B0F19]/80 backdrop-blur-2xl border-b border-[#1E2532] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-gray-400 hover:text-[#00F0FF] hover:bg-[#1E2532] transition-colors shadow-inner active:scale-95">
              <IoMdArrowBack size={20} />
            </button>
            
            <Link to={`/profile/${userId || 'demo'}`} className="flex items-center gap-3 group">
              <div className="relative">
                <img src={chatUser.profilePhoto} alt="User" className="w-10 h-10 rounded-full object-cover border border-[#1E2532] group-hover:border-[#00F0FF]/50 transition-colors shadow-md" />
                {chatUser.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00F0FF] rounded-full border-2 border-[#0B0F19] shadow-[0_0_10px_rgba(0,240,255,0.8)] animate-pulse" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white leading-tight group-hover:text-[#00F0FF] transition-colors">{chatUser.fullName}</span>
                <span className="text-[9px] font-black text-[#00F0FF] tracking-widest uppercase">{chatUser.isOnline ? 'Active Now' : 'Offline'}</span>
              </div>
            </Link>
          </div>
          
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#151A25] transition-colors">
            <IoMdMore size={24} />
          </button>
        </div>
      </header>

      {/* ─── 2. HOLOGRAPHIC CHAT AREA ─── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 pb-4 flex flex-col gap-6 relative z-10">
        
        {/* End-to-End Encryption Badge */}
        <div className="flex justify-center mb-2">
          <div className="bg-[#151A25]/60 backdrop-blur-md border border-[#1E2532] px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest drop-shadow-md">Quantum Encrypted Chat</span>
          </div>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.senderId === 'me';
          
          return (
            <div key={msg._id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] sm:max-w-[75%] relative group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                
                {/* ── THE MESSAGE "PANEL" ── */}
                <div className={`px-5 py-3.5 text-sm font-bold leading-relaxed relative z-10 shadow-lg transition-all
                  ${isMe 
                    ? 'bg-gradient-to-br from-[#0057FF]/90 to-[#00F0FF]/80 backdrop-blur-xl text-white rounded-3xl rounded-tr-[8px] border border-white/20 shadow-[0_5px_15px_rgba(0,87,255,0.2)] hover:shadow-[0_5px_20px_rgba(0,240,255,0.4)]' 
                    : 'bg-[#151A25]/90 backdrop-blur-xl text-gray-100 rounded-3xl rounded-tl-[8px] border border-[#1E2532] shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:border-[#00F0FF]/30'
                  }
                `}>
                  {msg.text}
                </div>

                {/* Time Stamp */}
                <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 px-2 ${isMe ? 'text-[#00F0FF]/70 text-right' : 'text-gray-500 text-left'}`}>
                  {msg.time}
                </span>

              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* ─── 3. SMART STICKY INPUT PILL ─── */}
      {/* This is the magic fix! 
        bottom-[90px] perfectly clears the mobile nav bar.
        md:bottom-8 perfectly floats it on Desktop.
        The gradient background fades the messages out smoothly as they scroll underneath.
      */}
      <div className="sticky bottom-[90px] md:bottom-8 z-50 w-full px-4 pt-10 pb-2 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/90 to-transparent pointer-events-none">
        
        <form onSubmit={handleSend} className="max-w-2xl mx-auto pointer-events-auto bg-[#151A25]/95 backdrop-blur-2xl border border-[#1E2532] p-1.5 rounded-[32px] flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] focus-within:border-[#00F0FF]/50 focus-within:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-300">
          
          <button type="button" className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:text-[#00F0FF] hover:bg-[#0B0F19] transition-all ml-1 active:scale-95">
            <IoMdImage size={20} />
          </button>
          
          <button type="button" className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:text-[#00F0FF] hover:bg-[#0B0F19] transition-all active:scale-95">
            <IoMdMic size={20} />
          </button>

          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message Alex..."
            className="flex-1 bg-transparent text-sm text-white px-3 outline-none placeholder-gray-500 font-bold"
          />

          <button type="button" className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all mr-1 active:scale-95">
            <IoMdHappy size={22} />
          </button>

          <button 
            type="submit" 
            disabled={!message.trim()}
            className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${
              message.trim() 
                ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white shadow-[0_0_20px_rgba(0,240,255,0.5)] rotate-0 scale-105' 
                : 'bg-[#1E2532] text-gray-600 -rotate-45 scale-90'
            }`}
          >
            <IoMdSend size={20} className={message.trim() ? "ml-1" : ""} />
          </button>

        </form>
      </div>

    </div>
  );
}