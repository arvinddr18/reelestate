import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  IoMdSettings, IoMdCamera, IoMdGrid, IoMdClose, IoMdCreate, 
  IoMdPin, IoMdCall, IoMdMail, IoMdArrowBack, IoMdBookmark, 
  IoMdHeart, IoMdCheckmarkCircle, IoMdTime, IoMdStar, IoMdShareAlt,
  IoMdPerson, IoMdLock, IoMdNotifications
} from 'react-icons/io';
import PostCard from '../components/feed/PostCard'; 

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
  const token = localStorage.getItem('reelestate_token');
  return { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
};

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]); 
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('grid'); 
  const [loading, setLoading] = useState(true);

  // ── SETTINGS MODAL STATE ──
  const [isEditing, setIsEditing] = useState(false);
  const [settingsTab, setSettingsTab] = useState('personal'); // 'personal' | 'privacy' | 'notifications'
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({ 
    fullName: '', bio: '', location: '', phone: '', website: '',
    isPrivate: false, hideActivity: false, emailAlerts: true
  });

  // ── BULLETPROOF OWNER CHECK ──
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = loggedInUser?._id || loggedInUser?.id || loggedInUser?.userId;
  
  // You are the owner if: No userId in URL, URL matches your ID, or fetched profile matches your ID.
  const canEditProfile = !userId || String(userId) === String(currentUserId) || String(user?._id) === String(currentUserId);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = userId || currentUserId;
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
          isPrivate: userData.isPrivate || false,
          hideActivity: userData.hideActivity || false,
          emailAlerts: userData.emailAlerts !== false,
        });
        setAvatarPreview(userData.profilePhoto || userData.avatar || null);

        // Try fetching saved posts
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
    fetchProfile();
  }, [userId, currentUserId, canEditProfile]);

  const handleUpdate = async () => {
    try {
      const payload = { ...formData, profilePhoto: avatarPreview };
      const res = await axios.put(getApiUrl('/api/users/update'), payload, getAuthConfig());
      if(res.data.success) {
        setIsEditing(false);
        window.location.reload(); 
      }
    } catch (err) {
      alert(`Backend Error: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#0B0F19] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const trustScore = Math.min(98, 70 + (userPosts.length * 2)); 

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans pb-24 overflow-x-hidden relative">
      
      {/* ── STICKY TOP BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between pointer-events-auto">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <IoMdArrowBack size={20} />
          </button>
          <div className="flex gap-3">
            {!canEditProfile && (
               <button className="w-10 h-10 rounded-full bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:text-[#00F0FF] transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                 <IoMdShareAlt size={20} />
               </button>
            )}
            {/* Top Right Gear Icon (Only shows if owner) */}
            {canEditProfile && (
              <button onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-full bg-[#0B0F19]/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#00F0FF] hover:bg-[#00F0FF] hover:text-white transition-colors shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                <IoMdSettings size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 2045 HERO BANNER ── */}
      <div className="h-56 md:h-72 bg-gradient-to-b from-[#0057FF]/30 via-[#0B0F19] to-[#0B0F19] relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-[#00F0FF] opacity-20 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-[#0057FF] opacity-20 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-24 relative z-10">
        
        {/* ── HOLOGRAPHIC PROFILE INFO CARD ── */}
        <div className="bg-[#151A25]/80 backdrop-blur-2xl border border-[#1E2532] rounded-[32px] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
            
            {/* Avatar Section */}
            <div className="relative shrink-0">
              <div className="w-36 h-36 rounded-full relative flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.2)]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-[3px] rounded-full bg-[#0B0F19] overflow-hidden flex items-center justify-center text-4xl font-black text-white">
                  {avatarPreview ? (
                    <img src={resolveMediaUrl(avatarPreview)} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <span>{user?.username?.[0].toUpperCase()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 text-center md:text-left w-full mt-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                    {user?.fullName || `@${user?.username}`}
                    {user?.isVerified && <IoMdCheckmarkCircle className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" size={24} />}
                    {user?.isPrivate && <IoMdLock className="text-gray-500 ml-1" size={18} title="Private Account"/>}
                  </h2>
                  <p className="text-[#00F0FF] text-[11px] font-black tracking-[0.2em] uppercase mt-1">
                    {user?.role || 'Verified Member'} • Joined 2026
                  </p>
                </div>

                {/* ── ACTION BUTTONS ── */}
                <div className="flex items-center justify-center gap-3">
                  {canEditProfile ? (
                    // THIS IS THE BIG SETTINGS BUTTON YOU SHOULD SEE NOW
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="px-6 py-3 rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all flex items-center gap-2 bg-[#1E2532] text-white border border-[#2A3441] hover:bg-[#00F0FF] hover:text-[#0B0F19] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] active:scale-95"
                    >
                      <IoMdSettings size={18}/> Settings & Privacy
                    </button>
                  ) : (
                    // IF IT SAYS CALL/CHAT, IT MEANS canEditProfile FAILED
                    <>
                      <button className="px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-105 active:scale-95 flex items-center gap-2">
                        <IoMdCall size={16}/> Call
                      </button>
                      <button onClick={() => navigate(`/messages/${userId}`)} className="px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase bg-[#1E2532] text-white hover:text-[#00F0FF] border border-[#2A3441] transition-all hover:border-[#00F0FF]/50 active:scale-95 flex items-center gap-2">
                        <IoMdMail size={16}/> Chat
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                <span className="bg-[#00F0FF]/10 text-[#00F0FF] text-[10px] font-bold px-2.5 py-1 rounded-md border border-[#00F0FF]/30 flex items-center gap-1.5 shadow-inner">
                  <IoMdStar size={12}/> {trustScore}% Trust Score
                </span>
                <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2.5 py-1 rounded-md border border-purple-500/30 flex items-center gap-1.5 shadow-inner">
                  <IoMdTime size={12}/> Responds in &lt;1hr
                </span>
              </div>

              {/* Bio & Details */}
              <div className="mt-5 max-w-2xl mx-auto md:mx-0">
                {user?.bio && <p className="text-gray-300 text-sm leading-relaxed mb-4">{user.bio}</p>}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-bold text-gray-400">
                  {user?.location && (
                    <span className="flex items-center gap-1.5 bg-[#0B0F19] px-4 py-2 rounded-xl border border-[#1E2532]">
                      <IoMdPin className="text-[#F5A623]"/> {user.location}
                    </span>
                  )}
                  {user?.website && (
                    <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-[#0B0F19] px-4 py-2 rounded-xl border border-[#1E2532] hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-colors">
                      🔗 Official Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ADVANCED STATS ── */}
        <div className="mb-8">
          <div className="flex bg-[#151A25]/80 backdrop-blur-xl border border-[#1E2532] rounded-[24px] p-2 divide-x divide-[#1E2532] shadow-lg">
            <div className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-[#1E2532]/50 transition-colors rounded-l-[20px] cursor-pointer">
              <span className="text-2xl font-black text-white drop-shadow-md">{userPosts.length}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#00F0FF] mt-1">Total Posts</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-[#1E2532]/50 transition-colors cursor-pointer">
              <span className="text-2xl font-black text-white drop-shadow-md">{user?.followersCount || 0}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Network Size</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-[#1E2532]/50 transition-colors rounded-r-[20px] cursor-pointer">
              <span className="text-2xl font-black text-white drop-shadow-md">{(userPosts.length * 124).toLocaleString()}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Profile Views</span>
            </div>
          </div>
        </div>

        {/* ── SMART TABS ── */}
        <div className="mb-6">
          <div className="flex bg-[#151A25] border border-[#1E2532] rounded-2xl p-1 relative max-w-md mx-auto shadow-inner">
            <button onClick={() => setActiveTab('grid')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'grid' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}><IoMdGrid size={16} /> Grid</button>
            <button onClick={() => setActiveTab('list')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'list' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg> List</button>
            {canEditProfile && <button onClick={() => setActiveTab('saved')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'saved' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}><IoMdBookmark size={16} /> Saved</button>}
            
            <div className={`absolute top-1 bottom-1 bg-[#1E2532] border border-gray-600/30 rounded-xl transition-all duration-300 ease-out shadow-md ${canEditProfile ? (activeTab === 'grid' ? 'left-1 w-[calc(33.33%-4px)]' : activeTab === 'list' ? 'left-[calc(33.33%+2px)] w-[calc(33.33%-4px)]' : 'left-[calc(66.66%+2px)] w-[calc(33.33%-4px)]') : (activeTab === 'grid' ? 'left-1 w-[calc(50%-4px)]' : 'left-[calc(50%+2px)] w-[calc(50%-4px)]')}`} />
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="pb-10 min-h-[300px]">
          {activeTab === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-bottom-4 duration-500">
              {userPosts.length === 0 ? <div className="col-span-full text-center py-20 text-gray-500">No data found in grid.</div> : (
                userPosts.map(post => (
                  <Link key={post._id} to={`/post/${post._id}`} className="relative aspect-[4/5] rounded-[24px] overflow-hidden group border border-[#1E2532] hover:border-[#00F0FF]/50 transition-all bg-[#151A25] shadow-lg">
                    {post.mediaType === 'video' ? <div className="w-full h-full flex items-center justify-center bg-black text-3xl group-hover:scale-110 transition-transform duration-700">🎬</div> : <img src={post.images?.[0]?.url || resolveMediaUrl(post.image)} alt="" className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${post.mediaFilter || ''}`} />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <p className="text-[11px] font-black text-white truncate drop-shadow-md mb-1.5">{post.title || 'Update'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#00F0FF] drop-shadow-md">{post.price ? `₹${post.price.toLocaleString('en-IN')}` : ''}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
          {activeTab === 'list' && (
            <div className="max-w-[470px] mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {userPosts.length === 0 ? <div className="text-center py-20 text-gray-500">No active listings.</div> : userPosts.map(post => <PostCard key={post._id} post={post} />)}
            </div>
          )}
          {activeTab === 'saved' && canEditProfile && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-bottom-4 duration-500">
              {savedPosts.length === 0 ? <div className="col-span-full text-center py-20 text-gray-500">Private Vault is Empty</div> : savedPosts.map(post => (
                <Link key={post._id} to={`/post/${post._id}`} className="relative aspect-[4/5] rounded-[24px] overflow-hidden group border border-[#1E2532] bg-[#151A25]">
                  {post.mediaType === 'video' ? <div className="w-full h-full flex items-center justify-center bg-black text-3xl group-hover:scale-110">🎬</div> : <img src={post.images?.[0]?.url || resolveMediaUrl(post.image)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 right-3 text-yellow-400"><IoMdBookmark size={24} /></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── 🚀 2045 FULL-SCREEN SETTINGS MODAL (Overlays the entire screen) ─── */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-[#0B0F19]/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          
          <div className="w-full max-w-4xl bg-[#151A25] border border-[#1E2532] rounded-[32px] overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.8)] flex flex-col md:flex-row h-[85vh] md:h-[600px] animate-in zoom-in-95 duration-300">
            
            {/* Modal Sidebar */}
            <div className="w-full md:w-64 bg-[#0B0F19]/50 border-r border-[#1E2532] p-6 flex flex-col">
              <h3 className="text-xl font-black italic tracking-tighter text-white mb-8">COMMAND CENTER</h3>
              
              <div className="flex flex-col gap-2 flex-1">
                <button onClick={() => setSettingsTab('personal')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${settingsTab === 'personal' ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30' : 'text-gray-500 hover:bg-[#1E2532] hover:text-white'}`}>
                  <IoMdPerson size={18} /> Personal Info
                </button>
                <button onClick={() => setSettingsTab('privacy')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${settingsTab === 'privacy' ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30' : 'text-gray-500 hover:bg-[#1E2532] hover:text-white'}`}>
                  <IoMdLock size={18} /> Privacy & Toggles
                </button>
                <button onClick={() => setSettingsTab('notifications')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${settingsTab === 'notifications' ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30' : 'text-gray-500 hover:bg-[#1E2532] hover:text-white'}`}>
                  <IoMdNotifications size={18} /> Notifications
                </button>
              </div>

              <button onClick={() => setIsEditing(false)} className="mt-auto px-4 py-3 bg-[#1E2532] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:text-red-500 transition-colors flex items-center justify-center gap-2 border border-[#2A3441]">
                <IoMdClose size={16} /> Close Panel
              </button>
            </div>

            {/* Modal Content Area */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar relative">
              
              {/* Avatar Upload Header */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#1E2532]">
                <div className="w-20 h-20 rounded-full border-2 border-[#1E2532] overflow-hidden relative group cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]" onClick={() => fileInputRef.current.click()}>
                  <img src={resolveMediaUrl(avatarPreview) || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <IoMdCamera size={24} className="text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Profile Identity</h4>
                  <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">Tap the image to change your avatar.</p>
                </div>
              </div>

              {/* TAB: Personal Info */}
              {settingsTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300 pb-20">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#00F0FF] uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-[#0B0F19] text-white border border-[#1E2532] p-4 rounded-2xl outline-none focus:border-[#00F0FF]/50 transition-all text-sm font-bold shadow-inner" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#00F0FF] uppercase tracking-widest ml-1">Phone Number</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0B0F19] text-white border border-[#1E2532] p-4 rounded-2xl outline-none focus:border-[#00F0FF]/50 transition-all text-sm font-bold shadow-inner" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-[#00F0FF] uppercase tracking-widest ml-1">Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-[#0B0F19] text-white border border-[#1E2532] p-4 rounded-2xl outline-none focus:border-[#00F0FF]/50 transition-all text-sm font-bold shadow-inner" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-[#00F0FF] uppercase tracking-widest ml-1">Bio</label>
                    <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-[#0B0F19] text-white border border-[#1E2532] p-4 rounded-2xl h-24 outline-none focus:border-[#00F0FF]/50 transition-all text-sm font-bold resize-none shadow-inner" />
                  </div>
                </div>
              )}

              {/* TAB: Privacy & Security */}
              {settingsTab === 'privacy' && (
                <div className="space-y-6 animate-in fade-in duration-300 pb-20">
                  <div className="flex items-center justify-between p-5 bg-[#0B0F19] border border-[#1E2532] rounded-3xl shadow-inner">
                    <div>
                      <p className="text-sm font-black text-white flex items-center gap-2"><IoMdLock className="text-[#00F0FF]"/> Private Account</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-1">Only approved followers can see your posts and listings.</p>
                    </div>
                    {/* iOS Style Neon Toggle */}
                    <button onClick={() => setFormData({...formData, isPrivate: !formData.isPrivate})} className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${formData.isPrivate ? 'bg-[#00F0FF]' : 'bg-[#1E2532]'}`}>
                      <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all shadow-md ${formData.isPrivate ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-[#0B0F19] border border-[#1E2532] rounded-3xl shadow-inner">
                    <div>
                      <p className="text-sm font-black text-white flex items-center gap-2"><IoMdStar className="text-yellow-500"/> Hide Online Status</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-1">Turn off the green dot on your profile and messages.</p>
                    </div>
                    <button onClick={() => setFormData({...formData, hideActivity: !formData.hideActivity})} className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${formData.hideActivity ? 'bg-yellow-500' : 'bg-[#1E2532]'}`}>
                      <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all shadow-md ${formData.hideActivity ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: Notifications */}
              {settingsTab === 'notifications' && (
                <div className="space-y-6 animate-in fade-in duration-300 pb-20">
                  <div className="flex items-center justify-between p-5 bg-[#0B0F19] border border-[#1E2532] rounded-3xl shadow-inner">
                    <div>
                      <p className="text-sm font-black text-white flex items-center gap-2"><IoMdMail className="text-[#00F0FF]"/> Email Alerts</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-1">Get emails when someone messages you or saves your post.</p>
                    </div>
                    <button onClick={() => setFormData({...formData, emailAlerts: !formData.emailAlerts})} className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${formData.emailAlerts ? 'bg-[#00F0FF]' : 'bg-[#1E2532]'}`}>
                      <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all shadow-md ${formData.emailAlerts ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#151A25] via-[#151A25] to-transparent">
                <button onClick={handleUpdate} className="w-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white py-4 rounded-2xl font-black tracking-widest uppercase shadow-[0_10px_30px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}