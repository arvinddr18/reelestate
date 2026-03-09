import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { IoMdHappy, IoMdSend, IoMdSearch } from 'react-icons/io';
import { BsReplyFill } from 'react-icons/bs';

const MessagesPage = () => {
  const { userId } = useParams();
  
  // Chat States
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const scrollRef = useRef();

  // --- NEW: Search & Recent Inbox States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentChats, setRecentChats] = useState([]);

  // 1. Load Recent Chats from local memory
  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem('geo_recent_chats')) || [];
    setRecentChats(savedChats);
  }, []);

  // 2. Handle Search Bar Logic
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await axios.get(`/api/users/search?q=${searchQuery}`);
        setSearchResults(res.data.data || []);
      } catch (err) {
        console.error("Search error:", err);
      }
    };
    
    // Add a tiny delay so it doesn't search every single keystroke
    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. Fetch Chat & Add to Recents
  useEffect(() => {
    if (!userId) {
      setMessages(null);
      return;
    }
    const fetchChatData = async () => {
      try {
        // Fetch the messages
        const msgRes = await axios.get(`/api/messages/${userId}`);
        setMessages(msgRes.data.data);

        // Fetch the user's info so we can save them to the sidebar!
        const userRes = await axios.get(`/api/users/${userId}`);
        const chatUser = userRes.data.data?.user || userRes.data.data;

        if (chatUser && chatUser._id) {
          setRecentChats(prev => {
            // Remove them if they are already in the list, then put them at the TOP (Serial wise)
            const filtered = prev.filter(u => u._id !== chatUser._id);
            const newRecent = [chatUser, ...filtered];
            localStorage.setItem('geo_recent_chats', JSON.stringify(newRecent));
            return newRecent;
          });
        }
      } catch (err) {
        console.error("Error fetching chat:", err);
      }
    };
    fetchChatData();
  }, [userId]);

  // 4. Handle Sending Messages
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
      
      {/* ================= LEFT SIDE: INBOX & SEARCH ================= */}
      <div className="w-80 bg-white border-r flex flex-col hidden md:flex">
        
        {/* Search Bar Header */}
        <div className="p-4 border-b bg-white">
          <h2 className="font-bold text-xl text-gray-800 mb-4">Messages</h2>
          <div className="relative">
            <IoMdSearch className="absolute left-3 top-3 text-gray-400 text-xl" />
            <input 
              type="text" 
              placeholder="Search accounts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        
        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery.trim() !== "" ? (
            // --- SHOWING SEARCH RESULTS ---
            searchResults.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No users found.</div>
            ) : (
              searchResults.map((user) => (
                <Link 
                  key={user._id} 
                  to={`/messages/${user._id}`}
                  onClick={() => setSearchQuery('')} // Clear search when clicked
                  className="flex items-center gap-3 p-4 border-b hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold text-gray-800 truncate">{user.username}</h3>
                    <p className="text-xs text-blue-500 font-medium">Tap to chat</p>
                  </div>
                </Link>
              ))
            )
          ) : (
            // --- SHOWING RECENT CHATS (SERIAL WISE) ---
            recentChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 h-full">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm">Search for an account above to start a conversation.</p>
              </div>
            ) : (
              recentChats.map((user) => (
                <Link 
                  key={user._id} 
                  to={`/messages/${user._id}`}
                  className={`flex items-center gap-3 p-4 border-b cursor-pointer transition-colors ${
                    userId === user._id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-100 border-l-4 border-transparent'
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-tr from-gray-700 to-black rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold text-gray-800 truncate">{user.username}</h3>
                    <p className="text-sm text-gray-500 truncate">Open chat</p>
                  </div>
                </Link>
              ))
            )
          )}
        </div>
      </div>

      {/* ================= RIGHT SIDE: CHAT AREA ================= */}
      <div className="flex-1 flex flex-col bg-white">
        
        {!userId ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold text-gray-600">Your Messages</h2>
            <p className="mt-2 text-sm">Select a user from the sidebar or search to start chatting.</p>
          </div>
        ) : !messages ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Loading conversation...</p>
          </div>
        ) : (
          <>
            <div className="p-4 bg-white border-b flex items-center shadow-sm z-10">
              <h2 className="font-bold text-lg text-gray-800">Conversation</h2>
            </div>

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