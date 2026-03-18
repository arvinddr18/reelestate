import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdSettings, IoMdCamera, IoMdGrid, IoMdClose, IoMdCreate, IoMdTrash, IoMdPin, IoMdCall, IoMdMail } from 'react-icons/io';

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
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Properties</p>
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

        {/* ── PORTFOLIO GRID (Listings) ── */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6 border-b border-[#1E2532] pb-4">
            <h3 className="text-sm font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-3">
              <IoMdGrid size={20} className="text-[#00F0FF]"/> Property Portfolio
            </h3>
            <span className="bg-[#151A25] border border-[#1E2532] px-3 py-1 rounded-full text-xs font-bold text-[#00F0FF]">
              {userPosts.length} Active
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {userPosts.map((post) => (
              <div 
                key={post._id} 
                onClick={() => setSelectedPost(post)}
                className="aspect-square bg-[#151A25] rounded-2xl overflow-hidden border border-[#1E2532] group relative cursor-pointer shadow-sm hover:shadow-xl transition-all"
              >
                {/* Media Logic */}
                {post.mediaType === 'video' ? (
                  <video src={post.videoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <img src={post.images?.[0]?.url || resolveMediaUrl(post.image)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Property" />
                )}

                {/* Floating Price Tag */}
                <div className="absolute top-2 right-2 bg-[#0B0F19]/80 backdrop-blur-md text-[#F5A623] text-[10px] font-black tracking-wider px-2 py-1 rounded-md border border-white/10 shadow-md">
                  {post.price ? `₹${(post.price/100000).toFixed(1)}L` : 'FOR SALE'}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/90 via-[#0B0F19]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-white font-bold text-sm truncate">{post.title || "Property Listing"}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><span className="text-red-500">❤</span> {post.likesCount || 0}</span>
                    <span className="flex items-center gap-1"><span className="text-[#00F0FF]">👁</span> {post.viewsCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {userPosts.length === 0 && (
            <div className="text-center py-20 bg-[#151A25] border border-dashed border-[#1E2532] rounded-[32px] shadow-inner">
              <div className="w-16 h-16 bg-[#0B0F19] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1E2532]">
                <IoMdGrid size={24} className="text-gray-600"/>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No Properties Listed Yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;