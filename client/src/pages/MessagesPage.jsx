import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { IoMdHappy, IoMdSend } from 'react-icons/io';
import { BsReplyFill } from 'react-icons/bs';

const MessagesPage = () => {
  const { userId } = useParams();
  
  // States
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [inboxUsers, setInboxUsers] = useState([]); // Controls the Sidebar
  const scrollRef = useRef();

  // 1. Fetch Users for the Sidebar Inbox
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        // Fetches all users so you have someone to chat with!
        const res = await axios.get('/api/users'); 
        // Handles different backend response formats automatically
        const usersList = Array.isArray(res.data) ? res.data : res.data.data;
        if (usersList) setInboxUsers(usersList);
      } catch (err) {
        console.error("Error fetching inbox users:", err);
      }
    };
    fetchInbox();
  }, []);

  // 2. Fetch Chat when a user is clicked
  useEffect(() => {
    if (!userId) {
      setMessages(null); // No user selected yet
      return;
    }
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages/${userId}`);
        setMessages(res.data.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [userId]);

  // 3. Handle Sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    try {
      const res = await axios.post('/api/messages', {
        receiverId: userId,
        text: newMessage,
        replyTo: replyTo ? replyTo._id : null
      });
      setMessages([...(messages || []), res.data.data]);
      setNewMessage("");
      setReplyTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* ================= LEFT SIDE: INBOX SIDEBAR ================= */}
      <div className="w-80 bg-white border-r flex flex-col hidden md:flex">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-xl text-gray-800">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {inboxUsers.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">Loading contacts...</div>
          ) : (
            inboxUsers.map((user) => (
              <Link 
                key={user._id} 
                to={`/messages/${user._id}`}
                className={`flex items-center gap-3 p-4 border-b cursor-pointer transition-colors ${
                  userId === user._id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-100 border-l-4 border-transparent'
                }`}
              >
                {/* Profile Avatar */}
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                
                {/* User Info */}
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-gray-800 truncate">{user.username || 'User'}</h3>
                  <p className="text-sm text-gray-500 truncate">Tap to open chat</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ================= RIGHT SIDE: CHAT AREA ================= */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* State 1: No User Selected */}
        {!userId ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold text-gray-600">Your Inbox</h2>
            <p className="mt-2 text-sm">Select a user from the sidebar to start a conversation.</p>
          </div>
        ) : 
        
        /* State 2: Loading Messages */
        !messages ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="animate-pulse flex flex-col items-center">
               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p>Loading conversation...</p>
            </div>
          </div>
        ) : 
        
        /* State 3: The Actual Chat Window */
        (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b flex items-center shadow-sm z-10">
              <h2 className="font-bold text-lg text-gray-800">Conversation</h2>
            </div>

            {/* Messages Bubbles Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p className="text-lg font-medium bg-white px-4 py-2 rounded-full shadow-sm">No messages yet. Say Hi! 👋</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className={`flex ${msg.sender === userId ? 'justify-start' : 'justify-end'}`}>
                    <div className={`relative max-w-[70%] p-3 rounded-2xl shadow-sm ${
                      msg.sender === userId ? 'bg-white text-gray-800 border' : 'bg-blue-600 text-white'
                    }`}>
                      
                      {msg.replyTo && (
                        <div className="bg-black/10 p-2 mb-2 rounded text-xs italic border-l-4 border-blue-300">
                          Replying to: {msg.replyTo.text.substring(0, 30)}...
                        </div>
                      )}

                      <p className="text-sm md:text-base">{msg.text}</p>

                      <div className="flex gap-2 mt-1 opacity-0 hover:opacity-100 transition-opacity">
                        <button onClick={() => setReplyTo(msg)} className="text-[10px] md:text-xs flex items-center gap-1 opacity-80 hover:opacity-100">
                          <BsReplyFill /> Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white border-t">
              {replyTo && (
                <div className="flex justify-between items-center bg-gray-100 p-2 mb-2 rounded-lg border-l-4 border-blue-500">
                  <span className="text-sm text-gray-600 truncate">Replying to: <b>{replyTo.text}</b></span>
                  <button onClick={() => setReplyTo(null)} className="text-red-500 text-xs font-bold px-2">X</button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-2xl text-gray-500 hover:text-yellow-500 transition-colors">
                  <IoMdHappy />
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-14 left-0 z-50 shadow-xl rounded-lg">
                    <EmojiPicker onEmojiClick={(emojiData) => {
                      setNewMessage(prev => prev + emojiData.emoji);
                      setShowEmojiPicker(false);
                    }} />
                  </div>
                )}

                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button type="submit" className="text-blue-600 text-3xl hover:text-blue-700 transition-colors">
                  <IoMdSend />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;