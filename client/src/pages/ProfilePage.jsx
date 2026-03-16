import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdSettings, IoMdCamera, IoMdGrid, IoMdClose, IoMdCreate, IoMdTrash, IoMdPin } from 'react-icons/io';

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
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostData, setEditPostData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        const id = userId || loggedInUser?._id;
        const res = await axios.get(getApiUrl(`/api/users/${id}`), getAuthConfig());
        
        // Safety check for different data structures
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

  if (loading) return <div className="h-screen bg-brand-950 flex items-center justify-center text-white font-bold">LOADING PROFILE...</div>;

  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = loggedInUser?._id || loggedInUser?.id;
  const canEditProfile = !userId || userId === currentUserId;

  return (
    <div className="min-h-screen bg-brand-950 text-white font-sans pb-20 overflow-y-auto no-scrollbar">
      {/* Top Banner */}
      <div className="h-40 bg-gradient-to-b from-brand-500/20 to-brand-950 border-b border-white/5" />

      <div className="max-w-4xl mx-auto px-6 -mt-16">
        {/* Profile Stats Card */}
        <div className="bg-brand-900/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-brand-500 border-4 border-brand-950 overflow-hidden shadow-2xl flex items-center justify-center text-4xl font-black">
                {avatarPreview ? (
                  <img src={resolveMediaUrl(avatarPreview)} className="w-full h-full object-cover" alt="Profile" />
                ) : user?.username?.[0].toUpperCase()}
              </div>
              {canEditProfile && (
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 bg-brand-900 p-2 rounded-full border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-all z-10"
                >
                  <IoMdCamera size={18} />
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

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tighter italic">@{user?.username || 'user'}</h2>
              <div className="flex gap-6 mt-4 justify-center md:justify-start">
                <div className="text-center">
                  <p className="text-lg font-black">{userPosts.length}</p>
                  <p className="text-[10px] text-brand-100 uppercase font-bold opacity-40">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black">{user?.followersCount || 0}</p>
                  <p className="text-[10px] text-brand-100 uppercase font-bold opacity-40">Followers</p>
                </div>
              </div>
              
              {canEditProfile && (
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="mt-6 px-8 py-2.5 bg-brand-500 rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="mt-6 bg-brand-900/40 border border-white/5 rounded-[24px] p-6 animate-in slide-in-from-top">
             <input type="text" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-brand-950 border border-white/5 p-4 rounded-xl mb-3 outline-none focus:border-brand-500" />
             <textarea placeholder="Bio" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-brand-950 border border-white/5 p-4 rounded-xl h-24 mb-4 outline-none focus:border-brand-500" />
             <button onClick={handleUpdate} className="w-full bg-brand-500 py-4 rounded-xl font-black tracking-widest active:scale-95 transition-all">SAVE CHANGES</button>
          </div>
        )}

        {/* Listings Grid */}
        <div className="mt-12">
          <h3 className="text-sm font-black text-brand-100/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
            <IoMdGrid size={18}/> Active Listings
          </h3>
          
          <div className="grid grid-cols-3 gap-2">
            {userPosts.map((post) => (
              <div 
                key={post._id} 
                onClick={() => setSelectedPost(post)}
                className="aspect-square bg-brand-900 rounded-xl overflow-hidden border border-white/5 group relative cursor-pointer"
              >
                {/* Your media logic here */}
                <div className="absolute inset-0 bg-brand-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold">VIEW</div>
              </div>
            ))}
          </div>
          
          {userPosts.length === 0 && (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-[32px]">
              <p className="text-xs font-bold text-brand-100/20 uppercase tracking-widest">No Properties Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;