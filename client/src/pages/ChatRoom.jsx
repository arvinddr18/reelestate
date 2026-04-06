import EmojiPicker from 'emoji-picker-react';
import AnimatedMessageBubble from '../components/AnimatedMessageBubble';
import React, { useState, useEffect, useRef } from 'react';
import { IoMdArrowBack, IoMdSend, IoMdMore, IoMdImage, IoMdMic, IoMdClose, IoMdCamera, IoMdAdd, IoMdCheckmark, IoMdDocument, IoMdPin, IoMdFolder, IoMdTrash, IoLogoWhatsapp, IoLogoInstagram, IoLogoFacebook, IoMdChatboxes } from 'react-icons/io';
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
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [toast, setToast] = useState(null); 
  const [forwardMsg, setForwardMsg] = useState(null);
  const [deleteMenuMsg, setDeleteMenuMsg] = useState(null); // 🚨 ADD THIS NEW STATE!
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingTab, setActiveSettingTab] = useState('appearance');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // Tells us if there are more older messages to load
  const chatContainerRef = useRef(null); // Helps us track where the user is scrolling
  
  // 🌟 DRAG & CALL STATES 🌟
  const [isDragging, setIsDragging] = useState(null); // 'audio' | 'video' | null
  const [startY, setStartY] = useState(0);
  const [audioDrag, setAudioDrag] = useState(0);
  const [videoDrag, setVideoDrag] = useState(0);
  const [activeCall, setActiveCall] = useState(null); // 'audio' | 'video' | null
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 🚨 Add this new line!

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
      // 🚨 THE FIX: Re-enable AutoGain for Laptops, but keep Noise Suppression!
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true // <-- Turn this back to TRUE so your laptop mic can hear you!
        } 
      });

      // Keep the high-quality bitrate for crisp audio
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
      const token = localStorage.getItem('nodexa_token');
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
  // 🌟 1. HISTORY FETCHING (PAGINATION) 🌟
  // ==========================================
  useEffect(() => {
    if (!room || !myId || !friendId) return;

    const fetchChatHistory = async () => {
      if (!hasMore) return; 
      if (page === 1) setIsLoading(true); // Only show spinner on first load

      try {
        const token = localStorage.getItem('nodexa_token');
        const res = await axios.get(`${API_URL}/api/messages/${room}?page=${page}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.length < 50) {
          setHasMore(false); // We hit the end of history!
        }

        if (page === 1) {
          setMessages(res.data);
        } else {
          // Add older messages to the TOP of the chat
          setMessages((prev) => [...res.data, ...prev]); 
        }
      } catch (err) { 
        console.error(err); 
      } finally {
        setIsLoading(false); 
      }
    };
    
    fetchChatHistory();
  }, [room, myId, friendId, page]); // <--- 🚨 'page' IS HERE! Now it fetches when you scroll!

  // ==========================================
  // 🌟 2. LIVE SOCKET CONNECTIONS 🌟
  // ==========================================
  useEffect(() => {
    if (!room || !myId || !friendId) return;
    
    socket.emit('join_room', room);
    
    const onConnect = () => socket.emit('join_room', room);
    socket.on('connect', onConnect);
    socket.on('receive_message', (data) => setMessages((prev) => [...prev, data]));
    socket.on('display_typing', () => setIsTyping(true));
    socket.on('hide_typing', () => setIsTyping(false));
   
    socket.on('message_updated', (data) => {
      setMessages((prev) => prev.map((m) => {
        const isSameId = m._id && data.modifiedMsg._id && m._id === data.modifiedMsg._id;
        const isSameTime = m.timestamp && data.modifiedMsg.timestamp && m.timestamp === data.modifiedMsg.timestamp;
        return (isSameId || isSameTime) ? data.modifiedMsg : m;
      }));
    });
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('receive_message'); 
      socket.off('display_typing'); 
      socket.off('hide_typing');
      socket.off('message_updated'); 
    };
  }, [room, myId, friendId]); // <--- 🚨 No 'page' here, so sockets don't restart when scrolling!
  
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

 const handleScroll = (e) => {
    // 🚨 Changed to <= 2 to fix mobile/sub-pixel scrolling bugs!
    if (e.target.scrollTop <= 2 && !isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1); 
    }
  };

  // ==========================================
  // 🌟 MESSAGE ACTION FUNCTIONS 🌟
  // ==========================================
  const handleDeleteMessage = (msgToDelete) => {
    // Opens the new Smart Delete Menu!
    setDeleteMenuMsg(msgToDelete);
  };

  const executeSmartDelete = async (action) => {
    if (!deleteMenuMsg) return;

    const token = localStorage.getItem('nodexa_token');

    if (action === 'for_me') {
      // 1. Remove from screen instantly (🚨 FIX: Strict ID or Millisecond matching)
      setMessages((prev) => prev.filter((m) => {
        const isSameId = m._id && deleteMenuMsg._id && m._id === deleteMenuMsg._id;
        const isSameTime = m.timestamp && deleteMenuMsg.timestamp && m.timestamp === deleteMenuMsg.timestamp;
        return !(isSameId || isSameTime);
      }));
      
      // 2. Delete from Database permanently
      if (deleteMenuMsg._id) {
        try {
          await axios.delete(`${API_URL}/api/messages/${deleteMenuMsg._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) { console.error("Failed to delete from DB", err); }
      }

    } else {
      // 1. Create the modified version of the message
      let modifiedMsg = { ...deleteMenuMsg };
      if (action === 'for_everyone') {
        modifiedMsg.isDeleted = true;
        modifiedMsg.text = "⚠️ Message removed by sender";
      } else if (action === 'replace') {
        modifiedMsg.isReplaced = true;
        modifiedMsg.text = "Sorry, wrong message!";
      } else if (action === 'blur') {
        modifiedMsg.isBlurred = !modifiedMsg.isBlurred; 
      }

      // 2. Update screen (🚨 FIX: Strict ID or Millisecond matching)
      setMessages((prev) => prev.map((m) => {
        const isSameId = m._id && deleteMenuMsg._id && m._id === deleteMenuMsg._id;
        const isSameTime = m.timestamp && deleteMenuMsg.timestamp && m.timestamp === deleteMenuMsg.timestamp;
        return (isSameId || isSameTime) ? modifiedMsg : m;
      }));

      // 3. Emit the live change to your friend's screen
      socket.emit('update_message', { room, modifiedMsg });

      // 4. Save to Database
      if (modifiedMsg._id) {
        try {
          await axios.put(`${API_URL}/api/messages/${modifiedMsg._id}`, modifiedMsg, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) { console.error("Failed to update DB", err); }
      }
    }
    
    // Close the menu
    setDeleteMenuMsg(null); 
  };

  const handleEditMessage = (msgToEdit) => {
    // Double check the 5-minute limit just in case!
    const msgTime = new Date(msgToEdit.createdAt || msgToEdit.timestamp || Date.now()).getTime();
    if (Date.now() - msgTime > 5 * 60 * 1000) {
      alert("Messages can only be edited within 5 minutes of sending.");
      return;
    }
    setEditingMessage(msgToEdit);
    setMessage(msgToEdit.text); // Puts old text in the box
  };

  const handleSaveMessage = (msgToSave) => {
    // Show a sleek toast notification for 3 seconds instead of an alert!
    setToast("⭐ Message saved securely!");
    setTimeout(() => setToast(null), 3000);
  };

  const handleForwardMessage = (msgToForward) => {
    // Opens the new Forward Modal UI!
    setForwardMsg(msgToForward);
  };

const handleExternalShare = async (platform) => {
    if (!forwardMsg) return;
    
    // 🚨 SUPER CLEAN FORMATTING 🚨
    const textToShare = `↪ Forwarded from Nodexa\n${forwardMsg.text || "📸 Secure Media Attachment"}`;
    
    const encodedText = encodeURIComponent(textToShare);
    const appUrl = encodeURIComponent(window.location.origin);

    try {
      if (platform === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${appUrl}&quote=${encodedText}`, '_blank');
      } else if (platform === 'sms') {
        window.open(`sms:?body=${encodedText}`, '_self');
      } else if (platform === 'instagram') {
        // 🚨 INSTAGRAM FIX: They block auto-pasting, so we copy it to clipboard first!
        await navigator.clipboard.writeText(textToShare);
        
        // Show a quick toast notification
        setToast("📋 Text Copied! Paste it in Instagram.");
        setTimeout(() => setToast(null), 3000);
        
        // Open Instagram Inbox (works on both Mobile Apps and PC Web)
        setTimeout(() => {
          window.open('https://www.instagram.com/direct/inbox/', '_blank');
        }, 800);
        
      } else if (platform === 'native') {
        if (navigator.share) {
          await navigator.share({ text: textToShare });
        }
      }
      setForwardMsg(null); 
    } catch (err) {
      console.error("Error sharing:", err);
      setToast("Failed to share message.");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedImage && !selectedVideo) || !room || !myId) return;

    const token = localStorage.getItem('nodexa_token');

   if (editingMessage) {
      let modifiedMsg = { ...editingMessage, text: message, isEdited: true };

      // 1. Update your screen IN PLACE instantly (🚨 FIX: Strict Millisecond matching)
      setMessages((prev) => prev.map((m) => {
        const isSameId = m._id && editingMessage._id && m._id === editingMessage._id;
        const isSameTime = m.timestamp && editingMessage.timestamp && m.timestamp === editingMessage.timestamp;
        return (isSameId || isSameTime) ? modifiedMsg : m;
      }));
      
      // 2. Tell friend's screen to update IN PLACE instantly
      socket.emit('update_message', { room, modifiedMsg });

      // 3. Save edit to Database
      if (modifiedMsg._id) {
        try {
          await axios.put(`${API_URL}/api/messages/${modifiedMsg._id}`, { text: message, isEdited: true }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) { console.error("Edit failed", err); }
      }

      setEditingMessage(null);
      setMessage('');
      return; // Stop here so it doesn't send a new message!
    }

    // 🚨 IF NORMAL SEND (NEW MESSAGE) 🚨
    const messageData = {
      room,
      text: message,
      image: selectedImage,
      video: selectedVideo,
      audio: null,
      replyTo: replyingTo ? { text: replyingTo.text, senderId: replyingTo.senderId } : null,
      senderId: myId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(), // <-- Added to track the 5 mins!
    };

    setMessages((prev) => [...prev, messageData]);
    setMessage('');
    setSelectedImage(null); 
    setSelectedVideo(null);
    setShowEmojiPicker(false);
    setReplyingTo(null); 
    socket.emit('send_message', messageData);

    try {
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
            {/* 🚨 ADD THE onClick EVENT TO THIS BUTTON 🚨 */}
            <button onClick={() => setShowSettings(true)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white backdrop-blur-md group">
              <IoMdMore size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. FLEX-1 MESSAGES */}
      <div 
        ref={chatContainerRef} 
        onScroll={handleScroll} 
        className="flex-1 min-h-0 relative w-full overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-6 no-scrollbar z-10"
      >
        <div className="flex justify-center mb-2 mt-2"></div>
        <div className="flex justify-center mb-2 mt-2">
          <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[9px] font-black text-gray-400 tracking-widest uppercase shadow-lg">Encryption Started • Today</span>
        </div>

        {/* 🌟 THE GLOWING LOADING SPINNER 🌟 */}
        {isLoading ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#00f0ff] animate-spin shadow-[0_0_15px_rgba(0,240,255,0.5)]"></div>
              <div className="absolute inset-2 rounded-full border-[3px] border-transparent border-b-[#bc00dd] animate-spin shadow-[0_0_15px_rgba(188,0,221,0.5)]" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#00f0ff] animate-pulse drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">Decrypting...</span>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === myId;
            return (
              <div key={index} className={`flex w-full group transform transition-all duration-300 ${isMe ? 'justify-end hover:-translate-x-1' : 'justify-start hover:translate-x-1'}`}>
                <div className={`max-w-[85%] md:max-w-[65%] flex flex-col relative z-20 ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* 🌟 1. THE MAGIC "W-FIT" WRAPPER (Fixes the short message bug!) 🌟 */}
                  <div className={`relative w-fit flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    
                    {/* 🌟 2. ORIGINAL SMART DELETE MODAL (NOW INLINE & CENTERED ON EDGE) 🌟 */}
                    {deleteMenuMsg && ((deleteMenuMsg._id && msg._id && deleteMenuMsg._id === msg._id) || (deleteMenuMsg.timestamp && msg.timestamp && deleteMenuMsg.timestamp === msg.timestamp)) && (
                      <>
                        <div className="fixed inset-0 z-[90]" onClick={() => setDeleteMenuMsg(null)}></div>
                        
                        {/* Positions perfectly to the left or right of the bubble center! */}
                        <div className={`absolute z-[100] top-1/2 -translate-y-1/2 ${isMe ? 'right-full mr-3' : 'left-full ml-3'}`}>
                          
                          {/* The beautiful original design! */}
                          <div className="w-[260px] md:w-[320px] bg-[#121826] border border-red-500/30 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.3)] p-4 md:p-5 flex flex-col animate-in zoom-in-75 duration-300">
                            
                            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                              <h3 className="text-white font-black tracking-wide text-sm md:text-base flex items-center gap-2">
                                <span className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">🗑️</span> Options
                              </h3>
                              <button onClick={() => setDeleteMenuMsg(null)} className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors">
                                <IoMdClose size={14} />
                              </button>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <button onClick={() => executeSmartDelete('for_me')} className="flex items-center gap-3 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all hover:scale-[1.02] text-left group border border-transparent hover:border-white/20">
                                <span className="text-lg">👤</span>
                                <div className="flex flex-col">
                                  <span className="text-white font-bold text-xs group-hover:text-gray-200">Remove for me</span>
                                </div>
                              </button>

                              {isMe && (
                                <>
                                  <button onClick={() => executeSmartDelete('replace')} className="flex items-center gap-3 p-2.5 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 rounded-xl transition-all hover:scale-[1.02] text-left group border border-transparent hover:border-[#00f0ff]/40">
                                    <span className="text-lg">📝</span>
                                    <div className="flex flex-col">
                                      <span className="text-[#00f0ff] font-bold text-xs">Replace message</span>
                                    </div>
                                  </button>

                                  <button onClick={() => executeSmartDelete('blur')} className="flex items-center gap-3 p-2.5 bg-[#bc00dd]/10 hover:bg-[#bc00dd]/20 rounded-xl transition-all hover:scale-[1.02] text-left group border border-transparent hover:border-[#bc00dd]/40">
                                    <span className="text-lg">{msg.isBlurred ? '👁️' : '🌫️'}</span>
                                    <div className="flex flex-col">
                                      <span className="text-[#bc00dd] font-bold text-xs">{msg.isBlurred ? 'Unblur message' : 'Blur message'}</span>
                                    </div>
                                  </button>

                                  <button onClick={() => executeSmartDelete('for_everyone')} className="flex items-center gap-3 p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all hover:scale-[1.02] text-left group border border-transparent hover:border-red-500/40">
                                    <span className="text-lg">🌍</span>
                                    <div className="flex flex-col">
                                      <span className="text-red-400 font-bold text-xs">Delete for everyone</span>
                                    </div>
                                  </button>
                                </>
                              )}
                            </div>

                          </div>
                        </div>
                      </>
                    )}

                    {/* 🌟 NEW FORWARDED TAG UI 🌟 */}
                    {msg.isForwarded && (
                      <div className={`flex items-center gap-1 mb-1 opacity-90 italic ${isMe ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
                        <span className="text-[10px] font-black tracking-widest uppercase text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                          ↪ Forwarded from Nodexa
                        </span>
                      </div>
                    )}

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
                      <AnimatedMessageBubble 
                        msg={msg} 
                        isMe={isMe} 
                        onReply={() => setReplyingTo(msg)}
                        onDelete={handleDeleteMessage}
                        onEdit={handleEditMessage}
                        onSave={handleSaveMessage}
                        onForward={handleForwardMessage}
                      />
                    )}

                  </div> 
                  {/* 👆 CLOSES THE W-FIT WRAPPER 👆 */}


                  {/* Timestamp & Checkmarks */}
                  <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    
                    {/* 🚨 THE UPDATED TIME SPAN WITH THE (edited) TAG 🚨 */}
                    <span className={`text-[10px] font-semibold tracking-wider ${isMe ? 'text-white/70 drop-shadow-sm' : 'text-gray-500'}`}>
                      {msg.time} {msg.isEdited && <span className="italic opacity-60 ml-1 text-[9px]">(edited)</span>}
                    </span>

                    {/* Checkmarks */}
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
          })
        )}
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
        <>
        {/* 🌟 REPLYING TO POPUP UI 🌟 */}
        {replyingTo && (
          <div className="w-full max-w-3xl mx-auto mb-2 flex items-center justify-between bg-[#1A1F2E]/95 backdrop-blur-2xl border-l-[3px] border-[#00f0ff] p-2 md:p-3 rounded-r-xl rounded-l-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-2">
            <div className="flex flex-col overflow-hidden">
              <span className="text-[#00f0ff] text-[10px] font-black uppercase tracking-widest mb-0.5">
                Replying to {replyingTo.senderId === myId ? 'Yourself' : chatUser.fullName}
              </span>
              <span className="text-gray-300 text-xs md:text-sm truncate max-w-[200px] md:max-w-[400px]">
                {replyingTo.text || 'Attachment'}
              </span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
              <IoMdClose size={16} />
            </button>
          </div>
          )}
          
          {/* 🌟 EDITING POPUP UI 🌟 */}
        {editingMessage && (
          <div className="w-full max-w-3xl mx-auto mb-2 flex items-center justify-between bg-[#1A1F2E]/95 backdrop-blur-2xl border-l-[3px] border-[#ffbb00] p-2 md:p-3 rounded-r-xl rounded-l-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-2">
            <div className="flex flex-col overflow-hidden">
              <span className="text-[#ffbb00] text-[10px] font-black uppercase tracking-widest mb-0.5 flex items-center gap-1">
                ✏️ Editing Message
              </span>
              <span className="text-gray-300 text-xs md:text-sm truncate max-w-[200px] md:max-w-[400px]">
                {editingMessage.text}
              </span>
            </div>
            <button onClick={() => { setEditingMessage(null); setMessage(''); }} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
              <IoMdClose size={16} />
            </button>
          </div>
        )}
        

        

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

            {/* 1. LEFT SIDE: ADD & CAMERA BUTTONS (Hides when typing) */}
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
            
            {/* 2. 🌟 EMOJI BUTTON (Always visible, moved to the LEFT) 🌟 */}
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`w-8 h-8 md:w-9 md:h-9 ml-1 md:ml-2 mr-1 rounded-full flex items-center justify-center transition-all shrink-0 border border-transparent ${showEmojiPicker ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/15 text-[#ffbb00] hover:text-white hover:border-[#ffbb00]/30'}`}>
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 drop-shadow-[0_0_5px_rgba(255,187,0,0.5)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 8c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-7 0c.83 0 1.5.67 1.5 1.5S9.33 13 8.5 13 7 12.33 7 11.5 7.67 10 8.5 10zm3.5 6.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
              </svg>
            </button>

            {/* 3. TEXT INPUT */}
            <input 
              type="text" 
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                socket.emit('typing', room); 
              }}
              onBlur={() => socket.emit('stop_typing', room)}
              placeholder="Message..."
              className={`flex-1 bg-transparent text-white text-[16px] md:text-[15px] outline-none placeholder-gray-400 font-medium min-w-0 transition-all duration-300 pl-1`}
            />

            {/* 🌟 EMOJI PICKER POPUP (Also moved left!) 🌟 */}
            {showEmojiPicker && (
              <div className="absolute bottom-[120%] left-0 md:left-12 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-200 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/10">
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

            {/* 4. RIGHT SIDE: MIC BUTTON ONLY (Hides when typing) */}
            <div className={`flex items-center transition-all duration-300 ease-in-out origin-right overflow-hidden ${message.length > 0 ? 'w-0 opacity-0 scale-50' : 'w-8 md:w-10 opacity-100 scale-100 mr-1 md:mr-2'}`}>
              <button type="button" onClick={startRecordingAudio} className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-transparent hover:bg-[#ff3366]/10 flex items-center justify-center text-gray-400 hover:text-[#ff3366] transition-all shrink-0">
                <IoMdMic size={18} className="relative z-10 md:text-[22px]" />
              </button>
            </div>

            {/* 5. SEND BUTTON */}
            <button type="submit" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-[#801fd6] to-[#c11f70] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_15px_rgba(193,31,112,0.5)] shrink-0 mr-0.5 md:mr-1">
              <IoMdSend size={18} className="translate-x-[1px]" />
            </button>
          </form>
          </>
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
      {/* 🌟 CUSTOM TOAST NOTIFICATION 🌟 */}
      {toast && (
        <div className="absolute top-24 md:top-32 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 bg-[#1A1F2E]/95 border border-[#00f0ff]/50 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] backdrop-blur-xl text-white text-sm font-bold tracking-wide flex items-center gap-2 animate-in slide-in-from-top-5 fade-in duration-300">
          {toast}
        </div>
      )}

     {/* 🌟 FORWARD MESSAGE MODAL 🌟 */}
      {forwardMsg && (
        <div className="absolute inset-0 z-[99999] bg-[#05070A]/80 backdrop-blur-md flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[400px] bg-[#121826]/95 backdrop-blur-3xl border border-white/10 md:border-[#00f0ff]/30 rounded-t-3xl md:rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.15)] p-6 flex flex-col animate-in slide-in-from-bottom-10 duration-300 relative overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 bg-gradient-to-b from-[#00f0ff]/10 to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-5 relative z-10">
              <h3 className="text-white font-black tracking-wide text-lg flex items-center gap-2">
                <span className="text-[#00f0ff]">📤</span> Share Message
              </h3>
              <button onClick={() => setForwardMsg(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500/30 transition-colors">
                <IoMdClose size={18} />
              </button>
            </div>
            
            {/* Message Preview Snippet */}
            <div className="bg-black/50 p-3 rounded-xl border border-white/5 border-l-[3px] border-l-[#00f0ff] mb-6 text-gray-300 text-sm truncate shadow-inner relative z-10">
              <span className="opacity-50 text-[10px] block uppercase tracking-widest font-bold mb-1">Preview</span>
              {forwardMsg.text || "📸 Encrypted Media Attachment"}
            </div>

            {/* 1. IN-APP NETWORK (Horizontal Scroll) */}
            <div className="relative z-10 mb-6">
              <p className="text-[10px] text-[#00f0ff] font-bold tracking-widest uppercase mb-3 pl-1">Send to Network</p>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
                
                {/* Note: Map through your actual 'friends' array here later! */}
                {['John Doe', 'Alice Smith', 'Bob Builder', 'Emma Watson'].map((name, i) => (
                  <button key={i} onClick={() => { setToast(`Forwarded to ${name}`); setTimeout(() => setToast(null), 2000); setForwardMsg(null); }} className="flex flex-col items-center gap-2 shrink-0 group w-[60px]">
                    <div className="w-12 h-12 rounded-full p-[1.5px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                       <div className="w-full h-full bg-[#1E2532] rounded-full border-2 border-[#121826] flex items-center justify-center text-white font-bold text-sm">
                         {name.split(' ').map(n => n[0]).join('')}
                       </div>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#00f0ff] truncate w-full text-center transition-colors">
                      {name.split(' ')[0]}
                    </span>
                  </button>
                ))}
                
              </div>
            </div>

            {/* 2. EXTERNAL APPS GRID */}
            <div className="relative z-10">
              <p className="text-[10px] text-[#bc00dd] font-bold tracking-widest uppercase mb-3 pl-1">Share via Apps</p>
              
              <div className="grid grid-cols-4 gap-3">
                {/* WhatsApp */}
                <button onClick={() => handleExternalShare('whatsapp')} className="flex flex-col items-center gap-2 group">
                   <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(37,211,102,0.1)] group-hover:shadow-[0_5px_20px_rgba(37,211,102,0.4)] group-hover:-translate-y-1">
                      <IoLogoWhatsapp size={26} />
                   </div>
                   <span className="text-[9px] font-bold tracking-wide text-gray-500 group-hover:text-gray-200">WhatsApp</span>
                </button>

                {/* Instagram / Native */}
                <button onClick={() => handleExternalShare('instagram')} className="flex flex-col items-center gap-2 group">
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f9ce34]/10 via-[#ee2a7b]/10 to-[#6228d7]/10 border border-[#ee2a7b]/30 flex items-center justify-center text-[#ee2a7b] group-hover:from-[#f9ce34] group-hover:via-[#ee2a7b] group-hover:to-[#6228d7] group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(238,42,123,0.1)] group-hover:shadow-[0_5px_20px_rgba(238,42,123,0.4)] group-hover:-translate-y-1">
                      <IoLogoInstagram size={26} />
                   </div>
                   <span className="text-[9px] font-bold tracking-wide text-gray-500 group-hover:text-gray-200">Instagram</span>
                </button>

                {/* Facebook */}
                <button onClick={() => handleExternalShare('facebook')} className="flex flex-col items-center gap-2 group">
                   <div className="w-14 h-14 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(24,119,242,0.1)] group-hover:shadow-[0_5px_20px_rgba(24,119,242,0.4)] group-hover:-translate-y-1">
                      <IoLogoFacebook size={26} />
                   </div>
                   <span className="text-[9px] font-bold tracking-wide text-gray-500 group-hover:text-gray-200">Facebook</span>
                </button>

                {/* SMS / System Native */}
                <button onClick={() => handleExternalShare('sms')} className="flex flex-col items-center gap-2 group">
                   <div className="w-14 h-14 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] group-hover:bg-[#00f0ff] group-hover:text-[#121826] transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.1)] group-hover:shadow-[0_5px_20px_rgba(0,240,255,0.4)] group-hover:-translate-y-1">
                      <IoMdChatboxes size={24} />
                   </div>
                   <span className="text-[9px] font-bold tracking-wide text-gray-500 group-hover:text-gray-200">Messages</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      


      {/* 🌟 SMART DELETE MODAL 🌟 */}
      {deleteMenuMsg && (
        <div className="absolute inset-0 z-[99999] bg-[#05070A]/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <div className="w-full md:w-[400px] bg-[#121826] border border-red-500/30 rounded-t-3xl md:rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.2)] p-6 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-black tracking-wide text-lg flex items-center gap-2">
                <span className="text-red-500">🗑️</span> Smart Delete
              </h3>
              <button onClick={() => setDeleteMenuMsg(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors">
                <IoMdClose size={18} />
              </button>
            </div>
            
           <div className="flex flex-col gap-3">
               
               {/* 1. ALWAYS VISIBLE: "Remove for me" (Works for both users' chats) */}
               <button onClick={() => executeSmartDelete('for_me')} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left group border border-transparent hover:border-white/20">
                  <span className="text-xl">👤</span>
                  <div className="flex flex-col">
                    <span className="text-white font-bold group-hover:text-gray-200 transition-colors">Remove for me</span>
                    <span className="text-xs text-gray-500">Delete only from your device</span>
                  </div>
               </button>

               {/* 🚨 SECURITY LOCK: ONLY SHOW THESE 3 IF YOU SENT THE MESSAGE 🚨 */}
               {deleteMenuMsg?.senderId === myId && (
                 <>
                   <button onClick={() => executeSmartDelete('for_everyone')} className="flex items-center gap-3 p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors text-left group border border-transparent hover:border-red-500/40">
                      <span className="text-xl">🌍</span>
                      <div className="flex flex-col">
                        <span className="text-red-400 font-bold group-hover:text-red-300 transition-colors">Delete for everyone</span>
                        <span className="text-xs text-red-500/70">Replaces text with a warning</span>
                      </div>
                   </button>

                   <button onClick={() => executeSmartDelete('replace')} className="flex items-center gap-3 p-3 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 rounded-xl transition-colors text-left group border border-transparent hover:border-[#00f0ff]/40">
                      <span className="text-xl">📝</span>
                      <div className="flex flex-col">
                        <span className="text-[#00f0ff] font-bold group-hover:text-[#80ffff] transition-colors">Replace with message</span>
                        <span className="text-xs text-[#00f0ff]/70">Changes to "Sorry, wrong message!"</span>
                      </div>
                   </button>

                   <button onClick={() => executeSmartDelete('blur')} className="flex items-center gap-3 p-3 bg-[#bc00dd]/10 hover:bg-[#bc00dd]/20 rounded-xl transition-colors text-left group border border-transparent hover:border-[#bc00dd]/40">
                      <span className="text-xl">{deleteMenuMsg?.isBlurred ? '👁️' : '🌫️'}</span>
                      <div className="flex flex-col">
                        <span className="text-[#bc00dd] font-bold group-hover:text-[#da80ff] transition-colors">
                          {deleteMenuMsg?.isBlurred ? 'Unblur message' : 'Blur message'}
                        </span>
                        <span className="text-xs text-[#bc00dd]/70">
                          {deleteMenuMsg?.isBlurred ? 'Reveals content visually' : 'Hides content visually'}
                        </span>
                      </div>
                   </button>
                 </>
               )}
            </div>

          </div>
        </div>
        )}
        {/* ========================================== */}
      {/* 🌟 PREMIUM SETTINGS MODAL (NEON GLASS) 🌟 */}
      {/* ========================================== */}
      {showSettings && (
        <div className="absolute inset-0 z-[999999] bg-[#05070A]/80 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300 p-2 md:p-6">
          
          <div className="w-full max-w-4xl h-[90vh] md:h-[80vh] bg-[#0a0514]/90 border border-[#bc00dd]/30 rounded-3xl shadow-[0_0_50px_rgba(188,0,221,0.15)] flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Background Nebula Effect */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#bc00dd] blur-[150px] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00f0ff] blur-[150px] opacity-10 pointer-events-none"></div>

            {/* HEADER FOR MOBILE (Close Button) */}
            <div className="md:hidden flex justify-between items-center p-4 border-b border-white/10 relative z-10 bg-[#0a0514]">
               <h2 className="text-white font-black tracking-widest uppercase">Chat Settings</h2>
               <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500/30">
                 <IoMdClose size={18} />
               </button>
            </div>

            {/* SIDEBAR TABS */}
            <div className="w-full md:w-[280px] shrink-0 border-r border-white/10 bg-black/20 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar relative z-10">
               <div className="hidden md:flex justify-between items-center mb-6 pl-2 pr-1">
                 <h2 className="text-white font-black tracking-widest text-sm uppercase opacity-50">Settings</h2>
                 <button onClick={() => setShowSettings(false)} className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500/30 transition-colors">
                   <IoMdClose size={16} />
                 </button>
               </div>

               {[
                 { id: 'appearance', icon: '🎨', label: 'Appearance' },
                 { id: 'notifications', icon: '🔔', label: 'Notifications' },
                 { id: 'privacy', icon: '🔒', label: 'Privacy & Security' },
                 { id: 'media', icon: '📁', label: 'Media & Files' },
                 { id: 'manage', icon: '⚙️', label: 'Chat Management' },
                 { id: 'user', icon: '👤', label: 'User Info' }
               ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveSettingTab(tab.id)}
                   className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 border text-left ${activeSettingTab === tab.id ? 'bg-[#bc00dd]/20 border-[#bc00dd]/50 shadow-[0_0_20px_rgba(188,0,221,0.2)] text-white' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                 >
                   <span className="text-lg">{tab.icon}</span>
                   <span className="font-bold text-sm tracking-wide hidden md:block">{tab.label}</span>
                 </button>
               ))}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar relative z-10">
              
              {/* 🎨 APPEARANCE TAB */}
              {activeSettingTab === 'appearance' && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 fade-in duration-300">
                  <h3 className="text-2xl font-black text-white tracking-wide mb-2 flex items-center gap-2"><span className="text-[#bc00dd]">🎨</span> Appearance</h3>
                  
                  {/* Setting Group */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                     <div>
                       <p className="text-white font-bold text-sm mb-3">Chat Theme</p>
                       <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
                         <button className="flex-1 py-2 rounded-lg text-gray-400 hover:text-white text-xs font-bold transition-all">Dark</button>
                         <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#801fd6] to-[#bc00dd] border border-[#bc00dd] text-white shadow-[0_0_15px_rgba(188,0,221,0.4)] text-xs font-bold transition-all">Neon</button>
                         <button className="flex-1 py-2 rounded-lg text-gray-400 hover:text-white text-xs font-bold transition-all">Glass</button>
                       </div>
                     </div>

                     <div>
                       <p className="text-white font-bold text-sm mb-3">Background</p>
                       <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
                         <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#0057FF] to-[#00F0FF] border border-[#00f0ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] text-xs font-bold transition-all">Galaxy</button>
                         <button className="flex-1 py-2 rounded-lg text-gray-400 hover:text-white text-xs font-bold transition-all">Gradient</button>
                         <button className="flex-1 py-2 rounded-lg text-gray-400 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1"><IoMdImage/> Upload</button>
                       </div>
                     </div>
                     
                     <div>
                       <p className="text-white font-bold text-sm mb-3">Bubble Style</p>
                       <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
                         <button className="flex-1 py-2 rounded-lg text-gray-400 hover:text-white text-xs font-bold transition-all">Rounded</button>
                         <button className="flex-1 py-2 rounded-lg text-gray-400 hover:text-white text-xs font-bold transition-all">Sharp</button>
                         <button className="flex-1 py-2 rounded-lg bg-white/10 border border-white/20 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)] text-xs font-bold transition-all">Glowing</button>
                       </div>
                     </div>
                  </div>
                </div>
              )}

              {/* 🔒 PRIVACY TAB */}
              {activeSettingTab === 'privacy' && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 fade-in duration-300">
                  <h3 className="text-2xl font-black text-white tracking-wide mb-2 flex items-center gap-2"><span className="text-[#00f0ff]">🔒</span> Privacy & Security</h3>
                  
                  <div className="bg-black/30 border border-white/5 rounded-2xl flex flex-col divide-y divide-white/5">
                     
                     <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                       <div>
                         <p className="text-white font-bold text-sm">Lock Chat</p>
                         <p className="text-gray-500 text-xs">Require Biometric / PIN to open</p>
                       </div>
                       <div className="w-11 h-6 bg-[#00f0ff]/20 rounded-full relative border border-[#00f0ff]/50 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                         <div className="w-4 h-4 bg-[#00f0ff] rounded-full absolute top-[3px] right-1 shadow-[0_0_10px_#00f0ff]"></div>
                       </div>
                     </div>

                     <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                       <div>
                         <p className="text-white font-bold text-sm">Hide Chat</p>
                         <p className="text-gray-500 text-xs">Move to secret vault</p>
                       </div>
                       <div className="w-11 h-6 bg-white/10 rounded-full relative border border-white/20 cursor-pointer">
                         <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-[3px] left-1"></div>
                       </div>
                     </div>

                     <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                       <div>
                         <p className="text-white font-bold text-sm">Screenshot Protection</p>
                         <p className="text-gray-500 text-xs">Block or warn on capture</p>
                       </div>
                       <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
                         <button className="px-3 py-1 rounded-lg text-gray-400 hover:text-white text-[10px] font-bold transition-all">Off</button>
                         <button className="px-3 py-1 rounded-lg text-gray-400 hover:text-white text-[10px] font-bold transition-all">Warn</button>
                         <button className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] text-[10px] font-bold transition-all">Block</button>
                       </div>
                     </div>

                     <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                       <div>
                         <p className="text-white font-bold text-sm">Read Receipts</p>
                         <p className="text-gray-500 text-xs">Show ✓✓ when read</p>
                       </div>
                       <div className="w-11 h-6 bg-[#bc00dd]/20 rounded-full relative border border-[#bc00dd]/50 cursor-pointer shadow-[0_0_10px_rgba(188,0,221,0.2)]">
                         <div className="w-4 h-4 bg-[#bc00dd] rounded-full absolute top-[3px] right-1 shadow-[0_0_10px_#bc00dd]"></div>
                       </div>
                     </div>

                  </div>
                </div>
              )}

              {/* 🔔 NOTIFICATIONS TAB */}
              {activeSettingTab === 'notifications' && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 fade-in duration-300">
                  <h3 className="text-2xl font-black text-white tracking-wide mb-2 flex items-center gap-2"><span className="text-[#ffbb00]">🔔</span> Notifications</h3>
                  
                  <div className="bg-black/30 border border-white/5 rounded-2xl flex flex-col divide-y divide-white/5">
                     <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                       <div>
                         <p className="text-white font-bold text-sm">Mute Notifications</p>
                         <p className="text-gray-500 text-xs">Disable alerts for this chat</p>
                       </div>
                       <select className="bg-black/50 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 outline-none">
                          <option>Off</option>
                          <option>1 Hour</option>
                          <option>8 Hours</option>
                          <option>Always</option>
                       </select>
                     </div>
                     <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                       <div>
                         <p className="text-white font-bold text-sm">Priority Mode</p>
                         <p className="text-gray-500 text-xs">Bypass DND settings</p>
                       </div>
                       <div className="w-11 h-6 bg-white/10 rounded-full relative border border-white/20 cursor-pointer">
                         <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-[3px] left-1"></div>
                       </div>
                     </div>
                     <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                       <div>
                         <p className="text-white font-bold text-sm">Smart Alerts</p>
                         <p className="text-gray-500 text-xs">Only notify on keywords (e.g. "urgent")</p>
                       </div>
                       <div className="w-11 h-6 bg-[#ffbb00]/20 rounded-full relative border border-[#ffbb00]/50 cursor-pointer shadow-[0_0_10px_rgba(255,187,0,0.2)]">
                         <div className="w-4 h-4 bg-[#ffbb00] rounded-full absolute top-[3px] right-1 shadow-[0_0_10px_#ffbb00]"></div>
                       </div>
                     </div>
                  </div>
                </div>
              )}

              {/* 📁 MEDIA & FILES TAB */}
              {activeSettingTab === 'media' && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 fade-in duration-300">
                  <h3 className="text-2xl font-black text-white tracking-wide mb-2 flex items-center gap-2"><span className="text-[#00ff9d]">📁</span> Media & Files</h3>
                  
                  <div className="bg-black/30 border border-white/5 rounded-2xl flex flex-col divide-y divide-white/5">
                     <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                       <div>
                         <p className="text-white font-bold text-sm">Auto-Download Media</p>
                         <p className="text-gray-500 text-xs">Save data usage</p>
                       </div>
                       <select className="bg-black/50 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 outline-none">
                          <option>Wi-Fi Only</option>
                          <option>Wi-Fi + Cellular</option>
                          <option>Never</option>
                       </select>
                     </div>
                     <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                       <div>
                         <p className="text-white font-bold text-sm">Image Quality</p>
                         <p className="text-gray-500 text-xs">Upload resolution</p>
                       </div>
                       <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
                         <button className="px-3 py-1 rounded-lg text-gray-400 hover:text-white text-[10px] font-bold transition-all">Standard</button>
                         <button className="px-3 py-1 rounded-lg bg-[#00ff9d]/20 border border-[#00ff9d] text-[#00ff9d] shadow-[0_0_10px_rgba(0,255,157,0.3)] text-[10px] font-bold transition-all">HD Quality</button>
                       </div>
                     </div>
                     <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                       <div>
                         <p className="text-white font-bold text-sm">Save to Gallery</p>
                         <p className="text-gray-500 text-xs">Auto-save received photos</p>
                       </div>
                       <div className="w-11 h-6 bg-[#00ff9d]/20 rounded-full relative border border-[#00ff9d]/50 cursor-pointer shadow-[0_0_10px_rgba(0,255,157,0.2)]">
                         <div className="w-4 h-4 bg-[#00ff9d] rounded-full absolute top-[3px] right-1 shadow-[0_0_10px_#00ff9d]"></div>
                       </div>
                     </div>
                  </div>
                </div>
              )}

              {/* ⚙️ CHAT MANAGEMENT TAB */}
              {activeSettingTab === 'manage' && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 fade-in duration-300">
                  <h3 className="text-2xl font-black text-white tracking-wide mb-2 flex items-center gap-2"><span className="text-white">⚙️</span> Chat Management</h3>
                  
                  <div className="bg-black/30 border border-white/5 rounded-2xl flex flex-col divide-y divide-white/5">
                     <button className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left group">
                       <div>
                         <p className="text-white font-bold text-sm group-hover:text-[#00f0ff] transition-colors">📌 Pin Chat</p>
                         <p className="text-gray-500 text-xs">Keep at top of list</p>
                       </div>
                     </button>
                     <button className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left group">
                       <div>
                         <p className="text-white font-bold text-sm group-hover:text-[#ffbb00] transition-colors">⭐ Mark as Important</p>
                         <p className="text-gray-500 text-xs">Highlight in inbox</p>
                       </div>
                     </button>
                     <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                       <div>
                         <p className="text-white font-bold text-sm">Export Chat</p>
                         <p className="text-gray-500 text-xs">Download history</p>
                       </div>
                       <button className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold transition-all">Format: PDF</button>
                     </div>
                     <button className="flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors text-left group">
                       <div>
                         <p className="text-red-500 font-bold text-sm drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">🧹 Clear Chat History</p>
                         <p className="text-red-500/60 text-xs">Permanently delete all messages</p>
                       </div>
                     </button>
                  </div>
                </div>
              )}

              {/* 👤 USER INFO TAB */}
              {activeSettingTab === 'user' && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 fade-in duration-300">
                  <div className="flex flex-col items-center justify-center p-6 bg-black/30 border border-white/5 rounded-2xl mb-2">
                     <div className="w-24 h-24 rounded-full border-4 border-[#bc00dd]/30 p-1 shadow-[0_0_30px_rgba(188,0,221,0.2)] mb-4">
                        <img src={chatUser.profilePhoto || "default"} className="w-full h-full rounded-full object-cover" alt="Profile" />
                     </div>
                     <h2 className="text-white font-black text-xl tracking-wide">{chatUser.fullName}</h2>
                     <p className="text-[#00f0ff] font-mono text-xs mt-1">@{chatUser.username}</p>
                     <p className="text-gray-400 text-xs mt-2 text-center max-w-xs">Quantum encryption secured channel. Network established.</p>
                  </div>
                  
                  <div className="bg-black/30 border border-white/5 rounded-2xl flex flex-col divide-y divide-white/5">
                     <button className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left group">
                       <IoMdPin className="text-gray-400 group-hover:text-[#00ff9d]" size={20} />
                       <span className="text-white font-bold text-sm">Request Live Location</span>
                     </button>
                     <button className="flex items-center gap-3 p-4 hover:bg-red-500/10 transition-colors text-left group">
                       <span className="text-xl opacity-80 group-hover:opacity-100">🚫</span>
                       <span className="text-red-500 font-bold text-sm">Block User</span>
                     </button>
                     <button className="flex items-center gap-3 p-4 hover:bg-red-500/10 transition-colors text-left group rounded-b-2xl">
                       <span className="text-xl opacity-80 group-hover:opacity-100">⚠️</span>
                       <span className="text-red-500 font-bold text-sm">Report Account</span>
                     </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}