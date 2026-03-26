import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { IoMdSettings, IoMdCamera, IoMdGrid, IoMdClose, IoMdCreate, IoMdTrash, IoMdPin, IoMdCall, IoMdMail, IoMdArrowBack, IoMdBookmark, IoMdHeart } from 'react-icons/io';
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
  const [savedPosts, setSavedPosts] = useState([]); // 👈 New state for saved posts
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'list' | 'saved'
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', bio: '', location: '', phone: '', website: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = loggedInUser?._id || loggedInUser?.id;
  const canEditProfile = !userId || userId === currentUserId;

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
          website: userData.website || ''
        });
        setAvatarPreview(userData.profilePhoto || userData.avatar || null);

        // Fetch Saved Posts if viewing own profile
        if (canEditProfile) {
          try {
            // Note: Update this endpoint if your backend uses a different route for saved posts
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

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans pb-24 overflow-x-hidden relative">
      
      {/* ── STICKY TOP BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between pointer-events-auto">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <IoMdArrowBack size={20} />
          </button>
          {canEditProfile && (
            <button onClick={() => setIsEditing(!isEditing)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-[#00F0FF] transition-colors">
              <IoMdSettings size={20} />
            </button>
          )}
        </div>
      </header>

      {/* ── HERO BANNER (Dynamic Cube Gradient) ── */}
      <div className="h-48 md:h-64 bg-gradient-to-tr from-[#0057FF] via-[#00F0FF] to-[#0B0F19] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
        
        {/* ── PROFILE INFO CARD (Frosted Glass) ── */}
        <div className="bg-[#151A25]/90 backdrop-blur-2xl border border-[#1E2532] rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] mb-8">
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
                      {isEditing ? <IoMdClose size={18}/> : <IoMdCreate size={18}/>}
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

              {/* Bio & Links */}
              <div className="mt-4 max-w-2xl mx-auto md:mx-0">
                {user?.bio && <p className="text-gray-300 text-sm leading-relaxed mb-4">{user.bio}</p>}
                
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
            </div>
          </div>
        </div>

        {/* ── STATS COMMAND CENTER (Floating Glass Row) ── */}
        <div className="mb-8">
          <div className="flex bg-[#151A25] border border-[#1E2532] rounded-3xl p-4 divide-x divide-[#1E2532] shadow-inner">
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{userPosts.length}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">Posts</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{user?.followersCount || 0}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">Followers</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{(userPosts.length * 124).toLocaleString()}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">Total Views</span>
            </div>
          </div>
        </div>

        {/* ── EDIT PROFILE FORM ── */}
        {isEditing && (
          <div className="mb-8 bg-[#151A25] border border-[#1E2532] rounded-3xl p-6 md:p-8 animate-in slide-in-from-top shadow-xl">
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

        {/* ── SMART TABS (Sliding Glass Indicator) ── */}
        <div className="mb-6">
          <div className="flex bg-[#151A25] border border-[#1E2532] rounded-2xl p-1 relative max-w-md mx-auto">
            <button 
              onClick={() => setActiveTab('grid')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'grid' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <IoMdGrid size={16} /> Grid
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'list' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg> List
            </button>
            
            {canEditProfile && (
              <button 
                onClick={() => setActiveTab('saved')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === 'saved' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <IoMdBookmark size={16} /> Saved
              </button>
            )}

            {/* Sliding Background Box */}
            <div className={`absolute top-1 bottom-1 bg-[#1E2532] border border-gray-600/20 rounded-xl transition-all duration-300 ease-out shadow-md ${
              canEditProfile 
                ? (activeTab === 'grid' ? 'left-1 w-[calc(33.33%-4px)]' : activeTab === 'list' ? 'left-[calc(33.33%+2px)] w-[calc(33.33%-4px)]' : 'left-[calc(66.66%+2px)] w-[calc(33.33%-4px)]')
                : (activeTab === 'grid' ? 'left-1 w-[calc(50%-4px)]' : 'left-[calc(50%+2px)] w-[calc(50%-4px)]')
            }`} />
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="pb-10 min-h-[300px]">
          
          {/* TAB 1: IMMERSIVE GRID */}
          {activeTab === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-bottom-4 duration-500">
              {userPosts.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500">No posts yet.</div>
              ) : (
                userPosts.map(post => (
                  <Link key={post._id} to={`/post/${post._id}`} className="relative aspect-[4/5] rounded-2xl overflow-hidden group border border-[#1E2532] hover:border-[#00F0FF]/50 transition-all bg-[#151A25]">
                    
                    {post.mediaType === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-black text-3xl group-hover:scale-110 transition-transform duration-500">🎬</div>
                    ) : (
                      <img src={post.images?.[0]?.url || resolveMediaUrl(post.image)} alt="" className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${post.mediaFilter || ''}`} />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                    {post.mainCategory && post.mainCategory !== 'Social' && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black text-[#00F0FF] uppercase tracking-widest border border-[#00F0FF]/20">
                        {post.mainCategory}
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <p className="text-[10px] font-black text-white truncate drop-shadow-md mb-1">{post.title || 'Update'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#00F0FF] drop-shadow-md">
                          {post.price ? `₹${post.price.toLocaleString('en-IN')}` : (post.salary ? post.salary : '')}
                        </span>
                        <span className="text-[9px] font-bold text-gray-300 flex items-center gap-1">
                          <IoMdHeart size={10} className="text-red-500"/> {post.likesCount || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* TAB 2: LISTINGS FEED */}
          {activeTab === 'list' && (
            <div className="max-w-[470px] mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {userPosts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No posts yet.</div>
              ) : (
                userPosts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))
              )}
            </div>
          )}

          {/* TAB 3: SAVED POSTS (Private) */}
          {activeTab === 'saved' && canEditProfile && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-bottom-4 duration-500">
              {savedPosts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-center py-20 text-gray-500">
                  <IoMdBookmark size={40} className="mb-4 text-[#1E2532]" />
                  <p className="font-bold uppercase tracking-widest text-xs">No Saved Items</p>
                  <p className="text-[10px] mt-2 max-w-xs">Properties and items you save will appear here privately.</p>
                </div>
              ) : (
                savedPosts.map(post => (
                  <Link key={post._id} to={`/post/${post._id}`} className="relative aspect-[4/5] rounded-2xl overflow-hidden group border border-[#1E2532] hover:border-yellow-400/50 transition-all bg-[#151A25]">
                    {post.mediaType === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-black text-3xl group-hover:scale-110 transition-transform duration-500">🎬</div>
                    ) : (
                      <img src={post.images?.[0]?.url || resolveMediaUrl(post.image)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2 text-yellow-400 drop-shadow-md">
                      <IoMdBookmark size={20} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <p className="text-[10px] font-black text-white truncate drop-shadow-md mb-1">{post.title || 'Saved Item'}</p>
                      <span className="text-[10px] font-black text-yellow-400 drop-shadow-md">
                        {post.price ? `₹${post.price.toLocaleString('en-IN')}` : ''}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}