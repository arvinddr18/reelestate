import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  IoMdSettings, IoMdCamera, IoMdGrid, IoMdClose, IoMdCreate, 
  IoMdPin, IoMdCall, IoMdMail, IoMdArrowBack, IoMdBookmark, 
  IoMdHeart, IoMdCheckmarkCircle, IoMdTime, IoMdStar, IoMdShareAlt,
  IoMdPerson, IoMdLock, IoMdNotifications, IoMdCard, IoMdColorPalette,
  IoMdAnalytics, IoMdHelpCircle, IoMdInformationCircle
} from 'react-icons/io';
import { MdOutlineDoubleArrow, MdShield, MdBlock, MdAutoAwesome, MdLaptopMac, MdSmartphone } from 'react-icons/md';
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
  const token = localStorage.getItem('reelestate_token');
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

  const [isEditing, setIsEditing] = useState(false);
  const [settingsTab, setSettingsTab] = useState('personal');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({ 
    fullName: '', bio: '', location: '', phone: '', website: '',
    isPrivate: false, hideActivity: false, emailAlerts: true
  });

  const canEditProfile = !userId || String(userId) === String(currentUser?._id);

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
          isPrivate: userData.isPrivate || false,
          hideActivity: userData.hideActivity || false,
          emailAlerts: userData.emailAlerts !== false,
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
        
        {/* ── 2050 HOLOGRAPHIC ID CARD (MERGED PROFILE & STATS) ── */}
        <div className="relative bg-[#151A25]/60 backdrop-blur-3xl border border-white/5 rounded-[40px] p-6 md:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] mb-8 overflow-hidden group hover:border-white/10 transition-colors duration-500">
          
          {/* Ambient Glass Shimmers */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/40 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#0057FF]/40 to-transparent" />
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#00F0FF]/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-[#00F0FF]/10 transition-colors duration-700" />

          {/* ── TOP HALF: IDENTITY & ACTIONS ── */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            
            {/* The "Nexus Ring" Avatar */}
            <div className="relative shrink-0 w-36 h-36 md:w-40 md:h-40 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[2px] border-dashed border-[#00F0FF]/40 animate-[spin_12s_linear_infinite] group-hover:border-[#00F0FF]/80 group-hover:animate-[spin_4s_linear_infinite] transition-all duration-500" />
              <div className="absolute inset-2 rounded-full border-[2px] border-dotted border-[#0057FF]/50 animate-[spin_10s_linear_infinite_reverse] group-hover:border-[#0057FF] group-hover:animate-[spin_3s_linear_infinite_reverse] transition-all duration-500" />
              
              <div className="absolute inset-4 rounded-full bg-[#0B0F19] overflow-hidden border-[1.5px] border-[#00F0FF]/20 shadow-[0_0_30px_rgba(0,240,255,0.2)] flex items-center justify-center text-4xl font-black text-white group-hover:scale-105 transition-transform duration-500">
                {avatarPreview ? (
                  <img src={resolveMediaUrl(avatarPreview)} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span>{user?.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Identity Details */}
            <div className="flex-1 text-center md:text-left w-full mt-2 md:mt-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                <div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {user?.fullName || `@${user?.username}`}
                    {user?.isVerified && <IoMdCheckmarkCircle className="text-[#00F0FF] drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]" size={28} />}
                    {user?.isPrivate && <IoMdLock className="text-gray-500" size={20} title="Private Vault" />}
                  </h2>
                  
                  {/* Digital Footprint Labels */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                    <span className="bg-[#1E2532]/80 backdrop-blur-md text-[#00F0FF] text-[10px] font-black tracking-[0.2em] px-3 py-1.5 rounded-lg border border-[#00F0FF]/20 uppercase">
                      {user?.role || 'Verified Member'}
                    </span>
                    <span className="bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 text-emerald-400 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg border border-emerald-500/20 uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative" />
                      Live Node
                    </span>
                  </div>
                </div>

                {/* Cyber-Actions */}
                <div className="flex items-center justify-center shrink-0">
                  {canEditProfile ? (
                    <button onClick={() => setIsEditing(true)} className="px-6 py-3.5 rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all flex items-center gap-2 bg-[#151A25] text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/10 hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] active:scale-95">
                      <IoMdSettings size={18} className="animate-[spin_4s_linear_infinite]"/> System Config
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button className="px-6 py-3.5 rounded-2xl font-black text-[10px] tracking-widest uppercase bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-105 active:scale-95 flex items-center gap-2">
                        <IoMdCall size={16}/> Connect
                      </button>
                      <button onClick={() => navigate(`/messages/${userId}`)} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#151A25] text-white hover:text-[#00F0FF] border border-white/10 transition-all hover:border-[#00F0FF]/50 active:scale-95 shadow-lg">
                        <IoMdMail size={20}/>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio & Location HUD */}
              <div className="mt-6">
                {user?.bio && <p className="text-gray-300 text-sm leading-relaxed mb-4 max-w-2xl">{user.bio}</p>}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {user?.location && (
                    <span className="flex items-center gap-1.5 bg-[#0B0F19]/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 text-[11px] font-bold text-gray-400 tracking-wide shadow-inner">
                      <IoMdPin className="text-[#F5A623]"/> {user.location}
                    </span>
                  )}
                  {user?.website && (
                    <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-[#0B0F19]/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 text-[11px] font-bold text-gray-400 tracking-wide hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-all shadow-inner">
                      🔗 Neural Link
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM HALF: NEON HUD STATS ── */}
          <div className="mt-8 pt-6 relative border-t border-white/5">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              
              <div className="flex flex-col items-center justify-center py-4 bg-[#0B0F19]/30 rounded-2xl hover:bg-[#0B0F19]/80 border border-transparent hover:border-[#00F0FF]/20 transition-all cursor-default group/stat">
                <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover/stat:from-white group-hover/stat:to-[#00F0FF] transition-all">
                  {userPosts.length}
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00F0FF]/60 mt-1 group-hover/stat:text-[#00F0FF]">Total Posts</span>
              </div>

              <div className="flex flex-col items-center justify-center py-4 bg-[#0B0F19]/30 rounded-2xl hover:bg-[#0B0F19]/80 border border-transparent hover:border-purple-500/20 transition-all cursor-default group/stat">
                <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover/stat:from-white group-hover/stat:to-purple-400 transition-all">
                  {user?.followersCount || 0}
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400/60 mt-1 group-hover/stat:text-purple-400">Network Size</span>
              </div>

              <div className="flex flex-col items-center justify-center py-4 bg-[#0B0F19]/30 rounded-2xl hover:bg-[#0B0F19]/80 border border-transparent hover:border-[#F5A623]/20 transition-all cursor-default group/stat">
                <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover/stat:from-white group-hover/stat:to-[#F5A623] transition-all">
                  {(userPosts.length * 124 + 342).toLocaleString()}
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F5A623]/60 mt-1 group-hover/stat:text-[#F5A623]">Global Reach</span>
              </div>

            </div>
          </div>
        </div>

        {/* ── 2050 SMART TABS (LIQUID ENERGY SLIDER) ── */}
        <div className="mb-8 relative z-20">
          <div className="flex bg-[#0B0F19]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-1.5 relative max-w-md mx-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            
            <div className={`absolute top-1.5 bottom-1.5 bg-gradient-to-r from-[#0057FF] to-[#00F0FF] rounded-xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_0_20px_rgba(0,240,255,0.4)] ${canEditProfile ? (activeTab === 'grid' ? 'left-1.5 w-[calc(33.33%-4px)]' : activeTab === 'list' ? 'left-[calc(33.33%+2px)] w-[calc(33.33%-4px)]' : 'left-[calc(66.66%+2px)] w-[calc(33.33%-4px)]') : (activeTab === 'grid' ? 'left-1.5 w-[calc(50%-4px)]' : 'left-[calc(50%+2px)] w-[calc(50%-4px)]')}`} />

            <button onClick={() => setActiveTab('grid')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 z-10 ${activeTab === 'grid' ? 'text-white drop-shadow-md' : 'text-gray-500 hover:text-white'}`}>
              <IoMdGrid size={16} className={activeTab === 'grid' ? 'animate-pulse' : ''} /> Grid
            </button>
            
            <button onClick={() => setActiveTab('list')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 z-10 ${activeTab === 'list' ? 'text-white drop-shadow-md' : 'text-gray-500 hover:text-white'}`}>
              <svg className={`w-4 h-4 ${activeTab === 'list' ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg> List
            </button>
            
            {canEditProfile && (
              <button onClick={() => setActiveTab('saved')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 z-10 ${activeTab === 'saved' ? 'text-white drop-shadow-md' : 'text-gray-500 hover:text-white'}`}>
                <IoMdBookmark size={16} className={activeTab === 'saved' ? 'animate-pulse' : ''} /> Vault
              </button>
            )}
            
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="pb-10 min-h-[300px]">
          {activeTab === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 animate-in slide-in-from-bottom-4 duration-500">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 animate-in slide-in-from-bottom-4 duration-500">
              {savedPosts.length === 0 ? <div className="col-span-full text-center py-20 text-gray-500 font-bold uppercase tracking-widest text-xs">Private Vault is Empty</div> : savedPosts.map(post => (
                <Link key={post._id} to={`/post/${post._id}`} className="relative aspect-[4/5] rounded-[24px] md:rounded-[32px] overflow-hidden group border border-[#1E2532] bg-[#151A25]">
                  {post.mediaType === 'video' ? <div className="w-full h-full flex items-center justify-center bg-black text-3xl group-hover:scale-110 transition-transform duration-700">🎬</div> : <img src={post.images?.[0]?.url || resolveMediaUrl(post.image)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"><IoMdBookmark size={24} /></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── 🚀 2050 COMMAND CENTER MODAL (SYSTEM CONFIG) ─── */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-[#05070A]/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          
          <div className="w-full h-full max-w-[1300px] bg-[#0B0F19] border border-[#1E2532] rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            
            {/* ── SIDEBAR ── */}
            <div className="w-full md:w-[280px] lg:w-[320px] flex-shrink-0 bg-[#0B0F19] border-r border-[#1E2532] flex flex-col">
              
              <div className="p-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                  <span className="font-black text-white text-sm">N</span>
                </div>
                <span className="text-xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF]">
                  NODEXA
                </span>
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
                      onClick={() => setSettingsTab(item.id)}
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

              <div className="p-6">
                <button onClick={() => setIsEditing(false)} className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-gray-400 hover:text-white bg-[#151A25] hover:bg-[#1E2532] transition-all text-[12px] font-bold border border-[#1E2532] hover:border-gray-500 shadow-sm active:scale-95">
                  <IoMdArrowBack size={18} /> Back to App
                </button>
              </div>
            </div>

            {/* ── CONTENT AREA ── */}
            <div className="flex-1 bg-[#05070A] overflow-y-auto no-scrollbar relative p-6 md:p-12">
              <div className="max-w-3xl mx-auto">
                
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
                        <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] cursor-pointer transition-colors group">
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
                        <p className="text-xs text-gray-500 mt-1">You're logged in on 2 devices</p>
                      </div>
                      <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] transition-colors">
                          <div className="flex items-center gap-4">
                            <MdLaptopMac size={22} className="text-gray-400" />
                            <p className="text-sm font-medium text-gray-300">MacBook Pro <span className="text-gray-500 mx-1">•</span> Chrome <span className="text-gray-500 mx-1">•</span> Bangalore</p>
                          </div>
                          <span className="text-[11px] font-bold text-[#0057FF] bg-[#0057FF]/10 px-3 py-1 rounded-full border border-[#0057FF]/20">Current</span>
                        </div>
                        <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] transition-colors">
                          <div className="flex items-center gap-4">
                            <MdSmartphone size={22} className="text-gray-400" />
                            <p className="text-sm font-medium text-gray-300">iPhone 14 <span className="text-gray-500 mx-1">•</span> Mobile <span className="text-gray-500 mx-1">•</span> Bangalore</p>
                          </div>
                          <span className="text-xs text-gray-500">2 days ago</span>
                        </div>
                        <button className="w-full p-5 flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold">
                          <IoMdArrowBack size={16} className="rotate-180" /> Logout from All Devices
                        </button>
                      </div>
                    </div>

                    <div className="mb-10">
                      <h3 className="text-[15px] font-bold text-white mb-4">Data & Safety</h3>
                      <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] transition-colors">
                          <div className="flex items-center gap-4">
                            <MdShield size={22} className="text-gray-400" />
                            <div>
                              <p className="text-sm font-bold text-white">Login Alerts</p>
                              <p className="text-xs text-gray-500 mt-0.5">Get notified of new sign-ins</p>
                            </div>
                          </div>
                          <button className="w-12 h-6 rounded-full bg-[#0057FF] relative transition-colors shadow-inner border border-[#0057FF]">
                            <div className="w-5 h-5 rounded-full bg-white absolute top-[1px] right-[2px] shadow-sm transition-all" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] cursor-pointer transition-colors group">
                          <div className="flex items-center gap-4">
                            <IoMdPerson size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                            <div>
                              <p className="text-sm font-bold text-white">Trusted Contacts</p>
                              <p className="text-xs text-gray-500 mt-0.5">Manage recovery contacts</p>
                            </div>
                          </div>
                          <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                        </div>
                        <div className="flex items-center justify-between p-5 hover:bg-[#151A25] cursor-pointer transition-colors group">
                          <div className="flex items-center gap-4">
                            <IoMdTime size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                            <div>
                              <p className="text-sm font-bold text-white">Account Recovery</p>
                              <p className="text-xs text-gray-500 mt-0.5">Set up recovery options</p>
                            </div>
                          </div>
                          <IoMdArrowBack size={18} className="text-gray-500 rotate-180" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: PERSONAL INFO ── */}
                {settingsTab === 'personal' && (
                  <div className="animate-in fade-in duration-500 pb-20">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-[#151A25] border border-[#1E2532] flex items-center justify-center shadow-inner">
                        <IoMdPerson size={28} className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white">Personal Info</h2>
                        <p className="text-sm text-gray-400 font-medium mt-1">Manage your identity and public profile.</p>
                      </div>
                    </div>

                    <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] p-6 mb-8 flex items-center gap-6">
                      <div className="w-20 h-20 rounded-full border-2 border-[#1E2532] overflow-hidden relative group cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]" onClick={() => fileInputRef.current.click()}>
                        <img src={resolveMediaUrl(avatarPreview) || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <IoMdCamera size={24} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-white">Profile Photo</h4>
                        <p className="text-xs text-gray-500 mt-1">Tap the image to change your avatar.</p>
                      </div>
                    </div>

                    <h3 className="text-[15px] font-bold text-white mb-4">Profile Details</h3>
                    <div className="bg-[#0B0F19] border border-[#1E2532] rounded-[24px] p-6 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 ml-1">Full Name</label>
                        <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-[#151A25] text-white border border-[#1E2532] p-4 rounded-xl outline-none focus:border-[#0057FF] transition-all text-sm font-bold shadow-inner" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 ml-1">Location</label>
                        <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-[#151A25] text-white border border-[#1E2532] p-4 rounded-xl outline-none focus:border-[#0057FF] transition-all text-sm font-bold shadow-inner" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-gray-400 ml-1">Bio</label>
                        <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-[#151A25] text-white border border-[#1E2532] p-4 rounded-xl h-24 outline-none focus:border-[#0057FF] transition-all text-sm font-bold resize-none shadow-inner" />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                       <button onClick={handleUpdate} className="bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white px-8 py-3.5 rounded-xl font-bold tracking-wide shadow-[0_10px_30px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                         Save Changes
                       </button>
                    </div>
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
                        <div className="flex items-center justify-between p-5 border-b border-[#1E2532] hover:bg-[#151A25] transition-colors">
                          <div className="flex items-center gap-4">
                            <IoMdLock size={22} className="text-gray-400" />
                            <div>
                              <p className="text-sm font-bold text-white">Private Account</p>
                              <p className="text-xs text-gray-500 mt-0.5">Only approved followers can see your posts.</p>
                            </div>
                          </div>
                          <button onClick={() => setFormData({...formData, isPrivate: !formData.isPrivate})} className={`w-12 h-6 rounded-full relative transition-colors shadow-inner border ${formData.isPrivate ? 'bg-[#0057FF] border-[#0057FF]' : 'bg-[#1E2532] border-[#2A3441]'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-[1px] shadow-sm transition-all ${formData.isPrivate ? 'right-[2px]' : 'left-[2px]'}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-5 hover:bg-[#151A25] transition-colors">
                          <div className="flex items-center gap-4">
                            <IoMdStar size={22} className="text-gray-400" />
                            <div>
                              <p className="text-sm font-bold text-white">Hide Online Status</p>
                              <p className="text-xs text-gray-500 mt-0.5">Turn off the green dot on your profile.</p>
                            </div>
                          </div>
                          <button onClick={() => setFormData({...formData, hideActivity: !formData.hideActivity})} className={`w-12 h-6 rounded-full relative transition-colors shadow-inner border ${formData.hideActivity ? 'bg-[#0057FF] border-[#0057FF]' : 'bg-[#1E2532] border-[#2A3441]'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-[1px] shadow-sm transition-all ${formData.hideActivity ? 'right-[2px]' : 'left-[2px]'}`} />
                          </button>
                        </div>
                     </div>
                     <div className="mt-8 flex justify-end">
                       <button onClick={handleUpdate} className="bg-[#1E2532] text-[#00F0FF] border border-[#00F0FF]/30 px-8 py-3.5 rounded-xl font-bold tracking-wide hover:bg-[#00F0FF]/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all">
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

    </div>
  );
}