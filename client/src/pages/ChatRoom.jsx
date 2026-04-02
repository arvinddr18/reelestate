import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { IoMdArrowBack, IoMdSend, IoMdMore, IoMdHappy, IoMdImage, IoMdMic, IoMdClose, IoMdPulse } from 'react-icons/io';
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
  const fileInputRef = useRef(null); 

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); 

  // 🚨 THE HOLY GRAIL MOBILE FIX: Track exact screen space above keyboard
  const [vpHeight, setVpHeight] = useState('100dvh');

  useEffect(() => {
    // If the browser supports visualViewport (Mobile Chrome/Safari)
    if (window.visualViewport) {
      const handleResize = () => {
        // Force the app to exactly match the screen space ABOVE the open keyboard
        setVpHeight(`${window.visualViewport.height}px`);
      };
      window.visualViewport.addEventListener('resize', handleResize);
      handleResize(); // Set immediately on load
      
      // Lock the body from scrolling upward when the keyboard opens
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehaviorY = 'none';

      return () => {
        window.visualViewport.removeEventListener('resize', handleResize);
        document.body.style.overflow = '';
        document.body.style.overscrollBehaviorY = '';
      };
    }
  }, []);

  const myId = currentUser?._id || currentUser?.id;
  const room = myId && userId ? [myId, userId].sort().join('_') : null;

  // 1. Fetch Profile
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

  // 2. Socket & History
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
    socket.on('receive_message', (data) => setMessages((prev) => [...prev, data]));
    socket.on('display_typing', () => setIsTyping(true));
    socket.on('hide_typing', () => setIsTyping(false));
    return () => {
      socket.off('receive_message'); socket.off('display_typing'); socket.off('hide_typing');
    };
  }, [room, myId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedImage) || !room || !myId) return;

    const messageData = {
      room,
      text: message,
      image: selectedImage, 
      senderId: myId, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, messageData]);
    setMessage('');
    setSelectedImage(null); 
    socket.emit('send_message', messageData);

    try {
      const token = localStorage.getItem('reelestate_token');
      await axios.post(`${API_URL}/api/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) { console.error(err); }
  };

  return (
    /* 🚨 ULTIMATE MOBILE FIX: fixed inset-0 w-full forces this to completely cover the app on phones! */
    <div 
      className="fixed top-0 left-0 w-full flex flex-col bg-[#05070A] text-white font-sans overflow-hidden z-[9999]"
      style={{ height: vpHeight }} // Dynamic height locks it down when keyboard opens
    >
      
      {/* ─── PREMIUM AMBIENT BACKGROUND ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#05070A]">
        <div className="absolute inset-0 opacity-50 mix-blend-screen bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute top-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,_rgba(193,31,112,0.15)_0%,_rgba(0,0,0,0)_70%)] blur-[80px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(0,140,255,0.1)_0%,_rgba(0,0,0,0)_70%)] blur-[100px] animate-[pulse_10s_ease-in-out_infinite_alternate]" />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      {/* 1. FLEX HEADER - shrink-0 ensures it never squishes */}
      <div className="shrink-0 relative w-full h-[70px] md:h-24 px-3 md:px-8 bg-[#05070A]/98 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between z-20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 backdrop-blur-md">
            <IoMdArrowBack size={18} />
          </button>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full p-[1.5px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
             <div className="w-full h-full rounded-full bg-[#1E2532] border-2 border-[#0B0F19] overflow-hidden flex items-center justify-center text-white font-bold">
               {chatUser?.profilePhoto ? <img src={chatUser.profilePhoto} className="w-full h-full object-cover" alt="avatar" /> : (chatUser?.fullName || chatUser?.username || 'U')[0].toUpperCase()}
             </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-white font-black text-[14px] md:text-[16px]">{chatUser?.fullName || `@${chatUser?.username || '...'}`}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isTyping ? 'bg-[#00ff9d] shadow-[0_0_8px_#00ff9d] animate-pulse' : 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]'}`} />
              <span className={`text-[9px] md:text-[10px] font-bold tracking-widest uppercase flex items-center ${isTyping ? 'text-[#00ff9d]' : 'text-[#00F0FF]'}`}>
                {isTyping ? (
                  <>Typing<span className="flex ml-0.5"><span className="animate-[bounce_1s_infinite_0ms]">.</span><span className="animate-[bounce_1s_infinite_100ms]">.</span><span className="animate-[bounce_1s_infinite_200ms]">.</span></span></>
                ) : (
                  'Quantum Encrypted'
                )}
              </span>
            </div>
          </div>
        </div>
        
        {/* 📞 HANGING UPLINK TAGS */}
        <div className="flex items-start h-full absolute top-0 right-2 md:right-8">
          <div className="group flex flex-col items-center mr-2 md:mr-4 mt-0 cursor-pointer">
            <div className="w-[2px] h-3 md:h-6 bg-gradient-to-b from-transparent to-[#00f0ff]/50 group-hover:h-5 md:group-hover:h-8 transition-all duration-300"></div>
            <button className="relative w-8 h-10 md:w-10 md:h-12 bg-[#05070A]/80 backdrop-blur-xl border border-[#00f0ff]/30 rounded-b-xl md:rounded-b-2xl rounded-t-sm shadow-[0_5px_15px_rgba(0,240,255,0.2)] flex items-center justify-center transition-all duration-300 group-hover:border-[#00f0ff]/70 group-hover:bg-[#00f0ff]/10" title="Secure Audio">
              <div className="absolute top-1 w-1.5 md:w-2 h-[2px] bg-[#00f0ff]/40 rounded-full"></div>
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-[#00f0ff] relative z-10 transition-colors mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
            </button>
          </div>
          <div className="group flex flex-col items-center mr-2 md:mr-8 mt-0 cursor-pointer">
            <div className="w-[2px] h-1.5 md:h-4 bg-gradient-to-b from-transparent to-[#bc00dd]/50 group-hover:h-3 md:group-hover:h-6 transition-all duration-300"></div>
            <button className="relative w-8 h-10 md:w-10 md:h-12 bg-[#05070A]/80 backdrop-blur-xl border border-[#bc00dd]/30 rounded-b-xl md:rounded-b-2xl rounded-t-sm shadow-[0_5px_15px_rgba(188,0,221,0.2)] flex items-center justify-center transition-all duration-300 group-hover:border-[#bc00dd]/70 group-hover:bg-[#bc00dd]/10" title="Holographic Video">
              <div className="absolute top-1 w-1.5 md:w-2 h-[2px] bg-[#bc00dd]/40 rounded-full"></div>
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-[#bc00dd] relative z-10 transition-colors mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            </button>
          </div>
          <div className="h-[70px] md:h-24 flex items-center">
            <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white backdrop-blur-md group">
              <IoMdMore size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. PURE FLEX MESSAGES - flex-1 acts as the accordion spring! */}
      <div className="flex-1 relative w-full overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-6 no-scrollbar z-10">
        <div className="flex justify-center mb-2 mt-2">
          <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[9px] font-black text-gray-400 tracking-widest uppercase shadow-lg">Encryption Started • Today</span>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.senderId === myId;
          return (
            <div key={index} className={`flex flex-col w-full group transform transition-all duration-300 ${isMe ? 'items-end hover:-translate-x-1' : 'items-start hover:translate-x-1'}`}>
              <div className={`backdrop-blur-xl border px-5 py-3.5 rounded-3xl max-w-[85%] md:max-w-[65%] relative transition-all duration-300 cursor-pointer overflow-hidden ${
                isMe 
                ? 'bg-gradient-to-br from-[#801fd6]/90 to-[#c11f70]/90 border-white/20 rounded-tr-xl shadow-[0_8px_25px_rgba(193,31,112,0.3)] hover:shadow-[0_15px_40px_rgba(193,31,112,0.5)] hover:border-white/40' 
                : 'bg-[#121826]/80 border-white/5 rounded-tl-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,140,255,0.2)] hover:border-[#00f0ff]/30'
              }`}>
                
                {/* ─── HOLOGRAM IMAGE DISPLAY ─── */}
                {msg.image && (
                  <div className="relative mb-2 group/img">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#0057FF] to-[#00F0FF] rounded-2xl blur opacity-25 group-hover/img:opacity-50 transition duration-1000"></div>
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
                      <img src={msg.image} alt="Hologram" className="w-full max-h-[300px] object-cover opacity-90 brightness-110 group-hover/img:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]" />
                    </div>
                  </div>
                )}

                {msg.text && (
                  <p className={`text-[15px] leading-relaxed mb-1.5 font-medium tracking-wide ${isMe ? 'text-white drop-shadow-sm' : 'text-gray-100'}`}>
                    {msg.text}
                  </p>
                )}

                <div className={`flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] font-semibold tracking-wider ${isMe ? 'text-white/70 drop-shadow-sm' : 'text-gray-500'}`}>{msg.time}</span>
                  {isMe && (
                    <div className="flex -space-x-1">
                      <IoMdCheckmark className="text-white" size={14} />
                      <IoMdCheckmark className="text-white" size={14} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── NEW: IMAGE PREVIEW PILL ─── */}
      {selectedImage && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-[slideIn_0.3s_ease-out]">
           <div className="relative p-1 bg-[#151A25] border border-[#00F0FF] rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <img src={selectedImage} className="w-20 h-20 object-cover rounded-lg" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg text-white"><IoMdClose size={14}/></button>
           </div>
        </div>
      )}

      {/* 3. PURE FLEX FOOTER - shrink-0 ensures it NEVER squishes under the keyboard */}
      <div className="shrink-0 relative w-full bg-[#05070A]/98 backdrop-blur-2xl border-t border-white/10 pt-2 pb-3 md:pb-6 px-2 md:px-8 z-20 flex flex-col items-center gap-2">
        <form onSubmit={handleSend} className="relative w-full max-w-3xl flex items-center gap-1 md:gap-2 bg-[#1A1F2E]/90 backdrop-blur-2xl border border-white/20 p-1 md:p-1.5 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.8)] focus-within:border-[#bc00dd]/50 focus-within:shadow-[0_0_30px_rgba(188,0,221,0.2)] transition-all duration-300">
          
          <button type="button" onClick={() => fileInputRef.current.click()} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-transparent hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-[#00F0FF] transition-colors shrink-0 group">
            <IoMdAdd size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />

          <button type="button" className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-[#00f0ff] hover:text-white transition-all shrink-0 group border border-transparent hover:border-[#00f0ff]/30">
            <span className="text-[12px] md:text-[14px] group-hover:scale-110 transition-transform">🎥</span>
          </button>
          
          {/* 🚨 text-[16px] is crucial to prevent iOS/Android zoom on click */}
          <input 
            type="text" 
            placeholder="Message..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white text-[16px] md:text-[15px] placeholder-gray-400 font-medium px-1 md:px-2 min-w-0" 
          />
          
          <button type="button" className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-[#ffbb00] hover:text-white transition-all shrink-0 group border border-transparent hover:border-[#ffbb00]/30 mr-0.5 md:mr-1">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(255,187,0,0.5)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 8c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-7 0c.83 0 1.5.67 1.5 1.5S9.33 13 8.5 13 7 12.33 7 11.5 7.67 10 8.5 10zm3.5 6.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
            </svg>
          </button>
          <button type="button" className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-transparent hover:bg-[#ff3366]/10 flex items-center justify-center text-gray-400 hover:text-[#ff3366] transition-all shrink-0 group">
            <div className="absolute inset-0 rounded-full border border-[#ff3366]/0 group-hover:border-[#ff3366]/50 group-hover:animate-ping opacity-50"></div>
            <IoMdMic size={18} className="relative z-10 group-hover:scale-110 transition-transform md:text-[22px]" />
          </button>
          <button type="submit" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#801fd6] to-[#c11f70] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_15px_rgba(193,31,112,0.5)] shrink-0 mr-0.5 md:mr-1 group">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 translate-x-[1px] group-hover:translate-x-[3px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </form>
      </div>
    </div>
  );
}