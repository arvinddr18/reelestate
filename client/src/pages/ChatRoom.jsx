import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdArrowBack, IoMdSend, IoMdMore, IoMdImage, IoMdMic, IoMdClose, IoMdPulse } from 'react-icons/io';
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

  const myId = currentUser?._id || currentUser?.id;
  const room = myId && userId ? [myId, userId].sort().join('_') : null;

  // Fetch Profile
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

  // Socket & History
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

  // DEFINITIVE mobile keyboard fix
  useEffect(() => {
    const el = document.getElementById('chat-container');
    const lock = () => { if (el) el.style.height = window.innerHeight + 'px'; };
    lock();
    window.addEventListener('resize', lock);
    return () => window.removeEventListener('resize', lock);
  }, []);

  // Fix mobile keyboard pushing header
  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

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
    /* 🚨 PURE CSS LAYOUT: fixed inset-0 + flex-col + 100dvh ensures browser handles keyboard perfectly */
   <div id="chat-container" className="fixed top-0 left-0 right-0 flex flex-col w-full bg-[#0B0F19] text-white font-sans overflow-hidden z-[99999]">
      
      {/* BACKGROUND AMBIENCE */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#0057FF] opacity-10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* 1. HEADER: flex-none makes it a rigid block that cannot move or shrink */}
      <header style={{position: 'sticky', top: 0}} className="flex-none relative z-20 w-full bg-[#0B0F19]/95 backdrop-blur-2xl border-b border-[#1E2532] px-4 py-3 flex items-center justify-between shadow-md">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#151A25] border border-[#1E2532] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <IoMdArrowBack size={20} />
            </button>
            <div className="flex flex-col">
                <span className="text-sm font-black">{chatUser?.fullName || '...'}</span>
                <span className="text-[9px] font-black text-[#00F0FF] uppercase tracking-widest flex items-center gap-1">
                  {isTyping ? 'Syncing...' : 'Active'}
                </span>
            </div>
         </div>
      </header>

      {/* 2. MESSAGES: flex-1 overflow-y-auto is the ONLY part that scrolls or resizes */}
      <main className="flex-1 overflow-y-auto relative w-full px-4 pt-6 pb-2 flex flex-col gap-6 z-10 no-scrollbar">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === myId;
          return (
            <div key={index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                
                {msg.image && (
                  <div className="relative mb-2 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#0057FF] to-[#00F0FF] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
                      <img src={msg.image} alt="Hologram" className="w-full max-h-[300px] object-cover opacity-90 brightness-110" />
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]" />
                    </div>
                  </div>
                )}

                {msg.text && (
                  <div className={`px-5 py-3 text-[15px] font-medium rounded-3xl ${isMe ? 'bg-[#0057FF] rounded-tr-none' : 'bg-[#151A25] border border-[#1E2532] rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                )}
                <span className="text-[10px] text-gray-500 mt-1.5 uppercase tracking-widest font-bold">{msg.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* IMAGE PREVIEW PILL */}
      {selectedImage && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-5">
           <div className="relative p-1 bg-[#151A25] border border-[#00F0FF] rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <img src={selectedImage} className="w-20 h-20 object-cover rounded-lg" alt="Preview"/>
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg text-white"><IoMdClose size={14}/></button>
           </div>
        </div>
      )}

      {/* 3. INPUT: flex-none ensures it stays a rigid block right above the keyboard */}
      <footer style={{position: 'sticky', bottom: 0}} className="flex-none relative z-20 w-full bg-[#0B0F19] border-t border-[#1E2532] px-4 py-3 pb-safe">
       <form onSubmit={handleSend} className="max-w-2xl mx-auto bg-[#151A25] border border-[#1E2532] p-1.5 rounded-full flex items-center shadow-lg transition-all duration-300">
          
          {/* Image Upload Button (Hides when typing) */}
          <div className={`transition-all duration-300 ease-in-out origin-left overflow-hidden ${message.length > 0 ? 'w-0 opacity-0 scale-50' : 'w-10 opacity-100 scale-100'}`}>
            <button type="button" onClick={() => fileInputRef.current.click()} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#00F0FF] transition-colors shrink-0">
              <IoMdImage size={22} />
            </button>
          </div>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />

          {/* Text Input */}
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Neural transmission..."
            className={`flex-1 bg-transparent text-[16px] outline-none placeholder-gray-500 font-medium min-w-0 transition-all duration-300 ${message.length > 0 ? 'pl-4' : 'pl-1'}`}
          />

          {/* Send Button (Always Visible) */}
          <button type="submit" className="w-10 h-10 rounded-full bg-[#0057FF] flex items-center justify-center text-white active:scale-95 transition-transform shrink-0 shadow-[0_0_15px_rgba(0,87,255,0.4)] ml-2">
            <IoMdSend size={18} className="translate-x-[1px]" />
          </button>
        </form>
      </footer>
    </div>
  );
}