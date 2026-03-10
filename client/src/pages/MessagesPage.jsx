import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
// NEW: Added IoMdAttach for the paperclip icon!
import { IoMdHappy, IoMdSend, IoMdSearch, IoMdCheckmark, IoMdDoneAll, IoMdMic, IoMdArrowDropdown, IoMdClose, IoMdAttach } from 'react-icons/io';
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

const indianLanguages = [
  { code: 'none', name: 'Off (No Translation)', native: 'Off' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' }
];

const MessagesPage = () => {
  const { userId } = useParams();
  
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  
  // NEW: State to hold the attached file
  const [selectedFile, setSelectedFile] = useState(null);
  
  const scrollRef = useRef();

  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]); 
  const [recentChats, setRecentChats] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [targetLang, setTargetLang] = useState(indianLanguages[0]); 
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const langMenuRef = useRef(null);

  const isOnline = true; 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support Voice Typing! Try using Google Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage(prev => prev + (prev ? " " : "") + transcript);
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Handle file selection from computer/phone
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;
    if (!userId) return;

    setIsSending(true);
    let finalMessage = newMessage;

    if (targetLang.code !== 'none' && newMessage.trim()) {
      try {
        // Defaults to translating from English (en) to the chosen target language
        const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(newMessage)}&langpair=en|${targetLang.code}`;
        const res = await axios.get(translateUrl);
        if (res.data && res.data.responseData && res.data.responseData.translatedText) {
          finalMessage = res.data.responseData.translatedText;
        }
      } catch (err) {
        console.error("Translation failed, sending original text.", err);
      }
    }

    try {
      /* NOTE FOR THE FUTURE: 
        Right now we are sending the text message properly. 
        When your backend is ready to handle files (using Cloudinary or Multer),
        you will need to change this to a FormData object to push 'selectedFile' to the database!
      */
      const res = await axios.post(getApiUrl('/api/messages'), {
        receiverId: userId,
        text: finalMessage,
        replyTo: replyTo ? replyTo._id : null
      }, getAuthConfig());
      
      setMessages([...(messages || []), res.data.data]);
      setNewMessage("");
      setReplyTo(null);
      setSelectedFile(null); // Clear the attached file after sending
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const getProfilePhoto = (user) => {
    if (!user) return null;
    return user.profilePhoto || user.profilePic || user.avatar || null;
  };

  const getInitial = (user) => {
    if (!user) return 'U';
    if (user.fullName) return user.fullName.charAt(0).toUpperCase();
    if (user.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  const filteredLanguages = indianLanguages.filter(lang => 
    lang.name.toLowerCase().includes(langSearch.toLowerCase()) || 
    lang.native.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
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
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
            <div className="p-4 bg-white/90 backdrop-blur-md border-b flex flex-wrap items-center justify-between shadow-sm z-30 gap-y-2">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full">
                  <div 
                    className={`absolute inset-0 rounded-full ${isOnline ? 'animate-spin' : ''}`}
                    style={{ background: isOnline ? 'conic-gradient(from 0deg, transparent 60%, #22c55e 100%)' : 'none', border: isOnline ? 'none' : '2px solid #e5e7eb' }}
                  ></div>
                  <div className="absolute inset-[2.5px] bg-white rounded-full overflow-hidden flex items-center justify-center text-white font-bold bg-gradient-to-tr from-blue-500 to-purple-500 z-10 shadow-inner">
                    {getProfilePhoto(chatUser) ? (
                      <img src={getProfilePhoto(chatUser)} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getInitial(chatUser)
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <h2 className="font-bold text-lg text-gray-800 leading-tight flex items-center gap-2">
                    {chatUser?.fullName || chatUser?.username || "Loading..."}
                    <span 
                      className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_6px_#22c55e]' : 'bg-red-500 shadow-[0_0_6px_#ef4444]'}`} 
                      title={isOnline ? "Online" : "Offline"}
                    ></span>
                  </h2>
                </div>
              </div>
              
              <div className="relative" ref={langMenuRef}>
                <button 
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-2 shadow-sm hover:bg-blue-100 transition-colors"
                >
                  <span className="text-xs font-bold whitespace-nowrap">🌐 Translate to:</span>
                  <span className="text-sm font-bold truncate max-w-[100px]">{targetLang.name}</span>
                  <IoMdArrowDropdown className="text-lg" />
                </button>

                {isLangMenuOpen && (
                  <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-fade-in-down z-50">
                    <div className="p-2 border-b bg-gray-50 relative">
                      <IoMdSearch className="absolute left-4 top-4 text-gray-400 text-lg" />
                      <input 
                        type="text" 
                        placeholder="Search language..." 
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                      />
                      {langSearch && (
                        <IoMdClose 
                          className="absolute right-4 top-4 text-gray-400 cursor-pointer hover:text-gray-600" 
                          onClick={() => setLangSearch("")}
                        />
                      )}
                    </div>

                    <ul className="max-h-60 overflow-y-auto">
                      {filteredLanguages.length === 0 ? (
                        <li className="p-4 text-center text-sm text-gray-500">No languages found.</li>
                      ) : (
                        filteredLanguages.map((lang) => (
                          <li 
                            key={lang.code}
                            onClick={() => {
                              setTargetLang(lang);
                              setIsLangMenuOpen(false);
                              setLangSearch("");
                            }}
                            className={`px-4 py-2.5 flex justify-between items-center cursor-pointer text-sm hover:bg-blue-50 border-b border-gray-50 ${targetLang.code === lang.code ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700'}`}
                          >
                            <span>{lang.name}</span>
                            <span className="text-gray-400 text-xs font-medium">{lang.native}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>

            </div>

            <div className="flex-1 relative bg-gray-50 flex flex-col overflow-hidden">
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
                {getProfilePhoto(chatUser) ? (
                  <div 
                    className="w-full h-full opacity-[0.15]" 
                    style={{ backgroundImage: `url(${getProfilePhoto(chatUser)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  />
                ) : (
                  <div className="text-[20rem] md:text-[30rem] font-black text-gray-300 opacity-40">
                    {getInitial(chatUser)}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
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
                        <div className={`relative max-w-[70%] p-3 rounded-2xl shadow-sm group ${isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'}`}>
                          {msg.replyTo && (
                            <div className={`p-2 mb-2 rounded text-xs italic border-l-4 ${isMe ? 'bg-black/10 border-blue-300' : 'bg-gray-100 border-gray-400'}`}>
                              Replying to: {msg.replyTo.text?.substring(0, 30)}...
                            </div>
                          )}
                          <p className="text-sm md:text-base">{msg.text}</p>
                          
                          <div className={`flex items-center justify-between mt-2 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                             
                             <button onClick={() => setReplyTo(msg)} className={`text-[11px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${isMe ? 'hover:text-white' : 'hover:text-blue-500'}`}>
                               <BsReplyFill /> Reply
                             </button>
                             
                             <div className="flex items-center gap-1.5 ml-4">
                               <span className="text-[10px] font-medium">{timeString}</span>
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
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={scrollRef} />
              </div>
            </div>

            <div className="p-4 bg-white border-t z-20 relative">
              {replyTo && (
                <div className="flex justify-between items-center bg-gray-100 p-2 mb-2 rounded-lg border-l-4 border-blue-500">
                  <span className="text-sm text-gray-600 truncate">Replying to: <b>{replyTo.text}</b></span>
                  <button onClick={() => setReplyTo(null)} className="text-red-500 text-xs font-bold px-2">X</button>
                </div>
              )}

              {/* --- NEW: Floating File Preview Box --- */}
              {selectedFile && (
                <div className="absolute -top-14 left-4 bg-white border border-gray-200 shadow-xl px-4 py-2 rounded-xl flex items-center gap-3 z-50 animate-fade-in-up">
                  <span className="text-2xl">📄</span>
                  <div className="flex flex-col max-w-[150px]">
                    <span className="text-xs font-bold text-gray-800 truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700 font-bold ml-2">✕</button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-2xl text-gray-500 hover:text-yellow-500"><IoMdHappy /></button>
                {showEmojiPicker && (
                  <div className="absolute bottom-14 left-0 z-50 shadow-xl rounded-lg">
                    <EmojiPicker onEmojiClick={(emojiData) => { setNewMessage(prev => prev + emojiData.emoji); setShowEmojiPicker(false); }} />
                  </div>
                )}
                
                <div className="flex flex-1 items-center bg-gray-100 rounded-full pl-2 pr-2 shadow-inner border border-transparent focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  
                  {/* --- NEW: Paperclip File Attachment Button --- */}
                  <label htmlFor="file-upload" className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer transition-colors border-r border-gray-300 mr-2 pr-3" title="Attach a file">
                    <IoMdAttach className="text-2xl" />
                  </label>
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept="image/*,video/*,.pdf,.doc,.docx" 
                  />

                  {/* Clean Text Input */}
                  <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder={isListening ? "Listening... Speak now!" : "Type your message..."} 
                    className="flex-1 p-2.5 bg-transparent text-gray-900 font-medium placeholder-gray-500 outline-none w-full" 
                  />

                  <button 
                    type="button" 
                    onClick={startListening} 
                    className={`p-2 rounded-full text-xl transition-colors ${isListening ? 'text-red-500 animate-pulse bg-red-100' : 'text-gray-400 hover:text-blue-500 hover:bg-white'}`}
                    title="Voice Typing"
                  >
                    <IoMdMic />
                  </button>
                </div>

                <button type="submit" disabled={isSending} className="text-blue-600 text-3xl hover:text-blue-700 disabled:opacity-50 transition-opacity">
                  {isSending ? (
                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <IoMdSend />
                  )}
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