import React, { useState, useEffect, useRef } from 'react';
import { IoMdArrowBack, IoMdSend, IoMdMore, IoMdImage, IoMdMic, IoMdClose, IoMdCamera, IoMdAdd, IoMdCheckmark } from 'react-icons/io';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const API_URL = RAW_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
const socket = io(API_URL);

// 🚨 This is now a perfectly sized child component!
export default function ChatRoom({ chatUser, onBack }) {
  const { user: currentUser } = useAuth(); 
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null); 

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); 

  const myId = currentUser?._id || currentUser?.id;
  const friendId = chatUser?._id || chatUser?.id;
  
  const room = myId && friendId ? [myId, friendId].sort().join('_') : null;

  // Socket & History Fetching
  useEffect(() => {
    if (!myId || !friendId || !room) return;
    
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
  }, [room, myId, friendId]);

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

  if (!chatUser) return null;

  return (
    <div className="flex flex-col h-full w-full bg-transparent z-10 relative overflow-hidden">
      
      {/* 1. FLEX-NONE HEADER (Will never squish) */}
      <div className="shrink-0 flex-none relative w-full h-[70px] md:h-24 px-3 md:px-8 bg-[#05070A]/98 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between z-20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3 md:gap-4">
          {/* BACK BUTTON for mobile view */}
          <button onClick={onBack} className="md:hidden w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 backdrop-blur-md">
            <IoMdArrowBack size={18} />
          </button>
          
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full p-[1.5px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
             <div className="w-full h-full rounded-full bg-[#1E2532] border-2 border-[#0B0F19] overflow-hidden flex items-center justify-center text-white font-bold">
               {chatUser.profilePhoto ? <img src={chatUser.profilePhoto} className="w-full h-full object-cover" alt="avatar" /> : (chatUser.fullName || chatUser.username || 'U')[0].toUpperCase()}
             </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-white font-black text-[14px] md:text-[16px]">{chatUser.fullName || `@${chatUser.username}`}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isTyping ? 'bg-[#00ff9d] animate-pulse shadow-[0_0_8px_#00ff9d]' : 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]'}`} />
              <span className={`text-[9px] md:text-[10px] font-bold tracking-widest uppercase flex items-center ${isTyping ? 'text-[#00ff9d]' : 'text-[#00F0FF]'}`}>
                {isTyping ? 'Typing...' : 'Secure Connection'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center h-full absolute top-0 right-2 md:right-8">
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white backdrop-blur-md">
            <IoMdMore size={18} />
          </button>
        </div>
      </div>

      {/* 2. FLEX-1 MESSAGES (The only part that compresses and scrolls) */}
      <div className="flex-1 min-h-0 relative w-full overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-6 no-scrollbar z-10">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === myId;
          return (
            <div key={index} className={`flex w-full group transform transition-all duration-300 ${isMe ? 'justify-end hover:-translate-x-1' : 'justify-start hover:translate-x-1'}`}>
              <div className={`max-w-[85%] md:max-w-[65%] flex flex-col relative ${isMe ? 'items-end' : 'items-start'}`}>
                
                {msg.image && (
                  <div className="relative mb-2 group/img">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#0057FF] to-[#00F0FF] rounded-2xl blur opacity-25 group-hover/img:opacity-50 transition duration-1000"></div>
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
                      <img src={msg.image} alt="Upload" className="w-full max-h-[300px] object-cover opacity-90 brightness-110 group-hover/img:scale-105 transition-transform duration-700" />
                    </div>
                  </div>
                )}

                {msg.text && (
                  <div className={`px-5 py-3.5 text-[15px] font-medium leading-relaxed tracking-wide rounded-3xl shadow-lg border backdrop-blur-xl ${isMe ? 'bg-gradient-to-br from-[#801fd6]/90 to-[#c11f70]/90 border-white/20 rounded-tr-xl text-white' : 'bg-[#121826]/80 border-white/5 rounded-tl-xl text-gray-100'}`}>
                    {msg.text}
                  </div>
                )}
                
                <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[10px] text-gray-500 font-semibold tracking-wider">{msg.time}</span>
                  {isMe && (
                    <div className="flex -space-x-1">
                      <IoMdCheckmark className="text-gray-500" size={14} />
                      <IoMdCheckmark className="text-gray-500" size={14} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* IMAGE PREVIEW */}
      {selectedImage && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-5">
           <div className="relative p-1 bg-[#151A25] border border-[#00F0FF] rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <img src={selectedImage} className="w-20 h-20 object-cover rounded-lg" alt="Preview"/>
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg text-white"><IoMdClose size={14}/></button>
           </div>
        </div>
      )}

      {/* 3. FLEX-NONE FOOTER (Sits safely above the keyboard) */}
      <div className="shrink-0 flex-none relative w-full bg-[#05070A]/98 border-t border-white/10 pt-2 pb-2 md:pb-6 px-2 md:px-8 z-20">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto bg-[#1A1F2E]/90 backdrop-blur-2xl border border-white/20 p-1 md:p-1.5 rounded-full flex items-center shadow-lg transition-all duration-300">
          
          {/* Animated Left Buttons (Camera & Gallery) */}
          <div className={`flex items-center transition-all duration-300 ease-in-out origin-left overflow-hidden ${message.length > 0 ? 'w-0 opacity-0 scale-50' : 'w-[80px] md:w-[90px] opacity-100 scale-100 gap-1 pl-1'}`}>
            
            {/* Gallery Button */}
            <button type="button" onClick={() => fileInputRef.current.click()} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0">
              <IoMdAdd size={22} />
            </button>
            <input type="file" ref={fileInputRef} hidden accept="image/*,video/*" onChange={handleImageSelect} />

            {/* Direct Camera Button */}
            <button type="button" onClick={() => cameraInputRef.current.click()} className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#0057FF]/10 hover:bg-[#0057FF]/20 flex items-center justify-center text-[#00F0FF] transition-colors shrink-0">
              <IoMdCamera size={20} />
            </button>
            <input type="file" ref={cameraInputRef} hidden accept="image/*,video/*" capture="environment" onChange={handleImageSelect} />
          </div>

          <input 
            type="text" 
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              socket.emit('typing', room); 
            }}
            onBlur={() => socket.emit('stop_typing', room)}
            placeholder="Neural transmission..."
            className={`flex-1 bg-transparent text-white text-[16px] outline-none placeholder-gray-500 font-medium min-w-0 transition-all duration-300 ${message.length > 0 ? 'pl-4' : 'pl-2'}`}
          />

          <button type="submit" className="w-10 h-10 rounded-full bg-gradient-to-r from-[#801fd6] to-[#c11f70] flex items-center justify-center text-white active:scale-95 transition-transform shrink-0 shadow-[0_0_15px_rgba(193,31,112,0.5)] ml-1">
            <IoMdSend size={18} className="translate-x-[1px]" />
          </button>
        </form>
      </div>
    </div>
  );
}