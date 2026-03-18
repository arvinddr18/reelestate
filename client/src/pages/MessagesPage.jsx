import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { IoMdHappy, IoMdSend, IoMdSearch, IoMdCheckmark, IoMdDoneAll, IoMdMic, IoMdArrowDropdown, IoMdClose, IoMdAttach, IoMdDownload, IoMdArrowUp, IoMdTrash } from 'react-icons/io';
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

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

const indianLanguages = [
  { code: 'none', name: 'Off (No Translation)', native: 'Off' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' }
];

const MessagesPage = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
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
  
  const [downloadedDocs, setDownloadedDocs] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) setIsLangMenuOpen(false);
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
      } catch (err) {}
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
        setMessages([]); 
      }
    };
    fetchChatData();
  }, [userId]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser doesn't support Voice Typing!");
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => setNewMessage(prev => prev + (prev ? " " : "") + event.results[0][0].transcript);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;
    if (!userId) return;
    setIsSending(true);
    let finalMessage = newMessage;

    if (targetLang.code !== 'none' && newMessage.trim()) {
      try {
        const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(newMessage)}&langpair=en|${targetLang.code}`;
        const res = await axios.get(translateUrl);
        if (res.data?.responseData?.translatedText) finalMessage = res.data.responseData.translatedText;
      } catch (err) {}
    }

    try {
      let base64File = null;
      let isImage = false;
      if (selectedFile) {
        base64File = await convertToBase64(selectedFile);
        isImage = selectedFile.type.startsWith('image/');
      }
      const res = await axios.post(getApiUrl('/api/messages'), {
        receiverId: userId, text: finalMessage, replyTo: replyTo ? replyTo._id : null,
        image: isImage ? base64File : null, file: !isImage && base64File ? base64File : null,
        fileName: selectedFile ? selectedFile.name : null
      }, getAuthConfig());
      
      setMessages([...(messages || []), res.data.data]);
      setNewMessage(""); setReplyTo(null); setSelectedFile(null); 
    } catch (err) {
      alert("Error sending message.");
    } finally {
      setIsSending(false);
    }
  };

  const markDocAsDownloaded = (msgId) => {
    setDownloadedDocs(prev => ({ ...prev, [msgId]: true }));
  };

  const openMediaInNewTab = (e, base64Data) => {
    e.preventDefault();
    if (!base64Data) return;
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Media Viewer</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #0f172a; }
              img { max-width: 95vw; max-height: 95vh; object-fit: contain; box-shadow: 0 4px 20px rgba(0,0,0,0.5); border-radius: 8px; }
              iframe { width: 100vw; height: 100vh; border: none; }
            </style>
          </head>
          <body>
            ${base64Data.startsWith('data:image') ? `<img src="${base64Data}" />` : `<iframe src="${base64Data}"></iframe>`}
          </body>
        </html>
      `);
      newTab.document.close();
    } else {
      alert("Please allow pop-ups to open this file.");
    }
  };

  const getProfilePhoto = (user) => user ? (user.profilePhoto || user.profilePic || user.avatar || null) : null;
  const getInitial = (user) => user ? (user.fullName?.charAt(0) || user.username?.charAt(0) || 'U').toUpperCase() : 'U';
  const filteredLanguages = indianLanguages.filter(lang => lang.name.toLowerCase().includes(langSearch.toLowerCase()) || lang.native.toLowerCase().includes(langSearch.toLowerCase()));

  return (
    <div className="flex h-screen bg-[#0B0F19] font-sans">
      
      {/* ── 📱 LEFT SIDEBAR (Contact List) ── */}
      <div className="w-80 bg-[#0B0F19]/95 border-r border-[#1E2532] flex flex-col hidden md:flex z-40 backdrop-blur-xl">
        <div className="p-4 border-b border-[#1E2532]">
          <h2 className="font-black text-xl text-white tracking-wide mb-4">Messages</h2>
          <div className="relative">
            <IoMdSearch className="absolute left-3 top-3 text-gray-500 text-xl" />
            <input type="text" placeholder="Search accounts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-[#151A25] border border-[#1E2532] rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-[#00F0FF]/50 transition-colors" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {searchQuery.trim() !== "" ? (
            searchResults.map((user) => (
              <Link key={user._id} to={`/messages/${user._id}`} onClick={() => setSearchQuery('')} className="flex items-center gap-3 p-4 border-b border-[#1E2532] hover:bg-[#1E2532] transition-colors">
                <div className="w-12 h-12 bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] rounded-full flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]">{getInitial(user)}</div>
                <div className="flex-1 overflow-hidden"><h3 className="font-bold text-white truncate">@{user.username}</h3><p className="text-xs text-[#00F0FF]">Tap to chat</p></div>
              </Link>
            ))
          ) : recentChats.length > 0 ? (
            recentChats.map((user) => (
              <Link key={user._id} to={`/messages/${user._id}`} className={`flex items-center gap-3 p-4 border-b border-[#1E2532] transition-colors ${userId === user._id ? 'bg-[#151A25] border-l-4 border-l-[#00F0FF]' : 'hover:bg-[#151A25]'}`}>
                <div className="w-12 h-12 bg-[#1E2532] rounded-full flex items-center justify-center text-[#00F0FF] font-black border border-[#2A3441]">{getInitial(user)}</div>
                <div className="flex-1 overflow-hidden"><h3 className="font-bold text-white truncate">@{user.username}</h3><p className="text-xs text-gray-500 truncate">Open chat</p></div>
              </Link>
            ))
          ) : <div className="p-6 text-center text-sm font-bold text-gray-600">Search for users to chat</div>}
        </div>
      </div>

      {/* ── 💬 RIGHT CHAT AREA ── */}
      <div className="flex-1 flex flex-col bg-[#0B0F19] relative">
        {!userId ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-[#0B0F19]">
            <div className="w-24 h-24 rounded-full bg-[#151A25] flex items-center justify-center border border-[#1E2532] shadow-[0_0_30px_rgba(0,240,255,0.1)] mb-6">
              <svg className="w-10 h-10 text-[#00F0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-white">Your Messages</h2>
            <p className="text-sm mt-2">Select a user to start chatting.</p>
          </div>
        ) : !messages ? (
          <div className="flex items-center justify-center h-full text-[#00F0FF] font-bold animate-pulse">Loading Chat...</div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-[#1E2532] flex flex-wrap items-center justify-between shadow-sm z-30 gap-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] rounded-full overflow-hidden flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                  {getProfilePhoto(chatUser) ? <img src={getProfilePhoto(chatUser)} alt="Profile" className="w-full h-full object-cover" /> : getInitial(chatUser)}
                </div>
                <div className="flex flex-col justify-center">
                  <h2 className="font-black text-lg text-white tracking-wide flex items-center gap-2">
                    {chatUser?.fullName || chatUser?.username || "Loading..."}
                    <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] animate-pulse"></span>
                  </h2>
                </div>
              </div>
              
              {/* Translation Dropdown (Dark Theme) */}
              <div className="relative" ref={langMenuRef}>
                <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="bg-[#151A25] text-[#00F0FF] hover:bg-[#1E2532] border border-[#1E2532] hover:border-[#00F0FF]/50 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider">🌐 Translate:</span>
                  <span className="text-sm font-bold truncate max-w-[100px] text-white">{targetLang.name}</span>
                  <IoMdArrowDropdown />
                </button>
                {isLangMenuOpen && (
                  <div className="absolute top-12 right-0 w-64 bg-[#151A25] rounded-xl shadow-2xl border border-[#1E2532] flex flex-col z-50 overflow-hidden">
                    <div className="p-2 border-b border-[#1E2532] bg-[#0B0F19] relative">
                      <IoMdSearch className="absolute left-4 top-4 text-gray-500" />
                      <input type="text" placeholder="Search..." value={langSearch} onChange={(e) => setLangSearch(e.target.value)} className="w-full pl-8 pr-2 py-1.5 bg-[#151A25] border border-[#1E2532] rounded-md text-sm text-white placeholder-gray-500 outline-none focus:border-[#00F0FF]/50" />
                    </div>
                    <ul className="max-h-60 overflow-y-auto no-scrollbar">
                      {filteredLanguages.map((lang) => (
                        <li key={lang.code} onClick={() => { setTargetLang(lang); setIsLangMenuOpen(false); setLangSearch(""); }} className="px-4 py-2.5 flex justify-between items-center cursor-pointer text-sm border-b border-[#1E2532] hover:bg-[#1E2532] text-white transition-colors">
                          <span className="font-medium">{lang.name}</span><span className="text-gray-500 text-xs font-bold">{lang.native}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Background & Messages */}
            <div className="flex-1 relative bg-[#0B0F19] flex flex-col overflow-hidden">
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                {getProfilePhoto(chatUser) ? (
                  <div className="w-full h-full opacity-[0.03]" style={{ backgroundImage: `url(${getProfilePhoto(chatUser)})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)' }} />
                ) : (
                  <div className="text-[20rem] md:text-[30rem] font-black text-white opacity-[0.02]">{getInitial(chatUser)}</div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 no-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex justify-center h-full items-center"><p className="bg-[#151A25] border border-[#1E2532] text-gray-400 px-5 py-2.5 rounded-full shadow-sm text-sm font-bold tracking-wide">No messages yet. Say Hi! 👋</p></div>
                ) : (
                  messages.map((msg) => {
                    const isMe = String(msg.sender._id || msg.sender) === String(userId) ? false : true;
                    const hasMedia = msg.image || msg.file;
                    
                    // Theming the bubbles
                    const bubbleBg = isMe 
                      ? (hasMedia ? 'bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] text-white shadow-[0_4px_15px_rgba(0,240,255,0.2)]' : 'bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] text-white shadow-md')
                      : (hasMedia ? 'bg-[#151A25] border border-[#1E2532] text-white shadow-md' : 'bg-[#151A25] text-white border border-[#1E2532] shadow-sm');

                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-[75%] p-3 rounded-2xl group ${bubbleBg} ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                          
                          {/* Replied Message Preview */}
                          {msg.replyTo && (
                            <div className={`p-2 mb-2 rounded-lg text-xs italic border-l-4 ${isMe ? 'bg-black/20 border-white text-white' : 'bg-[#0B0F19] border-[#00F0FF] text-gray-300'}`}>
                              Replying to: {msg.replyTo.text?.substring(0, 30) || "Attachment"}...
                            </div>
                          )}
                          
                          {/* Image Attachment */}
                          {msg.image && (
                            <div className="flex flex-col mb-2">
                              <img src={msg.image} alt="Attached" className="rounded-xl max-h-64 w-auto object-cover border border-white/10 shadow-md mb-2" />
                              <div className="flex gap-2">
                                <button onClick={(e) => openMediaInNewTab(e, msg.image)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-colors cursor-pointer ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-[#1E2532] hover:bg-[#2A3441] text-[#00F0FF]'}`}>Open</button>
                                <a href={msg.image} download={`image-${msg._id}`} className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-colors ${isMe ? 'bg-white text-[#0057FF] hover:bg-gray-100' : 'bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 border border-[#00F0FF]/30'}`}>Save</a>
                              </div>
                            </div>
                          )}
                          
                          {/* Document Attachment */}
                          {msg.file && (
                            <div className={`flex flex-col rounded-xl p-3 mb-2 shadow-sm border ${isMe ? 'bg-white/20 border-white/20 text-white' : 'bg-[#0B0F19] border-[#1E2532] text-white'}`}>
                               <div className="flex items-center gap-3 mb-2">
                                  <span className="text-3xl drop-shadow-md">📄</span>
                                  <span className="font-bold text-sm truncate tracking-wide">{msg.fileName || "Document"}</span>
                               </div>
                               
                               {downloadedDocs[msg._id] ? (
                                 <div className="flex gap-2 mt-1 animate-fade-in-up">
                                   <button onClick={(e) => openMediaInNewTab(e, msg.file)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-colors cursor-pointer ${isMe ? 'bg-white/30 hover:bg-white/40 text-white' : 'bg-[#1E2532] hover:bg-[#2A3441] text-white'}`}>Open</button>
                                   <a href={msg.file} download={msg.fileName || "document"} className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-colors ${isMe ? 'bg-white text-[#0057FF] hover:bg-gray-100' : 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30'}`}>Save</a>
                                 </div>
                               ) : (
                                 <a href={msg.file} download={msg.fileName || "attachment"} onClick={() => markDocAsDownloaded(msg._id)} className={`flex items-center justify-center gap-2 py-1.5 mt-1 rounded-lg text-xs font-bold hover:shadow-md transition-all ${isMe ? 'bg-white text-[#0057FF] hover:bg-gray-100' : 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/20'}`}>
                                    <IoMdDownload className="text-lg" /> Download File
                                 </a>
                               )}
                            </div>
                          )}

                          {/* Text Body */}
                          {msg.text && <p className="text-[13px] md:text-sm tracking-wide leading-relaxed">{msg.text}</p>}
                          
                          {/* Meta: Reply Button & Timestamps */}
                          <div className={`flex items-center justify-between mt-1.5 pt-1 ${isMe ? 'text-white/80' : 'text-gray-500'}`}>
                             <button onClick={() => setReplyTo(msg)} className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${isMe ? 'hover:text-white' : 'hover:text-[#00F0FF]'}`}>
                               <BsReplyFill className="text-sm" /> Reply
                             </button>

                             <div className="flex items-center gap-1.5 ml-auto">
                               <span className="text-[9px] font-bold uppercase tracking-widest">{formatTime(msg.createdAt || msg.timestamp)}</span>
                               {isMe && (
                                 <span className={`flex items-center gap-0.5 ${msg.isRead ? 'text-white' : 'text-white/60'}`}>
                                   {msg.isRead ? <IoMdDoneAll className="text-[14px]" /> : <IoMdCheckmark className="text-[14px]" />}
                                 </span>
                               )}
                             </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={scrollRef} className="pb-2" />
              </div>
            </div>

            {/* ── 📝 INPUT AREA (Frosted Glass) ── */}
            <div className="p-4 bg-[#0B0F19]/90 backdrop-blur-xl border-t border-[#1E2532] z-20 relative">
              
              {/* Replying To Overlay */}
              {replyTo && (
                <div className="flex justify-between items-center bg-[#151A25] p-3 mb-3 rounded-xl border border-[#1E2532] border-l-4 border-l-[#00F0FF] shadow-sm animate-fade-in-up">
                  <span className="text-xs font-bold tracking-wide text-gray-400 truncate pr-4">
                    Replying to: <span className="text-white">{replyTo.text?.substring(0, 40) || (replyTo.fileName ? replyTo.fileName : "Attachment")}</span>
                  </span>
                  <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-red-400 transition-colors"><IoMdClose className="text-lg" /></button>
                </div>
              )}

              {/* Upload Preview Overlay */}
              {selectedFile && (
                <div className="absolute -top-16 left-4 bg-[#151A25] border border-[#00F0FF]/50 shadow-[0_0_20px_rgba(0,240,255,0.2)] px-4 py-2.5 rounded-xl flex items-center gap-4 z-50 animate-fade-in-up">
                  <span className="text-2xl drop-shadow-md">📁</span>
                  <div className="flex flex-col max-w-[150px]">
                    <span className="text-xs font-bold text-white truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-[#00F0FF] font-black tracking-widest uppercase">Ready to send</span>
                  </div>
                  <button type="button" onClick={() => setSelectedFile(null)} title="Remove file" className="ml-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg p-2 transition-colors">
                     <IoMdTrash />
                  </button>
                </div>
              )}

              {/* Text Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-2xl text-gray-400 hover:text-yellow-400 transition-colors"><IoMdHappy /></button>
                
                {/* DARK THEME EMOJI PICKER */}
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-0 z-[100] shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-xl border border-[#1E2532] overflow-hidden">
                    <EmojiPicker theme="dark" onEmojiClick={(emojiData) => { setNewMessage(prev => prev + emojiData.emoji); setShowEmojiPicker(false); }} />
                  </div>
                )}
                
                {/* Pill Shaped Input */}
                <div className="flex flex-1 items-center bg-[#151A25] rounded-full pl-2 pr-2 shadow-inner border border-[#1E2532] focus-within:border-[#00F0FF]/50 focus-within:shadow-[0_0_10px_rgba(0,240,255,0.1)] transition-all">
                  <label htmlFor="file-upload" className="p-2 text-gray-500 hover:text-[#00F0FF] cursor-pointer transition-colors border-r border-[#1E2532] mr-2 pr-3" title="Attach a file">
                    <IoMdAttach className="text-xl" />
                  </label>
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept="image/*,video/*,.pdf,.doc,.docx" />
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={isListening ? "Listening... Speak now!" : "Message..."} className="flex-1 py-3 bg-transparent text-white font-medium placeholder-gray-500 outline-none w-full text-sm tracking-wide" />
                </div>

                {/* Send Button */}
                <button type="submit" disabled={isSending || (!newMessage.trim() && !selectedFile)} className="flex items-center justify-center transition-all outline-none">
                  {isSending ? (
                    <div className="w-11 h-11 border-[3px] border-[#00F0FF] border-t-transparent rounded-full animate-spin"></div>
                  ) : selectedFile ? (
                    <div className="bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] text-white w-11 h-11 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-110 transition-transform">
                       <IoMdArrowUp className="text-xl font-bold" />
                    </div>
                  ) : (
                    <div className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${newMessage.trim() ? 'bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105' : 'bg-[#151A25] border border-[#1E2532] text-gray-500'}`}>
                      <IoMdSend className="text-xl -ml-1 mt-0.5" />
                    </div>
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
