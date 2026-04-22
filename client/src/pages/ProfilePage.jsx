import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import socketService from '../services/socket'; // 🚨 ADD THIS LINE!
import { motion, AnimatePresence } from 'framer-motion'; // 🚨 ADDED FRAMER MOTION
import PersonalInfo from '../components/settings/PersonalInfo';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  IoMdSettings, IoMdCamera, IoMdGrid, IoMdClose, IoMdCreate, 
  IoMdPin, IoMdCall, IoMdMail, IoMdArrowBack, IoMdBookmark, 
  IoMdHeart, IoMdCheckmarkCircle, IoMdTime, IoMdStar, IoMdShareAlt,
  IoMdPerson, IoMdLock, IoMdNotifications, IoMdCard, IoMdColorPalette,
  IoMdAnalytics, IoMdHelpCircle, IoMdInformationCircle,
  IoMdCheckmark, IoMdAdd, IoMdLogOut, IoMdFitness, IoMdHome, IoMdArrowDropdown, IoMdDesktop, IoMdPhonePortrait // 🚨 NEW ICONS ADDED HERE
} from 'react-icons/io';
import { MdOutlineDoubleArrow, MdShield, MdBlock, MdAutoAwesome, MdLaptopMac, MdSmartphone, MdNotificationsOff } from 'react-icons/md';
import PostCard from '../components/feed/PostCard'; 
import { useAuth } from '../context/AuthContext';

const getApiUrl = (endpoint) => {
  const base = import.meta.env.VITE_API_URL || '';
  return base.endsWith('/api') && endpoint.startsWith('/api') 
    ? base.replace('/api', '') + endpoint 
    : base + endpoint;
};

const resolveMediaUrl = (source) => {
  if (!source) return null;
  if (typeof source === 'object' && source.url) source = source.url;
  if (typeof source !== 'string') return null;
  if (source.startsWith('http') || source.startsWith('data:')) return source;
  const base = import.meta.env.VITE_API_URL || '';
  const cleanBase = base.endsWith('/api') ? base.replace('/api', '') : base;
  return `${cleanBase}${source.startsWith('/') ? '' : '/'}${source}`;
};

const getAuthConfig = () => {
  const token = localStorage.getItem('nodexa_token');
  return { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
};

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const { user: currentUser } = useAuth(); 

  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]); 
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('grid'); 
  const [loading, setLoading] = useState(true);

 // ─── NOD SYSTEM STATE ───
  const [isNodded, setIsNodded] = useState(false);
  const [showNoddedMenu, setShowNoddedMenu] = useState(false);

  // 🚨 Indestructible logic that checks both ID and _ID formats
// ✅ REPLACE WITH THIS
useEffect(() => {
  if (user && currentUser) {
    // Backend sends isFollowing directly — trust it first!
    if (typeof user.isFollowing === 'boolean') {
      setIsNodded(user.isFollowing);
      return;
    }
    // Fallback check
    const myId = String(currentUser._id || currentUser.id);
    const followersArray = user.followers || [];
    const inFollowers = followersArray.some(f => String(f._id || f.id || f) === myId);
    setIsNodded(inFollowers);
  }
}, [user, currentUser]);

useEffect(() => {
  if (user && currentUser) {
    const myId = String(currentUser._id || currentUser.id);
    const targetId = String(user._id || user.id);
    
    const followersArray = user.followers || [];
    const followingArray = currentUser.following || [];

    const inFollowers = followersArray.some(f => String(f._id || f.id || f) === myId);
    const inFollowing = followingArray.some(f => String(f._id || f.id || f) === targetId);

    setIsNodded(inFollowers || inFollowing || user.isFollowing || false);
  }
}, [user, currentUser]);

  const handleNod = async () => {
    if (!currentUser) return;

    // 1. Instantly flip the UI switch
    const wasNodded = isNodded;
    setIsNodded(!wasNodded);
    
    // 2. Update the local array AND the count so React agrees with our click
    setUser(prev => {
      if (!prev) return prev;
      
      let updatedFollowers = [...(prev.followers || [])];
      
      if (wasNodded) {
        // Un-Nodding: Remove your ID from their array
        updatedFollowers = updatedFollowers.filter(f => String(f._id || f) !== String(currentUser._id));
      } else {
        // Nodding: Add your ID to their array
        updatedFollowers.push(currentUser._id);
      }

      return {
        ...prev,
        followers: updatedFollowers,
        followersCount: Math.max(0, (prev.followersCount || 0) + (wasNodded ? -1 : 1))
      };
    });

    try {
      // 3. Send to backend in the background
      await api.post(`/users/${user._id}/follow`);
    } catch (error) {
      // Revert if the server completely fails (No internet, etc.)
      setIsNodded(wasNodded);
      setUser(prev => {
        if (!prev) return prev;
        let updatedFollowers = [...(prev.followers || [])];
        if (!wasNodded) {
          updatedFollowers = updatedFollowers.filter(f => String(f._id || f) !== String(currentUser._id));
        } else {
          updatedFollowers.push(currentUser._id);
        }
        return {
          ...prev,
          followers: updatedFollowers,
          followersCount: Math.max(0, (prev.followersCount || 0) + (wasNodded ? 1 : -1))
        };
      });
      console.error("Nod failed:", error);
    }
  };


  const [isEditing, setIsEditing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  // ── 🚨 ACCOUNT SWITCHER STATE ──
  // ── 🚨 REAL-TIME ACCOUNT SWITCHER STATE ──
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const accountMenuRef = useRef(null);

  // 1. Fetch saved accounts from Local Storage
  useEffect(() => {
    try {
      const storedAccounts = JSON.parse(localStorage.getItem('nodexa_saved_accounts')) || [];
      // Filter out the currently active user so they don't show up in the "Other Accounts" list
      const others = storedAccounts.filter(acc => String(acc.user._id) !== String(currentUser?._id));
      setSavedAccounts(others);
    } catch (error) {
      console.error("Error loading saved accounts:", error);
    }
  }, [currentUser]);

  // 2. Handle Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Switch Account Action
  const handleSwitchAccount = (account) => {
    localStorage.setItem('nodexa_token', account.token); // Swap the active token
    window.location.reload(); // Reload to hydrate the app with the new user's data
  };

  // 🚨 ADD THIS NEW FUNCTION: Temporarily clears active session to bypass the Auth Guard
  const handleAddAccountFlow = (route) => {
    localStorage.removeItem('nodexa_token'); // Only removes current active user
    // Note: We DO NOT remove 'nodexa_saved_accounts' here, so your vault is safe!
    window.location.href = route; // Hard redirect bypasses React Router's logged-in check
  };

 // 4. Logout All Action (THE KILLSWITCH)
  const handleLogoutAll = async () => {
    try {
      // 1. Tell the backend to wipe all sessions from the database
      await api.post('/auth/logout-all');
      
      // 2. Clear the local storage vault on this device
      localStorage.removeItem('nodexa_token');
      localStorage.removeItem('nodexa_saved_accounts'); 
      
      // 3. Send them back to the login screen
      window.location.href = '/login';
    } catch (error) {
      console.error("Killswitch failed:", error);
      // Fallback: still log them out locally even if the server fails
      localStorage.removeItem('nodexa_token');
      window.location.href = '/login';
    }
  };

  // ── 🚨 PASSWORD VAULT STATE ──
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ error: '', success: '', loading: false });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ error: '', success: '', loading: true });
    
    try {
      // Send the passwords to the new secure backend route we just made!
      const res = await api.put('/auth/change-password', passwordData);
      
      setPasswordStatus({ error: '', success: 'Password successfully updated! 🛡️', loading: false });
      
      // Close the modal automatically after 2 seconds
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '' });
        setPasswordStatus({ error: '', success: '', loading: false });
      }, 2000);
      
    } catch (err) {
      setPasswordStatus({ 
        error: err.response?.data?.message || 'Failed to update password. Try again.', 
        success: '', 
        loading: false 
      });
    }
  };

// ── 🚨 ACCOUNT RECOVERY STATE ──
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [backupEmail, setBackupEmail] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState({ error: '', success: '', loading: false });

  // Update local state when user data loads
  useEffect(() => {
    if (user?.backupEmail) setBackupEmail(user.backupEmail);
  }, [user]);

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setRecoveryStatus({ error: '', success: '', loading: true });
    
    try {
      // Reusing your powerful update route to save the backup email!
      const payload = { backupEmail: backupEmail };
      await axios.put(getApiUrl('/api/users/update'), payload, getAuthConfig());
      
      // Update local user state so it reflects instantly
      setUser(prev => ({ ...prev, backupEmail: backupEmail }));
      setRecoveryStatus({ error: '', success: 'Recovery email secured! 🛡️', loading: false });
      
      // Close modal automatically
      setTimeout(() => {
        setShowRecoveryModal(false);
        setRecoveryStatus({ error: '', success: '', loading: false });
      }, 2000);
    } catch (err) {
      setRecoveryStatus({ 
        error: err.response?.data?.message || 'Failed to update recovery info.', 
        success: '', 
        loading: false 
      });
    }
  };

  // ───────────────────────────────
  const [settingsTab, setSettingsTab] = useState('personal');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({ 
    fullName: '', bio: '', location: '', phone: '', website: '',
    isPrivate: false, hideActivity: false, emailAlerts: true, loginAlerts: true
  });

  const canEditProfile = !userId || String(userId) === String(currentUser?._id);

// ─── 🚨 REAL-TIME LIVE NODE RADAR (AUTO-CONNECTING) ───
  useEffect(() => {
    let cleanup;

    const setupRadar = () => {
      if (socketService.socket && user) {
        const handleStatusChange = (data) => {
          if (data.userId === String(user._id || user.id)) {
            setUser(prev => ({ ...prev, isOnline: data.isOnline }));
          }
        };
        // Turn on radar
        socketService.socket.on('user_status_change', handleStatusChange);
        return () => socketService.socket.off('user_status_change', handleStatusChange);
      }
      return null;
    };

    // Try immediately
    cleanup = setupRadar();

    // If socket isn't ready, keep trying every 1 second until it connects!
    const radarInterval = setInterval(() => {
      if (socketService.socket && !cleanup) {
        cleanup = setupRadar();
        if (cleanup) clearInterval(radarInterval);
      }
    }, 1000);

    return () => {
      clearInterval(radarInterval);
      if (cleanup) cleanup();
    };
  }, [user]);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = userId || currentUser?._id; 
        if (!id) return; 

        const res = await axios.get(getApiUrl(`/api/users/${id}`), getAuthConfig());
        
        const userData = res.data.data?.user || res.data.data || res.data;
        const postsData = res.data.data?.posts || res.data.posts || [];

        setUser(userData);
        setUserPosts(postsData);
       setFormData({
          fullName: userData.fullName || '',
          bio: userData.bio || '',
          location: userData.location || '',
          phone: userData.phone || '',
          website: userData.website || '',
          // 🚨 Bulletproof boolean checkers:
          isPrivate: userData.isPrivate !== undefined ? userData.isPrivate : true, 
          hideActivity: userData.hideActivity !== undefined ? userData.hideActivity : false,
          emailAlerts: userData.emailAlerts !== false,
          loginAlerts: userData.loginAlerts !== false,
        });
        setAvatarPreview(userData.profilePhoto || userData.avatar || null);

        if (canEditProfile) {
          try {
            const savedRes = await axios.get(getApiUrl('/api/posts/saved'), getAuthConfig());
            setSavedPosts(savedRes.data.data || savedRes.data || []);
          } catch (e) {
            console.log("Could not fetch saved posts", e);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser !== undefined) {
      fetchProfile();
    }
  }, [userId, currentUser, canEditProfile]);

  // ── 🚨 AUTO-SAVE: LOGIN ALERTS ──
  const handleToggleLoginAlerts = async () => {
    // 1. Figure out the new value (opposite of what it is now)
    const newValue = !formData.loginAlerts;
    
    // 2. Instantly update the UI so it feels incredibly fast
    setFormData(prev => ({ ...prev, loginAlerts: newValue }));

    try {
      // 3. Silently save it to the database in the background!
      const payload = { ...formData, loginAlerts: newValue, profilePhoto: avatarPreview };
      await axios.put(getApiUrl('/api/users/update'), payload, getAuthConfig());
    } catch (err) {
      // 4. If the server fails, flip the toggle back and warn the user
      alert("Failed to save setting. Please check your connection.");
      setFormData(prev => ({ ...prev, loginAlerts: !newValue }));
    }
  };

 const handleUpdate = async () => {
    try {
      // 1. Prepare the data (including the new privacy toggle states)
      const payload = { ...formData, profilePhoto: avatarPreview };
      
      // 2. Send to backend
      const res = await axios.put(getApiUrl('/api/users/update'), payload, getAuthConfig());
      
      if(res.data.success) {
        // 3. Update the local user state instantly (No hard page refresh needed!)
        setUser(prev => ({ 
          ...prev, 
          ...formData,
          profilePhoto: avatarPreview || prev.profilePhoto
        }));
        
        // 4. Close the command center modal
        setIsEditing(false);
      }
    } catch (err) {
      alert(`Update Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const trustScore = Math.min(98, 70 + (userPosts.length * 2)); 

 return (
    <div className="min-h-screen bg-[#05070A] text-white font-sans pb-24 overflow-x-hidden relative">
      
      {/* ── BACKGROUND AMBIENCE ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-[#00F0FF]/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay" />
      </div>

     {/* ── STICKY TOP BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#05070A]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:text-[#00F0FF] transition-all active:scale-95">
            <IoMdArrowBack size={22} />
          </button>
          
          <div className="flex gap-2">
            {/* 3-DOT MENU (System Config) */}
            {canEditProfile && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#00F0FF] transition-all active:scale-95"
              >
                <div className="flex flex-col gap-1">
                  <span className="w-1 h-1 bg-current rounded-full"/>
                  <span className="w-1 h-1 bg-current rounded-full"/>
                  <span className="w-1 h-1 bg-current rounded-full"/>
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-24 relative z-10">
        
        {/* ── ASYMMETRICAL IDENTITY SECTION ── */}
        <div className="flex justify-between items-start mb-8">
          
          {/* LEFT: Info & Tags */}
          <div className="flex-1 pr-2">
            
            {/* 🚨 THE FIX: Only show if they haven't hidden it AND they are currently online (or if you are viewing your own profile) */}
            {!user?.hideActivity && (canEditProfile || user?.isOnline) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399] animate-pulse"/>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live Node</span>
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-2 mb-1 tracking-tight">
              {user?.fullName || user?.username}
              {user?.isVerified && <IoMdCheckmarkCircle className="text-[#0057FF]" size={24} />}
            </h1>
            <p className="text-sm text-gray-400 mb-4 font-medium">@{user?.username}</p>
            
            {user?.bio && (
              <div className="flex gap-2 text-gray-300 italic mb-4 max-w-[250px]">
                <span className="text-[#0057FF] font-black text-lg leading-none">"</span>
                <p className="text-sm leading-relaxed">{user.bio}</p>
                <span className="text-[#0057FF] font-black text-lg leading-none">"</span>
              </div>
            )}
            
            {/* Holographic Hashtags */}
            <div className="flex flex-wrap gap-2">
              {['#creator', '#aesthetic', '#nodexa'].map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-300 text-[10px] font-bold tracking-wider">{tag}</span>
              ))}
            </div>
          </div>

          {/* RIGHT: Avatar with Orbital Rings */}
          <div className="relative shrink-0 w-28 h-28 md:w-36 md:h-36 mt-4">
            {/* Outer Purple Orbit */}
            <div className="absolute inset-[-20px] rounded-full border-[1px] border-dashed border-purple-500/30 animate-[spin_15s_linear_infinite_reverse]">
              <div className="absolute bottom-2 left-[15%] w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]" />
            </div>
            {/* Inner Cyan Orbit */}
            <div className="absolute inset-[-8px] rounded-full border-[1.5px] border-[#00F0FF]/40 animate-[spin_10s_linear_infinite]">
              <div className="absolute top-[10%] right-[10%] w-1.5 h-1.5 bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF]" />
            </div>
            
            {/* Avatar Container */}
            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-[#00F0FF]/60 shadow-[0_0_25px_rgba(0,240,255,0.3)] bg-[#0B0F19]">
              {avatarPreview ? (
                <img src={resolveMediaUrl(avatarPreview)} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Quick Edit Overlay */}
            {canEditProfile && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#151A25] border border-[#00F0FF] rounded-full flex items-center justify-center text-white hover:text-[#00F0FF] shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 transition-colors"
              >
                <IoMdCreate size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── ACTION BUTTONS ROW ── */}
        <div className="flex items-center gap-3 mb-6">
         {!canEditProfile && (
            <button 
              // 🚨 FIX: Open menu if already nodded, otherwise just Nod instantly!
              onClick={() => isNodded ? setShowNoddedMenu(true) : handleNod()} 
              className={`flex-1 py-3.5 rounded-[16px] font-bold text-[12px] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 border ${
                isNodded 
                  ? 'bg-transparent border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                  : 'bg-transparent border-white/10 text-gray-300 hover:border-[#00F0FF]/50 hover:text-[#00F0FF]'
              }`}
            >
              <MdAutoAwesome className={isNodded ? "" : "animate-pulse"} size={16} />
              {isNodded ? 'Nodded' : 'Nod'}
            </button>
          )}

          {!canEditProfile && (
            <button 
              onClick={() => navigate(`/messages/${userId}`)} 
              className="flex-1 py-3.5 rounded-[16px] font-bold text-[12px] bg-transparent border border-white/10 text-gray-300 flex items-center justify-center gap-2 hover:border-[#00F0FF]/50 hover:text-white transition-all active:scale-95"
            >
              <IoMdMail size={16} /> Message
            </button>
          )}

          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Nodexa Profile', url: window.location.href }).catch(console.error);
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Profile Link Copied to Clipboard!");
              }
            }} 
            className={`${canEditProfile ? 'w-full' : 'flex-1'} py-3.5 rounded-[16px] font-bold text-[12px] bg-transparent border border-white/10 text-gray-300 flex items-center justify-center gap-2 hover:border-[#00F0FF]/50 hover:text-white transition-all active:scale-95`}
          >
            <IoMdShareAlt size={16} /> Share
          </button>
        </div>

        {/* ── GLASSMORPHISM STATS CARD ── */}
        <div className="bg-gradient-to-b from-[#151A25]/80 to-[#0B0F19]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-5 mb-8 shadow-lg">
          <div className="grid grid-cols-3 divide-x divide-white/5">
            <div className="flex flex-col items-center justify-center gap-1.5">
              <IoMdCard size={18} className="text-[#00F0FF]" />
              <span className="text-xl font-black text-white">{userPosts.length}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#00F0FF]">Total Posts</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5">
              <IoMdPerson size={18} className="text-purple-400" />
              <span className="text-xl font-black text-white">{user?.followersCount || 0}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400">Network Size</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="w-4 h-4 rounded-full border border-[#F5A623] flex items-center justify-center">
                <span className="text-[#F5A623] text-[8px]">🌐</span>
              </div>
              <span className="text-xl font-black text-white">{(userPosts.length * 124 + 342).toLocaleString()}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#F5A623]">Global Reach</span>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button onClick={() => setActiveTab('grid')} className={`py-3.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${activeTab === 'grid' ? 'bg-transparent border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}>
            <IoMdGrid size={16} /> Grid
          </button>
          <button onClick={() => setActiveTab('list')} className={`py-3.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${activeTab === 'list' ? 'bg-transparent border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg> List
          </button>
          {canEditProfile ? (
            <button onClick={() => setActiveTab('saved')} className={`py-3.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${activeTab === 'saved' ? 'bg-transparent border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}>
              <IoMdBookmark size={16} /> Vault
            </button>
          ) : (
            <div className="py-3.5 rounded-[16px] border border-transparent"></div>
          )}
        </div>



        {/* ── TAB CONTENT ── */}
        <div className="pb-10 min-h-[300px]">
          
          {/* 🚨 THE PRIVACY GATE 🚨 */}
          {!canEditProfile && user?.isPrivate && !isNodded ? (
            
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full border border-white/10 bg-[#151A25] flex items-center justify-center mb-6 shadow-inner">
                <IoMdLock size={32} className="text-gray-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide mb-2">This Account is Private</h2>
              <p className="text-xs md:text-sm text-gray-400 font-medium max-w-[250px] md:max-w-xs">
                Nod at <span className="text-[#00F0FF]">@{user?.username}</span> to unlock their network, posts, and secure channels.
              </p>
            </div>

          ) : (
            
            /* SHOW POSTS IF PUBLIC, OWNED, OR ALREADY NODDED */
            <>
              {activeTab === 'grid' && (
                <div className="grid grid-cols-3 gap-1.5 md:gap-4 animate-in slide-in-from-bottom-4 duration-500">
                  {userPosts.length === 0 ? <div className="col-span-full text-center py-20 text-gray-500 font-bold uppercase tracking-widest text-xs">No Nodes Discovered</div> : (
                    userPosts.map(post => (
                      <Link key={post._id} to={`/post/${post._id}`} className="relative aspect-[4/5] rounded-[24px] md:rounded-[32px] overflow-hidden group border border-white/5 hover:border-[#00F0FF]/40 transition-all duration-500 bg-[#0B0F19] shadow-[0_8px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.2)]">
                        
                        {post.mediaType === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-[#151A25] text-4xl group-hover:scale-110 group-hover:opacity-50 transition-all duration-700">🎬</div>
                        ) : (
                          <img src={post.images?.[0]?.url || resolveMediaUrl(post.image)} alt="" className={`w-full h-full object-cover group-hover:scale-110 group-hover:opacity-50 transition-all duration-700 ${post.mediaFilter || ''}`} />
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-90" />

                        <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-[#0B0F19]/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl translate-y-[-150%] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out z-10">
                           <span className="text-[8px] md:text-[9px] font-black text-[#00F0FF] uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                             {post.mainCategory || 'Intel'}
                           </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 translate-y-[120%] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                          <div className="bg-[#151A25]/90 backdrop-blur-xl border border-white/10 rounded-[18px] p-3 md:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent" />
                            <p className="text-[11px] md:text-xs font-black text-white truncate mb-2">{post.title || 'Encrypted Node'}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] md:text-[11px] font-black tracking-widest text-[#00F0FF]">
                                {post.price ? `₹${post.price.toLocaleString('en-IN')}` : 'View Stream'}
                              </span>
                              <div className="flex items-center gap-2 text-gray-400">
                                <span className="flex items-center gap-1 text-[9px] font-bold">
                                  <IoMdHeart className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" size={14} /> 
                                  {post.likesCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
              {activeTab === 'list' && (
                <div className="max-w-[470px] mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  {userPosts.length === 0 ? <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest text-xs">No active listings.</div> : userPosts.map(post => <PostCard key={post._id} post={post} />)}
                </div>
              )}
              {activeTab === 'saved' && canEditProfile && (
                <div className="grid grid-cols-3 gap-1.5 md:gap-4 animate-in slide-in-from-bottom-4 duration-500">
                  {savedPosts.length === 0 ? <div className="col-span-full text-center py-20 text-gray-500 font-bold uppercase tracking-widest text-xs">Private Vault is Empty</div> : savedPosts.map(post => (
                    <Link key={post._id} to={`/post/${post._id}`} className="relative aspect-[4/5] rounded-[24px] md:rounded-[32px] overflow-hidden group border border-[#1E2532] bg-[#151A25]">
                      {post.mediaType === 'video' ? <div className="w-full h-full flex items-center justify-center bg-black text-3xl group-hover:scale-110 transition-transform duration-700">🎬</div> : <img src={post.images?.[0]?.url || resolveMediaUrl(post.image)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-4 right-4 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"><IoMdBookmark size={24} /></div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        </div>

      {/* ─── 🚀 2050 COMMAND CENTER MODAL (SYSTEM CONFIG) ─── */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-[#05070A]/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          
          <div className="w-full h-full max-w-[1300px] bg-[#0B0F19] md:rounded-[48px] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            
        
            {/* ── SIDEBAR ── */}
            <div className={`w-full h-full md:h-auto md:w-[280px] lg:w-[320px] flex-shrink-0 bg-[#0B0F19] border-r border-[#1E2532] flex flex-col ${!showMobileMenu ? 'hidden md:flex' : 'flex'}`}>
              
             {/* ── 🚨 PREMIUM ACCOUNT SWITCHER ── */}
              <div className="p-6 md:p-8 relative z-[100]" ref={accountMenuRef}>
                {/* Trigger Button */}
                <div 
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="w-full flex items-center justify-between p-3 rounded-[20px] bg-[#151A25]/60 border border-[#1E2532] hover:border-[#00F0FF]/40 hover:bg-[#151A25] hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-[#00F0FF]/50 transition-colors">
                      <img src={avatarPreview || "https://i.pravatar.cc/150"} alt="Avatar" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#151A25]" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-black text-white leading-tight">{user?.fullName || 'Gahana'}</span>
                      <span className="text-[10px] font-bold text-gray-500">@{user?.username || 'gahana123'}</span>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isAccountMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <IoMdArrowDropdown className="text-gray-400 group-hover:text-[#00F0FF] transition-colors" size={24} />
                  </motion.div>
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-[85%] left-6 right-6 mt-2 bg-[#0B0F19]/95 backdrop-blur-3xl border border-[#1E2532] rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.9)] overflow-hidden"
                    >
                      <div className="p-2">
                        <span className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2 mt-2">Current Account</span>
                        <div className="flex items-center justify-between p-3 rounded-[16px] bg-[#151A25] border border-[#00F0FF]/20 shadow-[0_0_15px_rgba(0,240,255,0.05)] cursor-default">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10">
                              <img src={avatarPreview || "https://i.pravatar.cc/150"} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-white leading-tight">{user?.fullName || 'Gahana'}</span>
                              <span className="text-[10px] font-bold text-gray-500">@{user?.username || 'gahana123'}</span>
                            </div>
                          </div>
                          <IoMdCheckmark size={18} className="text-[#00F0FF]" />
                        </div>
                      </div>

                     {/* Section 2: Other Accounts (DYNAMIC) */}
                      {savedAccounts.length > 0 && (
                        <div className="px-2 pb-2">
                          <span className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-2 mt-2">Other Accounts</span>
                          
                          {/* 🚨 ADDED SCROLLING CLASSES HERE 🚨 */}
                          <div className="flex flex-col gap-1 max-h-[76px] overflow-y-auto pr-1 no-scrollbar">
                            {savedAccounts.map((acc) => (
                              <button 
                                key={acc.user._id} 
                                onClick={() => handleSwitchAccount(acc)}
                                className="w-full flex items-center justify-between p-3 rounded-[16px] hover:bg-[#151A25] transition-all group active:scale-[0.98] shrink-0"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 overflow-hidden flex items-center justify-center border border-white/5">
                                    <img 
                                      src={resolveMediaUrl(acc.user.profilePhoto || acc.user.avatar) || `https://i.pravatar.cc/150?u=${acc.user._id}`} 
                                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                      alt="" 
                                    />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-xs font-black text-gray-300 group-hover:text-white transition-colors leading-tight">
                                      {acc.user.fullName || acc.user.username}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-600 group-hover:text-gray-400 transition-colors">
                                      @{acc.user.username}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-[#0B0F19] border border-[#1E2532] flex items-center justify-center group-hover:border-[#00F0FF]/40 transition-colors">
                                  <IoMdCheckmark size={14} className="text-transparent group-hover:text-[#00F0FF] transition-colors" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-[#1E2532] p-2 flex flex-col gap-1">
                        
                       {/* 🚨 Updated Add Existing Account Button */}
<button 
  onClick={() => {
    // Save the current username so the login page can autofill it
    localStorage.setItem('nodexa_last_username', user?.username || '');
    handleAddAccountFlow('/login');
  }} 
  className="w-full flex items-center gap-3 p-3 rounded-[16px] hover:bg-[#151A25] transition-colors group"
>
  <div className="w-8 h-8 rounded-full border border-dashed border-[#00F0FF]/50 flex items-center justify-center text-[#00F0FF] group-hover:bg-[#00F0FF]/10 transition-colors">
    <IoMdAdd size={16} />
  </div>
  <span className="text-xs font-black text-[#00F0FF] tracking-wide">Add Existing Account</span>
</button>

                        {/* 🚨 2. Create New Account Button */}
                        <button 
                          onClick={() => handleAddAccountFlow('/register')} 
                          className="w-full flex items-center gap-3 p-3 rounded-[16px] hover:bg-[#151A25] transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full border border-dashed border-purple-500/50 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                            <IoMdPerson size={16} />
                          </div>
                          <span className="text-xs font-black text-purple-400 tracking-wide">Create New Account</span>
                        </button>
                        
                        {/* 🚨 3. Logout All Button */}
                        <button 
                          onClick={handleLogoutAll}
                          className="w-full flex items-center gap-3 p-3 rounded-[16px] hover:bg-red-500/10 transition-colors group mt-2"
                        >
                          <div className="w-8 h-8 flex items-center justify-center text-red-500">
                            <IoMdLogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                          </div>
                          <span className="text-xs font-black text-red-500 tracking-wide">Logout from all accounts</span>
                        </button>
                        
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar px-4 flex flex-col gap-1 pb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 ml-4 mt-2">
                  Command Center
                </span>
                
                {[
                  { id: 'personal', icon: <IoMdPerson size={20} />, label: 'Personal Info' },
                  { id: 'privacy', icon: <IoMdLock size={20} />, label: 'Privacy' },
                  { id: 'notifications', icon: <IoMdNotifications size={20} />, label: 'Notifications' },
                  { id: 'security', icon: <MdShield size={20} />, label: 'Security' },
                  { id: 'payments', icon: <IoMdCard size={20} />, label: 'Payments' },
                  { id: 'preferences', icon: <IoMdSettings size={20} />, label: 'Preferences' },
                  { id: 'appearance', icon: <IoMdColorPalette size={20} />, label: 'Appearance' },
                  { id: 'divider1', type: 'divider' },
                  { id: 'activity', icon: <IoMdAnalytics size={20} />, label: 'Activity & Analytics' },
                  { id: 'blocked', icon: <MdBlock size={20} />, label: 'Blocked Users' },
                  { id: 'ai', icon: <MdAutoAwesome size={20} />, label: 'AI Settings' },
                  { id: 'divider2', type: 'divider' },
                  { id: 'help', icon: <IoMdHelpCircle size={20} />, label: 'Help & Support' },
                  { id: 'about', icon: <IoMdInformationCircle size={20} />, label: 'About' },
                ].map((item, index) => {
                  if (item.type === 'divider') return <div key={index} className="my-3 mx-4 border-t border-[#1E2532]" />;
                  
                  const isActive = settingsTab === item.id;
                  return (
                    
                      <button 
                  key={item.id}
                  onClick={() => {
                    setSettingsTab(item.id);
                    setShowMobileMenu(false); // 🚨 This is the magic line
                  }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all relative group ${
                        isActive 
                          ? 'bg-[#151A25] text-white' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-[#151A25]/50'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-[15%] bottom-[15%] w-[3px] bg-gradient-to-b from-[#0057FF] to-[#00F0FF] rounded-r-full shadow-[0_0_10px_#00F0FF]" />
                      )}
                      <span className={`${isActive ? 'text-[#00F0FF]' : 'group-hover:text-white transition-colors'}`}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>

             {/* 🚨 Added 'pb-32' for mobile to clear the bottom nav, and 'md:pb-6' to keep laptop perfect */}
              <div className="p-6 pb-32 md:pb-6 mt-auto relative z-50 shrink-0">
                <button onClick={() => setIsEditing(false)} className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-gray-400 hover:text-white bg-[#151A25] hover:bg-[#1E2532] transition-all text-[12px] font-bold border border-[#1E2532] hover:border-gray-500 shadow-sm active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <IoMdArrowBack size={18} /> Back to App
                </button>
              </div>
            </div>

            {/* ── CONTENT AREA ── */}
            <div className={`flex-1 bg-[#05070A] overflow-y-auto no-scrollbar relative p-6 md:p-12 ${showMobileMenu ? 'hidden md:block' : 'block'}`}>
              <div className="max-w-3xl mx-auto">
                
                {/* 🔙 MOBILE BACK TO MENU BUTTON */}
                {!showMobileMenu && (
                  <button 
                    onClick={() => setShowMobileMenu(true)}
                    className="md:hidden flex items-center gap-2 text-[#00F0FF] font-black text-[10px] uppercase tracking-widest mb-8 bg-[#151A25] px-4 py-2 rounded-xl border border-[#00F0FF]/20"
                  >
                    <IoMdArrowBack /> System Menu
                  </button>
                )}

                {/* ── TAB: SECURITY ── */}
                {settingsTab === 'security' && (
                  <div className="animate-in fade-in duration-500">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-[#151A25] border border-[#1E2532] flex items-center justify-center shadow-inner">
                        <MdShield size={28} className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white">Security</h2>
                        <p className="text-sm text-gray-400 font-medium mt-1">Secure your account and manage access.</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-[15px] font-bold text-white mb-4">Account Security</h3>
                      <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] overflow-hidden shadow-sm">
                          <div onClick={() => setShowPasswordModal(true)} className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] cursor-pointer transition-colors group">
                          <div className="flex items-center gap-4">
                            <IoMdLock size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                            <div>
                              <p className="text-sm font-bold text-white">Change Password</p>
                              <p className="text-xs text-gray-500 mt-0.5">Update your password regularly</p>
                            </div>
                          </div>
                          <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                        </div>
                        <div className="flex items-center justify-between p-5 hover:bg-[#151A25] cursor-pointer transition-colors group">
                          <div className="flex items-center gap-4">
                            <MdSmartphone size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                            <div>
                              <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                              <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Enabled
                            </span>
                            <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="mb-4">
                        <h3 className="text-[15px] font-bold text-white">Active Sessions</h3>
                        <p className="text-xs text-gray-500 mt-1">
  You're logged in on {user?.activeSessions?.length || 0} device{user?.activeSessions?.length === 1 ? '' : 's'}
</p>
                      </div>
                      <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] overflow-hidden shadow-sm">
                        {/* 👇 📡 THE DYNAMIC RADAR: Maps over real database sessions 👇 */}
          <div className="flex flex-col-reverse"> {/* Reverses it so the newest login is at the top! */}
            {user?.activeSessions && user.activeSessions.length > 0 ? (
              user.activeSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Shows a mobile icon if 'Mobile' or 'Android' is in the text, otherwise shows a laptop */}
                    {session.deviceInfo.includes('Mobile') || session.deviceInfo.includes('Android') || session.deviceInfo.includes('iOS') ? (
                      <IoMdPhonePortrait size={22} className="text-gray-400" />
                    ) : (
                      <IoMdDesktop size={22} className="text-gray-400" />
                    )}
                    
                    <div>
                      <p className="text-sm font-bold text-white">{session.deviceInfo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{session.time}</p>
                    </div>
                  </div>
                  
                  {/* If this is the absolute newest session in the array, give it the 'Current' badge */}
                  {index === user.activeSessions.length - 1 && (
                    <span className="text-[10px] font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-full border border-[#00F0FF]/20">
                      Current
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-5 text-sm text-gray-500 text-center italic">
                No session data recorded yet. Log out and log back in to trigger the radar!
              </div>
            )}
          </div>
          {/* 👆 ──────────────────────────────────────────────────────── 👆 */}
          <button onClick={handleLogoutAll} className="w-full p-5 flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold">
  <IoMdArrowBack size={16} className="rotate-180" /> Logout from All Devices
</button>
                        
                      </div>
                    </div>

                   <div className="mb-10">
                      <h3 className="text-[15px] font-bold text-white mb-4">Data & Safety</h3>
                      <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] overflow-hidden shadow-sm">
                        
                        {/* 1. LOGIN ALERTS (Now with Auto-Save!) */}
                        <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] transition-colors">
                          <div className="flex items-center gap-4">
                            <MdShield size={22} className="text-gray-400" />
                            <div>
                              <p className="text-sm font-bold text-white">Login Alerts</p>
                              <p className="text-xs text-gray-500 mt-0.5">Get notified of new sign-ins</p>
                            </div>
                          </div>
                          <button 
                            onClick={handleToggleLoginAlerts} 
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.loginAlerts ? 'bg-[#00F0FF]' : 'bg-[#1E2532]'}`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-[2px] transition-all duration-300 ${formData.loginAlerts ? 'left-[26px]' : 'left-[2px]'}`}></div>
                          </button>
                        </div>

                        {/* 2. TRUSTED CONTACTS (Interactive Placeholder) */}
                        <div onClick={() => alert("Trusted Contacts module is unlocking in Phase 6! 🚀")} className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] cursor-pointer transition-colors group">
                          <div className="flex items-center gap-4">
                            <IoMdPerson size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                            <div>
                              <p className="text-sm font-bold text-white">Trusted Contacts</p>
                              <p className="text-xs text-gray-500 mt-0.5">Manage recovery contacts</p>
                            </div>
                          </div>
                          <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                        </div>

                       {/* 3. ACCOUNT RECOVERY (Now Fully Functional!) */}
                        <div onClick={() => setShowRecoveryModal(true)} className="flex items-center justify-between p-5 hover:bg-[#151A25] cursor-pointer transition-colors group">
                          <div className="flex items-center gap-4">
                            <IoMdTime size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                            <div>
                              <p className="text-sm font-bold text-white">Account Recovery</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {user?.backupEmail ? 'Backup email configured' : 'Set up recovery options'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {user?.backupEmail && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                            )}
                            <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                          </div>
                        </div>
                    </div>
                  </div>
                   </div>
                )}

                {/* ── TAB: PERSONAL INFO ── */}
{settingsTab === 'personal' && (
  <div className="animate-in fade-in duration-500 pb-20">
    {/* Updated Header: Smaller icons and text on mobile */}
    <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
      <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#151A25] border border-[#1E2532] flex items-center justify-center shadow-inner">
        <IoMdPerson size={22} className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] md:hidden" />
        <IoMdPerson size={28} className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] hidden md:block" />
      </div>
      <div>
        <h2 className="text-xl md:text-3xl font-black text-white">Personal Info</h2>
        <p className="text-[10px] md:text-sm text-gray-400 font-medium mt-0.5">Manage your identity and public profile.</p>
      </div>
    </div>

                    {/* 🚀 CALLING YOUR NEW COMPONENT HERE */}
                    <PersonalInfo /> 
                    
                  </div>
                )}
                
                {/* ── TAB: PRIVACY ── */}
                {settingsTab === 'privacy' && (
                  <div className="animate-in fade-in duration-500 pb-20">
                     <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-[#151A25] border border-[#1E2532] flex items-center justify-center shadow-inner">
                        <IoMdLock size={28} className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white">Privacy</h2>
                        <p className="text-sm text-gray-400 font-medium mt-1">Control who sees your content.</p>
                      </div>
                    </div>
                     <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] overflow-hidden shadow-sm">
                        
                       {/* Public Account Toggle */}
                        <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] transition-colors">
                          <div className="flex items-center gap-4">
                            {/* Changed icon to a Globe/Eye concept using an existing icon */}
                            <IoMdPerson size={22} className={!formData.isPrivate ? "text-[#00F0FF]" : "text-gray-400"} />
                            <div>
                              <p className="text-sm font-bold text-white">Public Account</p>
                              <p className="text-xs text-gray-500 mt-0.5">When on, anyone can see your posts. When off, your account is safely private.</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setFormData({...formData, isPrivate: !formData.isPrivate})} 
                            className={`w-12 h-6 rounded-full relative transition-colors shadow-inner border ${!formData.isPrivate ? 'bg-[#00F0FF] border-[#00F0FF]' : 'bg-[#1E2532] border-[#2A3441]'}`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-[1px] shadow-sm transition-all duration-300 ${!formData.isPrivate ? 'right-[2px]' : 'left-[2px]'}`} />
                          </button>
                        </div>

                        {/* Hide Online Status Toggle */}
                        <div className="flex items-center justify-between p-5 hover:bg-[#151A25] transition-colors">
                          <div className="flex items-center gap-4">
                            <IoMdStar size={22} className="text-gray-400" />
                            <div>
                              <p className="text-sm font-bold text-white">Hide Online Status</p>
                              <p className="text-xs text-gray-500 mt-0.5">Turn off the green dot on your profile.</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setFormData({...formData, hideActivity: !formData.hideActivity})} 
                            className={`w-12 h-6 rounded-full relative transition-colors shadow-inner border ${formData.hideActivity ? 'bg-[#00F0FF] border-[#00F0FF]' : 'bg-[#1E2532] border-[#2A3441]'}`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-[1px] shadow-sm transition-all duration-300 ${formData.hideActivity ? 'right-[2px]' : 'left-[2px]'}`} />
                          </button>
                        </div>

                     </div>
                     
                     <div className="mt-8 flex justify-end">
                       <button 
                         onClick={handleUpdate} 
                         className="bg-[#1E2532] text-[#00F0FF] border border-[#00F0FF]/30 px-8 py-3.5 rounded-xl font-bold tracking-wide hover:bg-[#00F0FF]/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all active:scale-95"
                       >
                         Apply Settings
                       </button>
                    </div>
                  </div>
                  
                )}

                {/* ── TAB: NOTIFICATIONS ── */}
                {settingsTab === 'notifications' && (
                  <div className="animate-in fade-in duration-500 pb-20">
                     <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-[#151A25] border border-[#1E2532] flex items-center justify-center shadow-inner">
                        <IoMdNotifications size={28} className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white">Notifications</h2>
                        <p className="text-sm text-gray-400 font-medium mt-1">Manage your alerts and emails.</p>
                      </div>
                    </div>
                     <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] transition-colors">
                          <div className="flex items-center gap-4">
                            <IoMdMail size={22} className="text-gray-400" />
                            <div>
                              <p className="text-sm font-bold text-white">Email Alerts</p>
                              <p className="text-xs text-gray-500 mt-0.5">Get emails when someone messages you.</p>
                            </div>
                          </div>
                          <button onClick={() => setFormData({...formData, emailAlerts: !formData.emailAlerts})} className={`w-12 h-6 rounded-full relative transition-colors shadow-inner border ${formData.emailAlerts ? 'bg-[#0057FF] border-[#0057FF]' : 'bg-[#1E2532] border-[#2A3441]'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-[1px] shadow-sm transition-all ${formData.emailAlerts ? 'right-[2px]' : 'left-[2px]'}`} />
                          </button>
                        </div>
                     </div>
                     <div className="mt-8 flex justify-end">
                       <button onClick={handleUpdate} className="bg-[#1E2532] text-[#00F0FF] border border-[#00F0FF]/30 px-8 py-3.5 rounded-xl font-bold tracking-wide hover:bg-[#00F0FF]/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all">
                         Apply Settings
                       </button>
                    </div>
                    {/* Drop this button right under your Apply Settings button just for testing! */}

                  </div>
                  
                )}

                {/* ── TAB: PAYMENTS ── */}
                {settingsTab === 'payments' && (
                  <div className="animate-in fade-in duration-500 pb-20">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-[#151A25] border border-[#1E2532] flex items-center justify-center shadow-inner">
                        <IoMdCard size={28} className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white">Payments</h2>
                        <p className="text-sm text-gray-400 font-medium mt-1">Manage your payment methods and transactions.</p>
                      </div>
                    </div>
                    <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <IoMdCard size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                          <p className="text-sm font-bold text-white">Saved Payment Methods</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 font-bold">2 Cards, 1 UPI</span>
                          <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <IoMdTime size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                          <p className="text-sm font-bold text-white">Transaction History</p>
                        </div>
                        <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                      </div>
                      <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <IoMdStar size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                          <p className="text-sm font-bold text-white">Wallet & Credits</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-emerald-400 font-bold">₹1,250</span>
                          <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-5 hover:bg-[#151A25] cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <IoMdArrowBack size={22} className="text-gray-400 group-hover:text-white transition-colors rotate-[270deg]" />
                          <p className="text-sm font-bold text-white">Refunds</p>
                        </div>
                        <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: PREFERENCES ── */}
                {settingsTab === 'preferences' && (
                  <div className="animate-in fade-in duration-500 pb-20">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-[#151A25] border border-[#1E2532] flex items-center justify-center shadow-inner">
                        <IoMdSettings size={28} className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white">Preferences</h2>
                        <p className="text-sm text-gray-400 font-medium mt-1">Customize your experience across the app.</p>
                      </div>
                    </div>
                    <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <IoMdBookmark size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                          <p className="text-sm font-bold text-white">Interested Categories</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex gap-2 text-[14px]">🏠 🍔 💼 🎓</span>
                          <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <IoMdCard size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                          <p className="text-sm font-bold text-white">Budget Range</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 font-bold">₹0 - ₹50K</span>
                          <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-5 hover:bg-[#151A25] cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <IoMdPin size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                          <p className="text-sm font-bold text-white">Preferred Location</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 font-bold">Bangalore, India</span>
                          <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: APPEARANCE ── */}
                {settingsTab === 'appearance' && (
                  <div className="animate-in fade-in duration-500 pb-20">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-[#151A25] border border-[#1E2532] flex items-center justify-center shadow-inner">
                        <IoMdColorPalette size={28} className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white">Appearance</h2>
                        <p className="text-sm text-gray-400 font-medium mt-1">Customize how the app looks and feels.</p>
                      </div>
                    </div>
                    <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] overflow-hidden shadow-sm p-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-[#1E2532] gap-4">
                        <div className="flex items-center gap-4">
                          <MdAutoAwesome size={22} className="text-gray-400" />
                          <p className="text-sm font-bold text-white">Theme</p>
                        </div>
                        <div className="flex bg-[#151A25] border border-[#1E2532] rounded-full p-1">
                          <button className="px-4 py-1.5 rounded-full bg-[#1E2532] text-xs font-bold text-white shadow-sm flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white"></span> Dark</button>
                          <button className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-transparent border border-gray-500"></span> Light</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border-b border-[#1E2532]">
                        <div className="flex items-center gap-4">
                          <IoMdColorPalette size={22} className="text-gray-400" />
                          <p className="text-sm font-bold text-white hidden md:block">Accent Color</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#0057FF] border-2 border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.8)] cursor-pointer" />
                          <div className="w-6 h-6 rounded-full bg-purple-500 opacity-50 cursor-pointer hover:opacity-100 transition-opacity" />
                          <div className="w-6 h-6 rounded-full bg-emerald-500 opacity-50 cursor-pointer hover:opacity-100 transition-opacity" />
                          <div className="w-6 h-6 rounded-full bg-red-500 opacity-50 cursor-pointer hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 font-serif font-bold text-lg px-1">AA</span>
                          <p className="text-sm font-bold text-white">Text Size</p>
                        </div>
                        <div className="flex bg-[#151A25] border border-[#1E2532] rounded-full p-1">
                          <button className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-500">Small</button>
                          <button className="px-4 py-1.5 rounded-full bg-[#1E2532] text-xs font-bold text-white shadow-sm">Medium</button>
                          <button className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-500">Large</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: AI SETTINGS ── */}
                {settingsTab === 'ai' && (
                  <div className="animate-in fade-in duration-500 pb-20">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-[#151A25] border border-[#1E2532] flex items-center justify-center shadow-inner">
                        <MdAutoAwesome size={28} className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white">AI Settings</h2>
                        <p className="text-sm text-gray-400 font-medium mt-1">Control your personalized experience.</p>
                      </div>
                    </div>
                    <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] transition-colors">
                        <div className="flex items-center gap-4">
                          <IoMdGrid size={22} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-bold text-white">Personalized Feed</p>
                            <p className="text-xs text-gray-500 mt-0.5">Show content tailored to your interests</p>
                          </div>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-[#0057FF] relative transition-colors shadow-inner border border-[#0057FF]">
                          <div className="w-5 h-5 rounded-full bg-white absolute top-[1px] right-[2px] shadow-sm transition-all" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-5 hover:bg-[#151A25] transition-colors">
                        <div className="flex items-center gap-4">
                          <MdAutoAwesome size={22} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-bold text-white">Smart Recommendations</p>
                            <p className="text-xs text-gray-500 mt-0.5">Get AI-powered suggestions</p>
                          </div>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-[#0057FF] relative transition-colors shadow-inner border border-[#0057FF]">
                          <div className="w-5 h-5 rounded-full bg-white absolute top-[1px] right-[2px] shadow-sm transition-all" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── FALLBACK FOR REMAINING TABS ── */}
                {settingsTab !== 'security' && settingsTab !== 'personal' && settingsTab !== 'privacy' && settingsTab !== 'notifications' && settingsTab !== 'payments' && settingsTab !== 'preferences' && settingsTab !== 'appearance' && settingsTab !== 'ai' && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in duration-500">
                    <IoMdSettings size={64} className="text-[#1E2532] mb-4 animate-[spin_10s_linear_infinite]" />
                    <h3 className="text-xl font-black text-white capitalize">{settingsTab.replace('-', ' ')}</h3>
                    <p className="text-gray-500 text-sm mt-2">Module is currently offline or under construction.</p>
                  </div>
                )}

              </div>
            </div>
            
          </div>
        </div>
      )}
{/* ─── 🚀 NODDED BOTTOM SHEET MODAL ─── */}
      <AnimatePresence>
        {showNoddedMenu && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-[#05070A]/80 backdrop-blur-sm p-4"
            onClick={() => setShowNoddedMenu(false)}
          >
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-[#0B0F19] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_-10px_50px_rgba(0,0,0,0.8)]"
              onClick={e => e.stopPropagation()} // Prevent clicking inside from closing it
            >
              
              {/* Header: User Info */}
              <div className="p-6 border-b border-[#1E2532] flex flex-col items-center relative">
                <div className="w-12 h-1 bg-[#1E2532] rounded-full absolute top-3 md:hidden" />
                <div className="w-16 h-16 rounded-full border border-[#00F0FF]/40 overflow-hidden mb-3 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                  <img src={resolveMediaUrl(user?.profilePhoto) || `https://ui-avatars.com/api/?name=${user?.username}`} className="w-full h-full object-cover" alt="Avatar" />
                </div>
                <h3 className="text-white font-black text-lg tracking-tight">@{user?.username}</h3>
              </div>

              {/* Options List */}
              <div className="p-2 flex flex-col gap-1">
                
                {/* 1. UNNOD */}
                <button 
                  onClick={() => { handleNod(); setShowNoddedMenu(false); }} 
                  className="flex items-center gap-4 p-4 hover:bg-[#151A25] transition-colors rounded-2xl text-left group"
                >
                  <span className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors shadow-inner">
                    <IoMdClose size={20} />
                  </span>
                  <div>
                    <span className="text-sm font-black text-red-500 group-hover:text-white transition-colors block tracking-wide">Unnod</span>
                  </div>
                </button>

                {/* 2. MUTE */}
                <button 
                  onClick={() => { alert("Muted!"); setShowNoddedMenu(false); }} 
                  className="flex items-center gap-4 p-4 hover:bg-[#151A25] transition-colors rounded-2xl text-left group"
                >
                  <span className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors shadow-inner">
                    <MdNotificationsOff size={20} /> 
                  </span>
                  <div>
                    <span className="text-sm font-black text-white block tracking-wide">Mute</span>
                    <span className="text-xs text-gray-500 font-medium mt-0.5 block">Hide their posts from your feed</span>
                  </div>
                </button>

                {/* 3. PRIORITIZE */}
                <button 
                  onClick={() => { alert("Prioritized!"); setShowNoddedMenu(false); }} 
                  className="flex items-center gap-4 p-4 hover:bg-[#151A25] transition-colors rounded-2xl text-left group"
                >
                  <span className="w-10 h-10 rounded-full bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-white transition-colors shadow-inner">
                    <IoMdStar size={20} />
                  </span>
                  <div>
                    <span className="text-sm font-black text-[#F5A623] group-hover:text-white transition-colors block tracking-wide">Prioritize</span>
                    <span className="text-xs text-gray-500 font-medium mt-0.5 block">See their content higher in feed</span>
                  </div>
                </button>

                {/* 4. BLOCK */}
                <button 
                  onClick={() => { alert("Blocked!"); setShowNoddedMenu(false); }} 
                  className="flex items-center gap-4 p-4 hover:bg-[#151A25] transition-colors rounded-2xl text-left group"
                >
                  <span className="w-10 h-10 rounded-full bg-[#1E2532] flex items-center justify-center text-gray-500 group-hover:text-white transition-colors shadow-inner">
                    <MdBlock size={20} />
                  </span>
                  <span className="text-sm font-black text-gray-500 group-hover:text-white transition-colors block tracking-wide">Block</span>
                </button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 🔐 CHANGE PASSWORD MODAL ─── */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#05070A]/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0B0F19] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#1E2532] flex justify-between items-center bg-[#151A25]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E2532] flex items-center justify-center text-[#00F0FF]">
                    <IoMdLock size={20} />
                  </div>
                  <h3 className="text-white font-black text-lg tracking-tight">Security Vault</h3>
                </div>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <IoMdClose size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
                
                {/* Status Messages */}
                {passwordStatus.error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                    {passwordStatus.error}
                  </div>
                )}
                {passwordStatus.success && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
                    {passwordStatus.success}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full bg-[#05070A] border border-[#1E2532] rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50 transition-colors"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    minLength="6"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full bg-[#05070A] border border-[#1E2532] rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50 transition-colors"
                    placeholder="Enter new password"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={passwordStatus.loading || passwordStatus.success}
                  className="w-full py-3.5 mt-2 bg-[#00F0FF] text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white transition-colors disabled:opacity-50"
                >
                  {passwordStatus.loading ? 'Updating...' : 'Confirm Update'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        
        {/* ─── 🛡️ ACCOUNT RECOVERY MODAL ─── */}
      <AnimatePresence>
        {showRecoveryModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#05070A]/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0B0F19] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#1E2532] flex justify-between items-center bg-[#151A25]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E2532] flex items-center justify-center text-purple-400">
                    <MdShield size={20} />
                  </div>
                  <h3 className="text-white font-black text-lg tracking-tight">Recovery Setup</h3>
                </div>
                <button onClick={() => setShowRecoveryModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <IoMdClose size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleRecoverySubmit} className="p-6 space-y-5">
                
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Add a backup email address. If you ever lose access to your primary account, we will send a secure recovery link to this address.
                </p>

                {/* Status Messages */}
                {recoveryStatus.error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                    {recoveryStatus.error}
                  </div>
                )}
                {recoveryStatus.success && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
                    {recoveryStatus.success}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1">Backup Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={backupEmail}
                    onChange={(e) => setBackupEmail(e.target.value)}
                    className="w-full bg-[#05070A] border border-[#1E2532] rounded-2xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="e.g. secure.backup@email.com"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={recoveryStatus.loading || recoveryStatus.success}
                  className="w-full py-3.5 mt-2 bg-purple-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-purple-400 transition-colors disabled:opacity-50"
                >
                  {recoveryStatus.loading ? 'Securing...' : 'Save Recovery Info'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  
    </div>
  );
  }