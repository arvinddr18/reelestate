import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { IoMdHappy, IoMdSend, IoMdSearch, IoMdCheckmark, IoMdDoneAll } from 'react-icons/io';
import { BsReplyFill } from 'react-icons/bs';

const getApiUrl = (endpoint) => {
  const base = import.meta.env.VITE_API_URL || '';
  if (base.endsWith('/api') && endpoint.startsWith('/api')) {
    return base.replace('/api', '') + endpoint;
  }
  return base + endpoint;
};

const getAuthConfig = () => {
  let token = localStorage.getItem('reelestate_token');
  if (!token) token = localStorage.getItem('token');
  if (!token && localStorage.getItem('user')) {
    try { token = JSON.parse(localStorage.getItem('user')).token; } catch (e) {}
  }
  const config = { withCredentials: true };
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers = { Authorization: `Bearer ${token}` };
  }
  return config;
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date)) return '';
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
};

const MessagesPage = () => {
  const { userId } = useParams();
  
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const scrollRef = useRef();

  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]); 
  const [recentChats, setRecentChats] = useState([]);
  
  // NEW: State to hold the specific user we are chatting with!
  const [chatUser, setChatUser] = useState(null);

  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem('geo_recent_chats')) || [];
    setRecentChats(savedChats);

    const fetchAllContacts = async () => {
      try {
        const res = await axios.get(getApiUrl('/api/users'), getAuthConfig());
        setAllUsers(res.data.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchAllContacts();
  }, []);

  const cleanSearch = searchQuery.replace('@', '').trim().toLowerCase();
  const searchResults = allUsers.filter(user => 
    (user.username && user.username.toLowerCase().includes(cleanSearch)) ||
    (user.fullName && user.fullName.toLowerCase().includes(cleanSearch))
  );

  useEffect(() => {
    if (!userId) {
      setMessages(null);
      setChatUser(null);
      return;
    }
    const fetchChatData = async () => {
      try {
        const msgRes = await axios.get(getApiUrl(`/api/messages/${userId}`), getAuthConfig());
        setMessages(msgRes.data.data || []);

        const userRes = await axios.get(getApiUrl(`/api/users/${userId}`), getAuthConfig());
        const fetchedUser = userRes.data.data?.user || userRes.data.data;
        
        // Save the chat user so we can use their photo for the background!
        setChatUser(fetchedUser);

        if (fetchedUser && fetchedUser._id) {
          setRecentChats(prev => {
            const filtered = prev.filter(u => u._id !== fetchedUser._id);
            const newRecent = [fetchedUser, ...filtered];
            localStorage.setItem('geo_recent_chats', JSON.stringify(newRecent));
            return newRecent;
          });
        }
      } catch (err) {
        console.error("Error fetching chat:", err);
        setMessages([]); 
      }
    };
    fetchChatData();
  }, [userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    try {
      const res = await axios.post(getApiUrl('/api/messages'), {
        receiverId: userId,
        text: newMessage,
        replyTo: replyTo ? replyTo._id : null
      }, getAuthConfig());
      
      setMessages([...(messages || []), res.data.data]);
      setNewMessage("");
      setReplyTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to safely get the profile photo URL (checking common database field names)
  const getProfilePhoto = (user) => {
    if (!user) return null;
    return user.profilePhoto || user.profilePic || user.avatar || null;
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* LEFT SIDEBAR */}
      <div className="w-80 bg-white border-r flex flex-col hidden md:flex">
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
        
        <div className="flex-1 overflow-y-auto">
          {searchQuery.trim() !== "" ? (
            searchResults.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No matching users found.</div>
            ) : (
              searchResults.map((user) => (
                <Link key={user._id} to={`/messages/${user._id}`} onClick={() => setSearchQuery('')} className="flex items-center gap-3 p-4 border-b hover:bg-gray-50">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</div>
                  <div className="flex-1 overflow-hidden"><h3 className="font-semibold text-gray-800 truncate">{user.username}</h3><p className="text-xs text-blue-500">Tap to chat</p></div>
                </Link>
              ))
            )
          ) : recentChats.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Recent Conversations</div>
              {recentChats.map((user) => (
                <Link key={user._id} to={`/messages/${user._id}`} className={`flex items-center gap-3 p-4 border-b ${userId === user._id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-100 border-l-4 border-transparent'}`}>
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</div>
                  <div className="flex-1 overflow-hidden"><h3 className="font-semibold text-gray-800 truncate">{user.username}</h3><p className="text-sm text-gray-500 truncate">Open chat</p></div>
                </Link>
              ))}
            </>
          ) : (
            <>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Suggested Contacts</div>
              {allUsers.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">Loading your contacts...</div>
              ) : (
                allUsers.map((user) => (
                   <Link key={user._id} to={`/messages/${user._id}`} className="flex items-center gap-3 p-4 border-b hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</div>
                    <div className="flex-1 overflow-hidden"><h3 className="font-semibold text-gray-800 truncate">{user.username}</h3><p className="text-xs text-gray-400">Start a new chat</p></div>
                  </Link>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR - CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white">
        {!userId ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold text-gray-600">Your Messages</h2>
            <p className="mt-2 text-sm">Select a user from the sidebar or search to start chatting.</p>
          </div>
        ) : !messages ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="animate-pulse flex flex-col items-center">
               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p>Loading conversation...</p>
            </div>
          </div>
        ) : (
          <>
            {/* UPGRADED HEADER WITH USER PROFILE INFO */}
            <div className="p-4 bg-white/90 backdrop-blur-md border-b flex items-center shadow-sm z-20 gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                {getProfilePhoto(chatUser) ? (
                  <img src={getProfilePhoto(chatUser)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  chatUser?.username ? chatUser.username.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-800 leading-tight">
                  {chatUser?.fullName || chatUser?.username || "Loading..."}
                </h2>
                <p className="text-xs text-green-500 font-medium">Online</p>
              </div>
            </div>

            {/* MAIN CHAT WINDOW WITH BACKGROUND WATERMARK */}
            <div className="flex-1 overflow-y-auto relative bg-gray-50">
              
              {/* THE BACKGROUND IMAGE (Faded to 10% opacity so text is readable) */}
              {getProfilePhoto(chatUser) && (
                <div 
                  className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                  style={{ 
                    backgroundImage: `url(${getProfilePhoto(chatUser)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              )}

              {/* MESSAGES LIST (z-10 keeps it above the background image) */}
              <div className="p-4 space-y-4 relative z-10 flex flex-col min-h-full">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
                    <p className="text-lg font-medium bg-white px-4 py-2 rounded-full shadow-sm">No messages yet. Say Hi! 👋</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderStr = String(msg.sender._id || msg.sender);
                    const isMe = senderStr !== String(userId);
                    const timeString = formatTime(msg.createdAt || msg.timestamp);
                    const isSeen = msg.isRead || msg.read || false; 
                    
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-[70%] p-3 rounded-2xl shadow-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'}`}>
                          {msg.replyTo && (
                            <div className={`p-2 mb-2 rounded text-xs italic border-l-4 ${isMe ? 'bg-black/10 border-blue-300' : 'bg-gray-100 border-gray-400'}`}>
                              Replying to: {msg.replyTo.text?.substring(0, 30)}...
                            </div>
                          )}
                          <p className="text-sm md:text-base">{msg.text}</p>
                          
                          <div className={`flex items-center justify-end mt-2 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                             <span className="text-[10px] mr-2 font-medium">{timeString}</span>
                             {isMe && (
                               <div className="flex items-center">
                                 {isSeen ? (
                                   <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider text-green-600 shadow-[0_0_10px_rgba(34,197,94,0.6)] border border-green-400 transition-all duration-300">
                                     <IoMdDoneAll className="text-[12px]" /> READ
                                   </span>
                                 ) : (
                                   <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider text-red-600 shadow-[0_0_10px_rgba(239,68,68,0.6)] border border-red-400 transition-all duration-300">
                                     <IoMdCheckmark className="text-[12px]" /> SENT
                                   </span>
                                 )}
                               </div>
                             )}
                          </div>

                          <div className="flex gap-2 mt-1 opacity-0 hover:opacity-100 transition-opacity absolute top-2 right-[-50px]">
                            <button onClick={() => setReplyTo(msg)} className="text-xs flex items-center gap-1 opacity-80 hover:opacity-100 text-gray-500 bg-white shadow-md rounded-full px-2 py-1">
                              <BsReplyFill /> Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={scrollRef} />
              </div>
            </div>

            <div className="p-4 bg-white border-t">
              {replyTo && (
                <div className="flex justify-between items-center bg-gray-100 p-2 mb-2 rounded-lg border-l-4 border-blue-500">
                  <span className="text-sm text-gray-600 truncate">Replying to: <b>{replyTo.text}</b></span>
                  <button onClick={() => setReplyTo(null)} className="text-red-500 text-xs font-bold px-2">X</button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-2xl text-gray-500 hover:text-yellow-500"><IoMdHappy /></button>
                {showEmojiPicker && (
                  <div className="absolute bottom-14 left-0 z-50 shadow-xl rounded-lg">
                    <EmojiPicker onEmojiClick={(emojiData) => { setNewMessage(prev => prev + emojiData.emoji); setShowEmojiPicker(false); }} />
                  </div>
                )}
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="flex-1 p-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                <button type="submit" className="text-blue-600 text-3xl hover:text-blue-700"><IoMdSend /></button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;