import EmojiPicker from 'emoji-picker-react';
import AnimatedMessageBubble from '../components/AnimatedMessageBubble';
import React, { useState, useEffect, useRef } from 'react';
import { IoMdArrowBack, IoMdSend, IoMdMore, IoMdImage, IoMdMic, IoMdClose, IoMdCamera, IoMdAdd, IoMdCheckmark, IoMdDocument, IoMdPin, IoMdFolder, IoMdTrash } from 'react-icons/io';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const API_URL = RAW_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
const socket = io(API_URL);

export default function ChatRoom({ chatUser, onBack }) {
  const { user: currentUser } = useAuth(); 
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null); // 🌟 Strictly for the Gallery app
  const cameraInputRef = useRef(null); 

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); 
  
  // 🌟 DRAG & CALL STATES 🌟
  const [isDragging, setIsDragging] = useState(null); // 'audio' | 'video' | null
  const [startY, setStartY] = useState(0);
  const [audioDrag, setAudioDrag] = useState(0);
  const [videoDrag, setVideoDrag] = useState(0);
  const [activeCall, setActiveCall] = useState(null); // 'audio' | 'video' | null
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // 🌟 AUDIO RECORDING STATES (MOVED OUTSIDE USE-EFFECT!) 🌟
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const audioRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // 🌟 IN-APP CAMERA & FILTER STATES 🌟
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null); // For chat preview
  const [cameraMode, setCameraMode] = useState('photo'); // 'photo' | 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // front | back camera
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Custom Snapchat-style filters
  const filters = [
    { name: 'Normal', css: 'none' },
    { name: 'Cyberpunk', css: 'hue-rotate(90deg) saturate(200%)' },
    { name: 'Noir', css: 'grayscale(100%) contrast(150%)' },
    { name: 'Sepia', css: 'sepia(100%) contrast(110%)' },
    { name: 'Matrix', css: 'invert(100%) hue-rotate(180deg)' },
    { name: 'Dream', css: 'brightness(120%) contrast(90%) saturate(150%)' }
  ];

  const myId = currentUser?._id || currentUser?.id;
  const friendId = chatUser?._id || chatUser?.id;
  const room = myId && friendId ? [myId, friendId].sort().join('_') : null;

  // Function to add the clicked emoji to your message box
  const handleEmojiClick = (emojiObject) => {
    setMessage((prevMsg) => prevMsg + emojiObject.emoji);
  };

  // ==========================================
  // 🌟 AUDIO RECORDING ENGINE (PROPERLY PLACED) 🌟
  // ==========================================
  const startRecordingAudio = async () => {
    try {
      // 🚨 FIX 1: Force CD-Quality Audio (44.1kHz) & disable Auto-Muting (AutoGain)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false, // <-- Turning this off stops the mic from getting too quiet
          sampleRate: 44100 // <-- Forces high-definition audio
        } 
      });

      // 🚨 FIX 2: Force a high Bitrate (128kbps) so it doesn't sound compressed
      const options = { audioBitsPerSecond: 128000 };
      const mediaRecorder = new MediaRecorder(stream, options);
      
      audioRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          sendAudioMessage(reader.result); 
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => { setRecordTime((prev) => prev + 1); }, 1000);
    } catch (err) {
      console.error("Mic access denied", err);
      alert("Please allow microphone access to send voice notes.");
    }
  };

  const cancelAudioRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.onstop = null; // Kills the save logic
      audioRecorderRef.current.stop();
      audioRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    clearInterval(timerRef.current);
    setIsRecordingAudio(false);
    setRecordTime(0);
  };

  const stopAndSendAudio = () => {
    if (audioRecorderRef.current) audioRecorderRef.current.stop(); // Triggers the send function
    clearInterval(timerRef.current);
    setIsRecordingAudio(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const sendAudioMessage = async (audioBase64) => {
    if (!room || !myId) return;
    const messageData = {
      room, text: "", image: null, video: null,
      audio: audioBase64, // 🌟 The new audio payload
      senderId: myId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, messageData]);
    socket.emit('send_message', messageData);
    try {
      const token = localStorage.getItem('reelestate_token');
      await axios.post(`${API_URL}/api/messages`, messageData, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { console.error(err); }
  };

  // ==========================================
  // 🌟 DRAG LOGIC: Tracks finger/mouse movement 🌟
  // ==========================================
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      const currentY = e.touches ? e.touches[0].clientY : e.clientY;
      let deltaY = currentY - startY;
      
      // Stop pushing up, and limit max pull down to 80px
      if (deltaY < 0) deltaY = 0;
      if (deltaY > 80) deltaY = 80; 

      if (isDragging === 'audio') setAudioDrag(deltaY);
      if (isDragging === 'video') setVideoDrag(deltaY);
    };

    const handleEnd = () => {
      // If pulled down more than 50px, start the call!
      if (isDragging === 'audio' && audioDrag > 50) setActiveCall('audio');
      if (isDragging === 'video' && videoDrag > 50) setActiveCall('video');
      
      // Snap buttons back to top
      setIsDragging(null);
      setAudioDrag(0);
      setVideoDrag(0);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, startY, audioDrag, videoDrag]);

  // ==========================================
  // 🌟 IN-APP CAMERA ENGINE 🌟
  // ==========================================
  const openCamera = async (mode = facingMode) => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode }, 
        audio: cameraMode === 'video' 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Please allow camera/microphone access to use this feature.");
    }
  };

  const toggleCameraFacing = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    openCamera(newMode);
  };

  useEffect(() => {
    if (isCameraOpen) openCamera(facingMode);
  }, [cameraMode]);

  const closeCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
    setIsRecording(false);
    setActiveFilter(0);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.filter = filters[activeFilter].css;
    if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setSelectedImage(canvas.toDataURL('image/jpeg'));
    closeCamera();
  };

  const startRecording = () => {
    recordedChunksRef.current = [];
    const stream = videoRef.current.srcObject;
    const options = { mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4' };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: options.mimeType });
      const reader = new FileReader();
      reader.onloadend = () => { setSelectedVideo(reader.result); closeCamera(); };
      reader.readAsDataURL(blob);
    };
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleCaptureClick = () => {
    if (cameraMode === 'photo') capturePhoto();
    else isRecording ? stopRecording() : startRecording();
  };

  useEffect(() => {
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);
  
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ==========================================
  // 🌟 SOCKET & HISTORY FETCHING 🌟
  // ==========================================
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
    if ((!message.trim() && !selectedImage && !selectedVideo) || !room || !myId) return;

    const messageData = {
      room,
      text: message,
      image: selectedImage, 
      video: selectedVideo, 
      senderId: myId, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, messageData]);
    setMessage('');
    setSelectedImage(null); 
    setSelectedVideo(null);
    setShowEmojiPicker(false);
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

      {/* 🌟 DYNAMIC USER BACKGROUND 🌟 */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {chatUser.profilePhoto ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 blur-[10px] scale-110" 
              style={{ backgroundImage: `url(${chatUser.profilePhoto})` }}
            />
            <div className="absolute inset-0 bg-[#05070A]/75" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[#05070A]/80" />
            <span className="text-[50vw] md:text-[30vw] font-black text-white/5 select-none drop-shadow-2xl">
              {(chatUser.fullName || chatUser.username || 'U')[0].toUpperCase()}
            </span>
          </>
        )}
      </div>
      
      {/* 1. FLEX-NONE HEADER */}
      <div className="shrink-0 flex-none relative w-full h-[70px] md:h-24 px-3 md:px-8 bg-[#05070A]/98 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between z-20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3 md:gap-4">
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
        
        {/* 🌟 HANGING UPLINK TAGS (DRAGGABLE) 🌟 */}
        <div className="flex items-start h-full absolute top-0 right-2 md:right-8">
          {/* AUDIO CALL PULL-STRING */}
          <div 
            className="group flex flex-col items-center mr-2 md:mr-4 mt-0 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => { setIsDragging('audio'); setStartY(e.clientY); }}
            onTouchStart={(e) => { setIsDragging('audio'); setStartY(e.touches[0].clientY); }}
            style={{ touchAction: 'none' }}
          >
            <div 
              className={`w-[2px] bg-gradient-to-b from-transparent to-[#00f0ff]/50 ${isDragging === 'audio' ? '' : 'transition-all duration-300'}`}
              style={{ height: `${24 + (isDragging === 'audio' ? audioDrag : 0)}px` }}
            />
            <button className={`relative w-8 h-10 md:w-10 md:h-12 backdrop-blur-xl border rounded-b-xl md:rounded-b-2xl rounded-t-sm shadow-[0_5px_15px_rgba(0,240,255,0.2)] flex items-center justify-center ${isDragging === 'audio' ? 'border-[#00f0ff] bg-[#00f0ff]/20 shadow-[0_0_20px_rgba(0,240,255,0.6)] scale-110' : 'bg-[#05070A]/80 border-[#00f0ff]/30 group-hover:border-[#00f0ff]/70 group-hover:bg-[#00f0ff]/10 transition-all duration-300'}`}>
              <div className="absolute top-1 w-1.5 md:w-2 h-[2px] bg-[#00f0ff]/40 rounded-full"></div>
              <svg className={`w-4 h-4 md:w-5 md:h-5 relative z-10 transition-colors mt-1 ${isDragging === 'audio' ? 'text-white' : 'text-gray-400 group-hover:text-[#00f0ff]'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
            </button>
          </div>

          {/* VIDEO CALL PULL-STRING */}
          <div 
            className="group flex flex-col items-center mr-2 md:mr-8 mt-0 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => { setIsDragging('video'); setStartY(e.clientY); }}
            onTouchStart={(e) => { setIsDragging('video'); setStartY(e.touches[0].clientY); }}
            style={{ touchAction: 'none' }}
          >
            <div 
              className={`w-[2px] bg-gradient-to-b from-transparent to-[#bc00dd]/50 ${isDragging === 'video' ? '' : 'transition-all duration-300'}`}
              style={{ height: `${16 + (isDragging === 'video' ? videoDrag : 0)}px` }}
            />
            <button className={`relative w-8 h-10 md:w-10 md:h-12 backdrop-blur-xl border rounded-b-xl md:rounded-b-2xl rounded-t-sm shadow-[0_5px_15px_rgba(188,0,221,0.2)] flex items-center justify-center ${isDragging === 'video' ? 'border-[#bc00dd] bg-[#bc00dd]/20 shadow-[0_0_20px_rgba(188,0,221,0.6)] scale-110' : 'bg-[#05070A]/80 border-[#bc00dd]/30 group-hover:border-[#bc00dd]/70 group-hover:bg-[#bc00dd]/10 transition-all duration-300'}`}>
              <div className="absolute top-1 w-1.5 md:w-2 h-[2px] bg-[#bc00dd]/40 rounded-full"></div>
              <svg className={`w-4 h-4 md:w-5 md:h-5 relative z-10 transition-colors mt-1 ${isDragging === 'video' ? 'text-white' : 'text-gray-400 group-hover:text-[#bc00dd]'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            </button>
          </div>

          <div className="h-[70px] md:h-24 flex items-center">
            <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white backdrop-blur-md group">
              <IoMdMore size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. FLEX-1 MESSAGES */}
      <div className="flex-1 min-h-0 relative w-full overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-6 no-scrollbar z-10">
        <div className="flex justify-center mb-2 mt-2">
          <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[9px] font-black text-gray-400 tracking-widest uppercase shadow-lg">Encryption Started • Today</span>
        </div>

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

                {msg.video && (
                  <div className="relative mb-2">
                    <div className="relative overflow-hidden rounded-2xl border border-[#ff3366]/30 bg-black">
                      <video src={msg.video} controls className="w-full max-h-[300px] object-cover" />
                    </div>
                  </div>
                )}

                {msg.audio && (
                  <div className="relative mt-1 mb-2">
                    <audio controls src={msg.audio} className="h-10 w-[200px] md:w-[250px] outline-none rounded-full bg-white/5 opacity-90 shadow-[0_0_15px_rgba(0,240,255,0.1)]" />
                  </div>
                )}

                {msg.text && (
                  <AnimatedMessageBubble msg={msg} isMe={isMe} />
                )}
                
                <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] font-semibold tracking-wider ${isMe ? 'text-white/70 drop-shadow-sm' : 'text-gray-500'}`}>{msg.time}</span>
                  {isMe && (
                    <div className="flex -space-x-1">
                      <IoMdCheckmark className="text-gray-400" size={14} />
                      <IoMdCheckmark className="text-gray-400" size={14} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* MEDIA PREVIEW */}
      {(selectedImage || selectedVideo) && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-5">
           <div className="relative p-1 bg-[#151A25] border border-[#00F0FF] rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              {selectedImage && <img src={selectedImage} className="w-20 h-20 object-cover rounded-lg" alt="Preview"/>}
              {selectedVideo && <video src={selectedVideo} autoPlay muted loop className="w-20 h-20 object-cover rounded-lg"/>}
              <button onClick={() => { setSelectedImage(null); setSelectedVideo(null); }} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg text-white"><IoMdClose size={14}/></button>
           </div>
        </div>
      )}

      {/* 3. FLEX-NONE FOOTER */}
      <div className="shrink-0 flex-none relative w-full bg-[#05070A]/98 border-t border-white/10 pt-2 pb-2 md:pb-6 px-2 md:px-8 z-20">
        
        {/* SMART AI REPLIES ROW */}
        <div className="relative w-full max-w-3xl mx-auto flex items-center justify-start gap-2 overflow-x-auto no-scrollbar px-2 pb-2">
          <button className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-[#00f0ff]/30 text-white text-[12px] font-bold shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:bg-[#00f0ff]/20 hover:scale-105 transition-all backdrop-blur-md">
            <span className="text-[#00f0ff]">✨</span> Sounds perfect!
          </button>
          <button className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-[#ff3366]/30 text-white text-[12px] font-bold shadow-[0_0_10px_rgba(255,51,102,0.1)] hover:bg-[#ff3366]/20 hover:scale-105 transition-all backdrop-blur-md">
            <span className="text-[#ff3366]">🔥</span> Send me the contract
          </button>
          <button className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[12px] font-bold hover:bg-white/10 hover:scale-105 transition-all backdrop-blur-md">
            Let's schedule a call 📞
          </button>
        </div>

        {/* 🌟 DYNAMIC INPUT BAR / RECORDING DASHBOARD 🌟 */}
        {isRecordingAudio ? (
          <div className="relative w-full max-w-3xl mx-auto flex items-center justify-between bg-[#ff3366]/10 backdrop-blur-2xl border border-[#ff3366]/30 p-1 md:p-1.5 rounded-full shadow-[0_0_40px_rgba(255,51,102,0.2)] animate-in slide-in-from-right-10 duration-300">
            <button type="button" onClick={cancelAudioRecording} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-500 transition-all hover:scale-110 ml-1">
              <IoMdTrash size={20} />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 h-6">
                 <span className="w-1 h-3 bg-[#ff3366] rounded-full animate-[bounce_1s_infinite]"></span>
                 <span className="w-1 h-5 bg-[#ff3366] rounded-full animate-[bounce_1s_infinite_0.2s]"></span>
                 <span className="w-1 h-4 bg-[#ff3366] rounded-full animate-[bounce_1s_infinite_0.4s]"></span>
                 <span className="w-1 h-6 bg-[#ff3366] rounded-full animate-[bounce_1s_infinite_0.1s]"></span>
                 <span className="w-1 h-3 bg-[#ff3366] rounded-full animate-[bounce_1s_infinite_0.5s]"></span>
              </div>
              <span className="text-[#ff3366] font-mono font-bold tracking-widest text-sm animate-pulse">
                {formatTime(recordTime)}
              </span>
            </div>
            <button type="button" onClick={stopAndSendAudio} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#ffbb00] to-[#ff3366] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,51,102,0.5)] hover:scale-110 transition-transform mr-0.5">
              <IoMdSend size={18} className="translate-x-[1px]" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="relative w-full max-w-3xl mx-auto flex items-center bg-[#1A1F2E]/90 backdrop-blur-2xl border border-white/20 p-1 md:p-1.5 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.8)] focus-within:border-[#bc00dd]/50 focus-within:shadow-[0_0_30px_rgba(188,0,221,0.2)] transition-all duration-300">
            
            {showAttachMenu && (
              <div className="absolute bottom-[120%] left-0 md:left-4 p-5 bg-[#1A1F2E]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-wrap gap-6 w-[280px] z-[100] animate-in slide-in-from-bottom-5 fade-in duration-200">
                 <button type="button" onClick={() => { galleryInputRef.current.click(); setShowAttachMenu(false); }} className="flex flex-col items-center gap-2 w-16 group">
                   <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#801fd6] to-[#c11f70] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><IoMdImage size={26} /></div>
                   <span className="text-[11px] text-gray-300 font-bold tracking-wider">Gallery</span>
                 </button>
                 <button type="button" onClick={() => { openCamera(facingMode); setShowAttachMenu(false); }} className="flex flex-col items-center gap-2 w-16 group">
                   <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0057FF] to-[#00F0FF] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><IoMdCamera size={26} /></div>
                   <span className="text-[11px] text-gray-300 font-bold tracking-wider">Camera</span>
                 </button>
                 <button type="button" onClick={() => { fileInputRef.current.click(); setShowAttachMenu(false); }} className="flex flex-col items-center gap-2 w-16 group">
                   <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ffbb00] to-[#ff3366] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><IoMdDocument size={26} /></div>
                   <span className="text-[11px] text-gray-300 font-bold tracking-wider">Document</span>
                 </button>
                 <button type="button" onClick={() => { fileInputRef.current.click(); setShowAttachMenu(false); }} className="flex flex-col items-center gap-2 w-16 group">
                   <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4facfe] to-[#00f2fe] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><IoMdFolder size={26} /></div>
                   <span className="text-[11px] text-gray-300 font-bold tracking-wider">Files</span>
                 </button>
                 <button type="button" onClick={() => { alert("Location sharing coming soon!"); setShowAttachMenu(false); }} className="flex flex-col items-center gap-2 w-16 group">
                   <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00ff9d] to-[#00b8ff] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><IoMdPin size={26} /></div>
                   <span className="text-[11px] text-gray-300 font-bold tracking-wider">Location</span>
                 </button>
              </div>
            )}

            <div className={`flex items-center transition-all duration-300 ease-in-out origin-left overflow-hidden ${message.length > 0 ? 'w-0 opacity-0 scale-50' : 'w-[80px] md:w-[100px] opacity-100 scale-100 gap-0.5 pl-1'}`}>
              <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${showAttachMenu ? 'bg-white/20 text-white rotate-45' : 'bg-transparent hover:bg-white/10 text-gray-400 hover:text-white'}`}>
                 <IoMdAdd size={20} />
              </button>
              <input type="file" ref={galleryInputRef} hidden accept="image/*, video/*, .mp4, .mov, .avi" onChange={handleImageSelect} />
              <input type="file" ref={fileInputRef} hidden accept="*" onChange={handleImageSelect} />
              <button type="button" onClick={() => openCamera(facingMode)} className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#0057FF]/10 hover:bg-[#0057FF]/20 flex items-center justify-center text-[#00F0FF] transition-colors shrink-0">
                <IoMdCamera size={18} />
              </button>
            </div>
            
            <input 
              type="text" 
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                socket.emit('typing', room); 
              }}
              onBlur={() => socket.emit('stop_typing', room)}
              placeholder="Message..."
              className={`flex-1 bg-transparent text-white text-[16px] md:text-[15px] outline-none placeholder-gray-400 font-medium min-w-0 transition-all duration-300 ${message.length > 0 ? 'pl-3' : 'pl-0'}`}
            />

            {showEmojiPicker && (
              <div className="absolute bottom-[120%] right-0 md:right-10 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-200 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/10">
                <EmojiPicker 
                  theme="dark" 
                  onEmojiClick={handleEmojiClick}
                  autoFocusSearch={false}
                  width={300}
                  height={400}
                  style={{ backgroundColor: '#1A1F2E', borderColor: 'rgba(255,255,255,0.1)' }}
                />
              </div>
            )}

            <div className={`flex items-center transition-all duration-300 ease-in-out origin-right overflow-hidden ${message.length > 0 ? 'w-0 opacity-0 scale-50' : 'w-[80px] md:w-[100px] opacity-100 scale-100 gap-1 md:gap-2 mr-1 md:mr-2'}`}>
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all shrink-0 border border-transparent ${showEmojiPicker ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/15 text-[#ffbb00] hover:text-white hover:border-[#ffbb00]/30'}`}>
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 drop-shadow-[0_0_5px_rgba(255,187,0,0.5)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 8c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-7 0c.83 0 1.5.67 1.5 1.5S9.33 13 8.5 13 7 12.33 7 11.5 7.67 10 8.5 10zm3.5 6.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
                </svg>
              </button>
              
              <button type="button" onClick={startRecordingAudio} className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-transparent hover:bg-[#ff3366]/10 flex items-center justify-center text-gray-400 hover:text-[#ff3366] transition-all shrink-0">
                <IoMdMic size={18} className="relative z-10 md:text-[22px]" />
              </button>
            </div>

            <button type="submit" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#801fd6] to-[#c11f70] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_15px_rgba(193,31,112,0.5)] shrink-0 mr-0.5 md:mr-1">
              <IoMdSend size={18} className="translate-x-[1px]" />
            </button>
          </form>
        )}
      </div>

      {/* 🌟 CALLING OVERLAY UI 🌟 */}
      {activeCall && (
        <div className="absolute inset-0 z-[99999] bg-[#05070A]/95 backdrop-blur-3xl flex flex-col items-center justify-center text-white transition-opacity duration-300">
           <div className={`absolute inset-0 bg-[radial-gradient(circle,_rgba(0,240,255,0.15)_0%,_rgba(0,0,0,0)_70%)] animate-pulse ${activeCall === 'video' ? 'bg-[radial-gradient(circle,_rgba(188,0,221,0.15)_0%,_rgba(0,0,0,0)_70%)]' : ''}`} />
           
           <div className="relative z-10 flex flex-col items-center">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 p-2 mb-6 shadow-2xl ${activeCall === 'video' ? 'border-[#bc00dd]/30 shadow-[#bc00dd]/20' : 'border-[#00f0ff]/30 shadow-[#00f0ff]/20'}`}>
                 <img src={chatUser.profilePhoto || "default"} className="w-full h-full rounded-full object-cover" alt="Profile" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-wide mb-2 drop-shadow-lg">{chatUser.fullName}</h2>
              <p className={`animate-pulse tracking-widest text-sm font-bold uppercase drop-shadow-md ${activeCall === 'video' ? 'text-[#bc00dd]' : 'text-[#00f0ff]'}`}>
                 {activeCall === 'video' ? 'Requesting Video...' : 'Calling...'}
              </p>
           </div>

           {activeCall === 'video' && (
               <div className="absolute bottom-32 right-6 w-24 h-36 md:w-32 md:h-48 bg-[#121826] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center">
                   <IoMdCamera size={30} className="text-white/20" />
                   <span className="absolute bottom-2 text-[10px] text-white/50 font-bold uppercase tracking-widest">You</span>
               </div>
           )}

           <div className="absolute bottom-12 flex gap-6 z-10">
              <button onClick={() => setActiveCall(null)} className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-transform hover:scale-110 active:scale-95">
                 <IoMdClose size={30} className="text-white" />
              </button>
           </div>
        </div>
      )}

      {/* 🌟 IN-APP CAMERA & FILTER OVERLAY 🌟 */}
      {isCameraOpen && (
        <div className="absolute inset-0 z-[999999] bg-[#05070A] flex flex-col overflow-hidden">
          <div className="absolute top-0 w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
            <button onClick={closeCamera} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-red-500 transition-colors">
              <IoMdClose size={24} />
            </button>
            <div className="flex items-center gap-2">
               {isRecording && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
               <span className="text-white font-bold tracking-widest text-xs uppercase shadow-black drop-shadow-md">
                 {isRecording ? 'Recording...' : 'Live Lens'}
               </span>
            </div>
            <button onClick={toggleCameraFacing} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          <div className="relative flex-1 w-full h-full bg-black">
            <video 
              ref={videoRef} 
              autoPlay playsInline muted 
              className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`} 
              style={{ filter: filters[activeFilter].css }} 
            />
          </div>

          <div className="absolute bottom-0 w-full flex flex-col items-center pb-8 pt-16 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
            <div className="flex gap-6 mb-4 text-[11px] font-black tracking-widest text-white drop-shadow-md">
              <button onClick={() => setCameraMode('photo')} className={`transition-all duration-300 ${cameraMode === 'photo' ? 'text-[#00F0FF] scale-125' : 'text-gray-400'}`}>PHOTO</button>
              <button onClick={() => setCameraMode('video')} className={`transition-all duration-300 ${cameraMode === 'video' ? 'text-[#ff3366] scale-125' : 'text-gray-400'}`}>VIDEO</button>
            </div>

            <div className="w-full overflow-x-auto no-scrollbar flex gap-4 px-6 mb-6 snap-x">
              {filters.map((f, i) => (
                <button key={i} onClick={() => setActiveFilter(i)} className={`snap-center shrink-0 w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 ${activeFilter === i ? 'border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF] scale-110 shadow-[0_0_20px_rgba(0,240,255,0.5)]' : 'border-white/20 bg-black/50 text-gray-300 hover:border-white/50 backdrop-blur-md'}`}>
                  <span className="text-[10px] font-black tracking-wider uppercase">{f.name}</span>
                </button>
              ))}
            </div>

            <button onClick={handleCaptureClick} className={`w-20 h-20 rounded-full border-[5px] flex items-center justify-center p-1 transition-all ${isRecording ? 'border-red-500 scale-110' : 'border-white/50 active:scale-95'}`}>
              <div className={`w-full h-full transition-all ${cameraMode === 'video' ? (isRecording ? 'bg-red-500 rounded-lg scale-50' : 'bg-red-500 rounded-full') : 'bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]'}`}></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}