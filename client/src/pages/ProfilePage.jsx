import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { IoMdSettings, IoMdCamera, IoMdGrid, IoMdClose, IoMdCreate, IoMdTrash, IoMdPin, IoMdCall, IoMdMail } from 'react-icons/io';
import PostCard from '../components/feed/PostCard'; // 👈 ADDED POSTCARD IMPORT

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

const safeText = (value) => (value === null || value === undefined) ? '' : String(value);

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]); 
  const [activeTab, setActiveTab] = useState('grid'); // 👈 ADDED TAB STATE
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', bio: '', location: '', phone: '', website: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        const id = userId || loggedInUser?._id;
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
          website: userData.website || ''
        });
        setAvatarPreview(userData.profilePhoto || userData.avatar || null);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

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

  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = loggedInUser?._id || loggedInUser?.id;
  const canEditProfile = !userId || userId === currentUserId;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans pb-24 overflow-y-auto no-scrollbar">
      
      {/* ── TOP BANNER (Deep Navy Gradient) ── */}
      <div className="h-48 bg-gradient-to-b from-[#0057FF]/20 via-[#0B0F19] to-[#0B0F19] border-b border-[#1E2532] relative overflow-hidden">
        {/* Subtle grid pattern for premium feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
        
        {/* ── PROFILE INFO CARD (Frosted Glass) ── */}
        <div className="bg-[#151A25]/90 backdrop-blur-2xl border border-[#1E2532] rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            
            {/* Avatar Section */}
            <div className="relative group shrink-0">
              <div className="w-32 h-32 rounded-full bg-[#0B0F19] border-4 border-[#151A25] p-1 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)] flex items-center justify-center text-4xl font-black transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(0,240,255,0.4)]">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={resolveMediaUrl(avatarPreview)} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <span className="text-white">{user?.username?.[0].toUpperCase()}</span>
                  )}
                </div>
              </div>
              
              {canEditProfile && (
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 bg-[#0B0F19] p-2.5 rounded-full border-2 border-[#1E2532] text-[#00F0FF] hover:text-white hover:bg-[#00F0FF] hover:border-[#00F0FF] transition-all z-10 shadow-lg cursor-pointer"
                  title="Change Profile Photo"
                >
                  <IoMdCamera size={20} />
                </button>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => setAvatarPreview(reader.result);
                }
              }} />
            </div>

            {/* Profile Details Section */}
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                    {user?.fullName || `@${user?.username}`}
                    {user?.isVerified && <span className="text-[#00F0FF] text-xl drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">✓</span>}
                  </h2>
                  <p className="text-[#00F0FF] text-sm font-bold tracking-widest uppercase mt-1">
                    {user?.role || 'Digital Agent'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3">
                  {canEditProfile ? (
                    <button 
                      onClick={() => setIsEditing(!isEditing)} 
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 ${isEditing ? 'bg-[#1E2532] text-white hover:bg-[#2A3441]' : 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95'}`}
                    >
                      {isEditing ? <IoMdClose size={18}/> : <IoMdSettings size={18}/>}
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  ) : (
                    <>
                      <button className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-105 active:scale-95 flex items-center gap-2">
                        <IoMdCall size={16}/> Call
                      </button>
                      <button onClick={() => navigate(`/messages/${userId}`)} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#1E2532] text-white hover:text-[#00F0FF] border border-[#2A3441] transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                        <IoMdMail size={16}/> Message
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio & Details */}
              <div className="mt-4 max-w-2xl mx-auto md:mx-0">
                {user?.bio && <p className="text-gray-300 text-sm leading-relaxed mb-3">{user.bio}</p>}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-gray-400">
                  {user?.location && (
                    <span className="flex items-center gap-1.5 bg-[#0B0F19] px-3 py-1.5 rounded-full border border-[#1E2532]">
                      <IoMdPin className="text-[#F5A623]"/> {user.location}
                    </span>
                  )}
                  {user?.website && (
                    <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-[#0B0F19] px-3 py-1.5 rounded-full border border-[#1E2532] hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-colors">
                      🔗 Website
                    </a>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex gap-4 md:gap-8 mt-6 justify-center md:justify-start pt-6 border-t border-[#1E2532]">
                <div className="text-center md:text-left">
                  <p className="text-xl font-black text-white">{userPosts.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Posts</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl font-black text-white">{user?.followersCount || 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Followers</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl font-black text-white">{(userPosts.length * 124).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Total Views</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* ── EDIT PROFILE FORM (Dark Glass Theme) ── */}
        {isEditing && (
          <div className="mt-6 bg-[#151A25] border border-[#1E2532] rounded-3xl p-6 md:p-8 animate-in slide-in-from-top shadow-xl">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <IoMdCreate className="text-[#00F0FF]"/> Update Profile Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input type="text" placeholder="John Doe" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-[#0B0F19] text-white border border-[#1E2532] p-3.5 rounded-xl outline-none focus:border-[#00F0FF]/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone / WhatsApp</label>
                <input type="text" placeholder="+1 234 567 8900" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0B0F19] text-white border border-[#1E2532] p-3.5 rounded-xl outline-none focus:border-[#00F0FF]/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Location / District</label>
                <input type="text" placeholder="New York, USA" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-[#0B0F19] text-white border border-[#1E2532] p-3.5 rounded-xl outline-none focus:border-[#00F0FF]/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Website URL</label>
                <input type="text" placeholder="https://yourwebsite.com" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="w-full bg-[#0B0F19] text-white border border-[#1E2532] p-3.5 rounded-xl outline-none focus:border-[#00F0FF]/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all text-sm" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bio</label>
                <textarea placeholder="Tell clients about yourself..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-[#0B0F19] text-white border border-[#1E2532] p-3.5 rounded-xl h-24 outline-none focus:border-[#00F0FF]/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all text-sm resize-none" />
              </div>
            </div>
            
            <button onClick={handleUpdate} className="mt-6 w-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white py-4 rounded-xl font-black tracking-widest uppercase shadow-[0_4px_20px_rgba(0,240,255,0.3)] active:scale-95 transition-all">
              Save Profile Changes
            </button>
          </div>
        )}

        {/* ── 👈 NEW: INSTAGRAM-STYLE TABS START HERE ── */}
        <div className="mt-12">
          
          {/* Tabs Navigation */}
          <div className="flex border-t border-[#1E2532]">
            <button 
              onClick={() => setActiveTab('grid')}
              className={`flex-1 py-4 text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all ${
                activeTab === 'grid' ? 'text-[#00F0FF] border-t-2 border-[#00F0FF] -mt-[1px]' : 'text-gray-500 hover:text-white'
              }`}
            >
              <IoMdGrid size={18} />
              GRID
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-4 text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all ${
                activeTab === 'list' ? 'text-[#00F0FF] border-t-2 border-[#00F0FF] -mt-[1px]' : 'text-gray-500 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              FEED
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-1 pb-10">
            
            {/* 📸 TAB 1: SOCIAL GRID */}
            {activeTab === 'grid' && (
              <div className="grid grid-cols-3 gap-1">
                {userPosts.map(post => (
                  <div key={post._id} onClick={() => setSelectedPost(post)} className="relative aspect-square bg-[#151A25] overflow-hidden group cursor-pointer">
                    {post.mediaType === 'video' ? (
                      <video src={post.videoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={post.images?.[0]?.url || resolveMediaUrl(post.image)} className="w-full h-full object-cover" alt="Post" />
                    )}
                    
                    {post.mediaType === 'video' && (
                      <div className="absolute top-2 right-2 text-white drop-shadow-md">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" /><path d="M3 6a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" /></svg>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-bold">
                      <span className="flex items-center gap-1"><span className="text-red-500">❤</span> {post.likesCount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 🏠 TAB 2: LISTINGS FEED */}
            {activeTab === 'list' && (
              <div className="max-w-[470px] mx-auto mt-6 space-y-6">
                {userPosts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}

            {/* EMPTY STATE */}
            {userPosts.length === 0 && (
              <div className="text-center py-20 bg-[#151A25]/50 border border-dashed border-[#1E2532] rounded-[32px] mt-6 shadow-inner mx-4">
                <div className="w-16 h-16 bg-[#0B0F19] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1E2532]">
                  <IoMdGrid size={24} className="text-gray-600"/>
                </div>
                <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-1">NO POSTS YET</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">When you share content, it will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;