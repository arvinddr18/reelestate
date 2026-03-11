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

  // --- FIXED: Image now opens perfectly centered with a dark background ---
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
              body { 
                margin: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                background-color: #0f172a; 
              }
              img { 
                max-width: 95vw; 
                max-height: 95vh; 
                object-fit: contain; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                border-radius: 8px;
              }
              iframe { 
                width: 100vw; 
                height: 100vh; 
                border: none; 
              }
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
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="w-80 bg-white border-r flex flex-col hidden md:flex">
        <div className="p-4 border-b bg-white">
          <h2 className="font-bold text-xl text-gray-800 mb-4">Messages</h2>
          <div className="relative">
            <IoMdSearch className="absolute left-3 top-3 text-gray-400 text-xl" />
            <input type="text" placeholder="Search accounts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {searchQuery.trim() !== "" ? (
            searchResults.map((user) => (
              <Link key={user._id} to={`/messages/${user._id}`} onClick={() => setSearchQuery('')} className="flex items-center gap-3 p-4 border-b hover:bg-gray-50">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">{getInitial(user)}</div>
                <div className="flex-1 overflow-hidden"><h3 className="font-semibold text-gray-800 truncate">{user.username}</h3><p className="text-xs text-blue-500">Tap to chat</p></div>
              </Link>
            ))
          ) : recentChats.length > 0 ? (
            recentChats.map((user) => (
              <Link key={user._id} to={`/messages/${user._id}`} className={`flex items-center gap-3 p-4 border-b ${userId === user._id ? 'bg-blue-50' : 'hover:bg-gray-100'}`}>
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">{getInitial(user)}</div>
                <div className="flex-1 overflow-hidden"><h3 className="font-semibold text-gray-800 truncate">{user.username}</h3><p className="text-sm text-gray-500 truncate">Open chat</p></div>
              </Link>
            ))
          ) : <div className="p-6 text-center text-sm text-gray-400">Search for users to chat</div>}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        {!userId ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50"><div className="text-6xl mb-4">💬</div><h2 className="text-2xl font-semibold">Your Messages</h2></div>
        ) : !messages ? (
          <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="p-4 bg-white/90 backdrop-blur-md border-b flex flex-wrap items-center justify-between shadow-sm z-30 gap-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full overflow-hidden flex items-center justify-center text-white font-bold shadow-sm">
                  {getProfilePhoto(chatUser) ? <img src={getProfilePhoto(chatUser)} alt="Profile" className="w-full h-full object-cover" /> : getInitial(chatUser)}
                </div>
                <div className="flex flex-col justify-center">
                  <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    {chatUser?.fullName || chatUser?.username || "Loading..."}
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]"></span>
                  </h2>
                </div>
              </div>
              
              <div className="relative" ref={langMenuRef}>
                <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border flex items-center gap-2">
                  <span className="text-xs font-bold">🌐 Translate to:</span>
                  <span className="text-sm font-bold truncate max-w-[100px]">{targetLang.name}</span>
                  <IoMdArrowDropdown />
                </button>
                {isLangMenuOpen && (
                  <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-2xl border flex flex-col z-50">
                    <div className="p-2 border-b bg-gray-50 relative">
                      <IoMdSearch className="absolute left-4 top-4 text-gray-400" />
                      <input type="text" placeholder="Search..." value={langSearch} onChange={(e) => setLangSearch(e.target.value)} className="w-full pl-8 pr-2 py-1.5 bg-white border rounded-md text-sm outline-none" />
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                      {filteredLanguages.map((lang) => (
                        <li key={lang.code} onClick={() => { setTargetLang(lang); setIsLangMenuOpen(false); setLangSearch(""); }} className="px-4 py-2.5 flex justify-between items-center cursor-pointer text-sm border-b hover:bg-blue-50">
                          <span>{lang.name}</span><span className="text-gray-400 text-xs">{lang.native}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 relative bg-gray-50 flex flex-col overflow-hidden">
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                {getProfilePhoto(chatUser) ? (
                  <div className="w-full h-full opacity-[0.10]" style={{ backgroundImage: `url(${getProfilePhoto(chatUser)})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(30%)' }} />
                ) : (
                  <div className="text-[20rem] md:text-[30rem] font-black text-gray-300 opacity-30">{getInitial(chatUser)}</div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
                {messages.length === 0 ? (
                  <div className="flex justify-center h-full text-gray-500"><p className="bg-white px-4 py-2 rounded-full shadow-sm">No messages yet. Say Hi! 👋</p></div>
                ) : (
                  messages.map((msg) => {
                    const isMe = String(msg.sender._id || msg.sender) === String(userId) ? false : true;
                    const hasMedia = msg.image || msg.file;
                    
                    const bubbleBg = isMe 
                      ? (hasMedia ? 'bg-indigo-600 text-white shadow-md border border-indigo-700' : 'bg-blue-600 text-white shadow-sm')
                      : (hasMedia ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-900 shadow-md' : 'bg-white text-gray-800 border shadow-sm');

                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-[75%] p-3 rounded-2xl group ${bubbleBg}`}>
                          
                          {msg.replyTo && (
                            <div className={`p-2 mb-2 rounded text-xs italic border-l-4 ${isMe ? 'bg-black/10 border-indigo-300 text-white' : 'bg-black/5 border-indigo-400 text-indigo-800'}`}>
                              Replying to: {msg.replyTo.text?.substring(0, 30) || "Attachment"}...
                            </div>
                          )}
                          
                          {msg.image && (
                            <div className="flex flex-col mb-2">
                              <img src={msg.image} alt="Attached" className="rounded-xl max-h-64 w-auto object-cover border-2 border-white/20 shadow-md mb-2" />
                              <div className="flex gap-2">
                                <button onClick={(e) => openMediaInNewTab(e, msg.image)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-colors cursor-pointer ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-indigo-200 hover:bg-indigo-300 text-indigo-800'}`}>Open</button>
                                <a href={msg.image} download={`image-${msg._id}`} className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-colors ${isMe ? 'bg-white text-indigo-700 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>Save</a>
                              </div>
                            </div>
                          )}
                          
                          {msg.file && (
                            <div className={`flex flex-col rounded-xl p-3 mb-2 shadow-sm border ${isMe ? 'bg-white/20 border-white/30 text-white' : 'bg-white border-indigo-200 text-indigo-800'}`}>
                               <div className="flex items-center gap-3 mb-2">
                                  <span className="text-3xl">📄</span>
                                  <span className="font-bold text-sm truncate">{msg.fileName || "Document"}</span>
                               </div>
                               
                               {downloadedDocs[msg._id] ? (
                                 <div className="flex gap-2 mt-1 animate-fade-in-up">
                                   <button onClick={(e) => openMediaInNewTab(e, msg.file)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-colors cursor-pointer ${isMe ? 'bg-white/30 hover:bg-white/40 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'}`}>Open</button>
                                   <a href={msg.file} download={msg.fileName || "document"} className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-colors ${isMe ? 'bg-white text-indigo-700 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>Save</a>
                                 </div>
                               ) : (
                                 <a href={msg.file} download={msg.fileName || "attachment"} onClick={() => markDocAsDownloaded(msg._id)} className={`flex items-center justify-center gap-2 py-1.5 mt-1 rounded-lg text-xs font-bold hover:shadow-md transition-all ${isMe ? 'bg-white text-indigo-700 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                                    <IoMdDownload className="text-lg" /> Download File
                                 </a>
                               )}
                            </div>
                          )}

                          {msg.text && <p className="text-sm md:text-base">{msg.text}</p>}
                          
                          <div className={`flex items-center justify-between mt-2 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                             <button onClick={() => setReplyTo(msg)} className={`text-[11px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${isMe ? 'hover:text-white' : 'hover:text-indigo-600'}`}>
                               <BsReplyFill /> Reply
                             </button>

                             <div className="flex items-center gap-1.5 ml-auto">
                               <span className="text-[10px] font-medium">{formatTime(msg.createdAt || msg.timestamp)}</span>
                               {/* --- FIXED: "SENT" is now red! --- */}
                               {isMe && (
                                 <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border shadow-sm ${msg.isRead ? 'bg-white text-green-600 border-green-400' : 'bg-white text-red-500 border-red-300'}`}>
                                   {msg.isRead ? <IoMdDoneAll /> : <IoMdCheckmark />} {msg.isRead ? 'READ' : 'SENT'}
                                 </span>
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
                <div className="flex justify-between items-center bg-gray-100 p-2 mb-2 rounded-lg border-l-4 border-indigo-500 shadow-sm animate-fade-in-up">
                  <span className="text-sm text-gray-600 truncate">
                    Replying to: <b>{replyTo.text?.substring(0, 40) || (replyTo.fileName ? replyTo.fileName : "Attachment")}</b>
                  </span>
                  <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm transition-colors"><IoMdClose /></button>
                </div>
              )}

              {selectedFile && (
                <div className="absolute -top-16 left-4 bg-white border-2 border-green-500 shadow-xl px-4 py-2 rounded-xl flex items-center gap-4 z-50 animate-fade-in-up">
                  <span className="text-2xl">📁</span>
                  <div className="flex flex-col max-w-[150px]">
                    <span className="text-xs font-bold text-gray-800 truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-green-600 font-bold">Ready to send</span>
                  </div>
                  <button type="button" onClick={() => setSelectedFile(null)} title="Remove file" className="ml-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg p-2 transition-colors">
                     <IoMdTrash />
                  </button>
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
                  <label htmlFor="file-upload" className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer transition-colors border-r border-gray-300 mr-2 pr-3" title="Attach a file">
                    <IoMdAttach className="text-2xl" />
                  </label>
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept="image/*,video/*,.pdf,.doc,.docx" />
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={isListening ? "Listening... Speak now!" : "Type your message..."} className="flex-1 p-2.5 bg-transparent text-gray-900 font-medium placeholder-gray-500 outline-none w-full" />
                </div>

                <button type="submit" disabled={isSending || (!newMessage.trim() && !selectedFile)} className="flex items-center justify-center transition-all">
                  {isSending ? (
                    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : selectedFile ? (
                    <div className="bg-green-500 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:bg-green-600 hover:scale-110 transition-transform">
                       <IoMdArrowUp className="text-2xl font-bold" />
                    </div>
                  ) : (
                    <IoMdSend className={`text-3xl transition-colors ${newMessage.trim() ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'}`} />
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