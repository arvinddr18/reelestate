import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { IoMdArrowBack, IoMdSend, IoMdMore, IoMdHappy, IoMdImage, IoMdMic } from 'react-icons/io';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const API_URL = RAW_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
const socket = io(API_URL);

export default function ChatRoom() {
  const { userId } = useParams(); 
  const { user: currentUser } = useAuth(); 
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  
  // ─── NEW: TYPING STATE ───
  const [isTyping, setIsTyping] = useState(false);

  const myId = currentUser?._id || currentUser?.id;
  const room = myId && userId ? [myId, userId].sort().join('_') : null;

  useEffect(() => {
    const fetchFriendProfile = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${API_URL}/api/users/${userId}`);
        if (res.data.success) setChatUser(res.data.data.user); 
      } catch (err) { console.error(err); }
    };
    fetchFriendProfile();
  }, [userId]);

  useEffect(() => {
    if (!myId || !userId || !room) return;

    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem('reelestate_token');
        const res = await axios.get(`${API_URL}/api/messages/${room}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) { console.error(err); }
    };
    fetchChatHistory();

    socket.emit('join_room', room);

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // ─── NEW: LISTEN FOR FRIEND TYPING ───
    socket.on('display_typing', () => setIsTyping(true));
    socket.on('hide_typing', () => setIsTyping(false));

    return () => {
      socket.off('receive_message');
      socket.off('display_typing');
      socket.off('hide_typing');
    };
  }, [room, myId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ─── NEW: EMIT TYPING EVENTS ───
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (room) {
      socket.emit('typing', { room });
      
      // Clear the old timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      // Stop typing after 2 seconds of silence
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { room });
      }, 2000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !room || !myId) return;

    const messageData = {
      room: room,
      text: message,
      senderId: myId, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, messageData]);
    setMessage('');
    
    // Stop typing immediately when sent!
    socket.emit('stop_typing', { room });
    socket.emit('send_message', messageData);

    try {
      const token = localStorage.getItem('reelestate_token');
      await axios.post(`${API_URL}/api/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0B0F19] text-white relative font-sans overflow-hidden">
      
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-[#0057FF] opacity-10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[10%] right-[-10%] w-96 h-96 bg-[#00F0FF] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#0B0F19]/80 backdrop-blur-2xl border-b border-[#1E2532] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-gray-400 hover:text-[#00F0FF] hover:bg-[#1E2532] transition-colors shadow-inner active:scale-95">
              <IoMdArrowBack size={20} />
            </button>
            <Link to={`/profile/${userId}`} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#1E2532] border border-[#1E2532] group-hover:border-[#00F0FF]/50 transition-colors overflow-hidden flex items-center justify-center font-bold">
                  {chatUser?.profilePhoto ? <img src={chatUser.profilePhoto} className="w-full h-full object-cover" /> : (chatUser?.fullName || 'U')[0].toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00F0FF] rounded-full border-2 border-[#0B0F19] shadow-[0_0_10px_rgba(0,240,255,0.8)] animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white">{chatUser?.fullName || 'Loading...'}</span>
                
                {/* DYNAMIC HEADER STATUS */}
                {isTyping ? (
                  <span className="text-[9px] font-black text-[#00F0FF] tracking-widest uppercase animate-pulse">Syncing Data...</span>
                ) : (
                  <span className="text-[9px] font-black text-[#0057FF] tracking-widest uppercase">Active Now</span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* MESSAGES AREA */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 pb-4 flex flex-col gap-6 relative z-10">
        <div className="flex justify-center mb-2">
          <div className="bg-[#151A25]/60 backdrop-blur-md border border-[#1E2532] px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Quantum Encrypted Chat</span>
          </div>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.senderId === myId;
          return (
            <div key={msg._id || index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] sm:max-w-[75%] relative group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 text-sm font-bold leading-relaxed relative z-10 shadow-lg transition-all
                  ${isMe ? 'bg-gradient-to-br from-[#0057FF]/90 to-[#00F0FF]/80 backdrop-blur-xl text-white rounded-3xl rounded-tr-[8px]' : 'bg-[#151A25]/90 backdrop-blur-xl text-gray-100 rounded-3xl rounded-tl-[8px] border border-[#1E2532]'}
                `}>
                  {msg.text}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 px-2 ${isMe ? 'text-[#00F0FF]/70 text-right' : 'text-gray-500 text-left'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}

        {/* ─── NEW: CYBERPUNK TYPING INDICATOR ─── */}
        {isTyping && (
          <div className="flex w-full justify-start animate-in fade-in zoom-in duration-300">
            <div className="bg-[#151A25]/80 backdrop-blur-xl border border-[#00F0FF]/30 px-5 py-3 rounded-3xl rounded-tl-[8px] flex items-center gap-3 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <span className="text-[10px] font-black text-[#00F0FF] tracking-widest uppercase animate-pulse">
                Receiving
              </span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#0057FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* INPUT FIELD */}
      <div className="sticky bottom-[90px] md:bottom-8 z-50 w-full px-4 pt-10 pb-2 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/90 to-transparent pointer-events-none">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto pointer-events-auto bg-[#151A25]/95 backdrop-blur-2xl border border-[#1E2532] p-1.5 rounded-[32px] flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] focus-within:border-[#00F0FF]/50 transition-all duration-300">
          <button type="button" className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:text-[#00F0FF] transition-all ml-1"><IoMdImage size={20} /></button>
          <button type="button" className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:text-[#00F0FF] transition-all"><IoMdMic size={20} /></button>
          
          <input 
            type="text" 
            value={message}
            onChange={handleTyping} // <-- CHANGED THIS TO FIRE OUR NEW FUNCTION
            placeholder={`Message ${chatUser?.fullName?.split(' ')[0] || '...'} `}
            className="flex-1 bg-transparent text-sm text-white px-3 outline-none placeholder-gray-500 font-bold"
          />

          <button type="button" className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all mr-1"><IoMdHappy size={22} /></button>
          <button type="submit" disabled={!message.trim()} className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${message.trim() ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white rotate-0 scale-105' : 'bg-[#1E2532] text-gray-600 -rotate-45 scale-90'}`}>
            <IoMdSend size={20} className={message.trim() ? "ml-1" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}