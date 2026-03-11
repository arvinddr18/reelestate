import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdSettings, IoMdPerson, IoMdMail, IoMdPhonePortrait, IoMdCamera } from 'react-icons/io';

const getApiUrl = (endpoint) => {
  const base = import.meta.env.VITE_API_URL || '';
  return base.endsWith('/api') && endpoint.startsWith('/api') 
    ? base.replace('/api', '') + endpoint 
    : base + endpoint;
};

const getAuthConfig = () => {
  const token = localStorage.getItem('reelestate_token');
  return { headers: { Authorization: `Bearer ${token}` }, withCredentials: true };
};

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- States ---
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', bio: '', location: '', phone: '', website: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = userId || JSON.parse(localStorage.getItem('user'))._id;
        const res = await axios.get(getApiUrl(`/api/users/${id}`), getAuthConfig());
        const userData = res.data.data.user || res.data.data;
        setUser(userData);
        setFormData({
          fullName: userData.fullName || '',
          bio: userData.bio || '',
          location: userData.location || '',
          phone: userData.phone || '',
          website: userData.website || ''
        });
        setAvatarPreview(userData.profilePhoto || userData.avatar || null);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // --- THE FIX: Photo Upload Logic ---
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setAvatarPreview(reader.result); // Updates the UI instantly
      };
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = { ...formData, profilePhoto: avatarPreview };
      await axios.put(getApiUrl('/api/users/update'), payload, getAuthConfig());
      setIsEditing(false);
      window.location.reload(); // Refresh to show new data
    } catch (err) {
      alert("Update failed. Try again.");
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header Area */}
      <div className="p-6 flex items-center justify-between border-b border-gray-900">
        <h1 className="text-2xl font-bold text-orange-500">ReelEstate</h1>
        <IoMdSettings className="text-2xl cursor-pointer text-gray-400 hover:text-white" />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          {/* --- FIXED: Profile Image with Clickable Camera --- */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 bg-gray-800 flex items-center justify-center text-4xl font-bold">
              {avatarPreview ? (
                <img src={avatarPreview} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
            </div>
            
            {/* The + Camera Button */}
            <button 
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-gray-700 p-2 rounded-full border-2 border-black hover:bg-orange-500 transition-colors cursor-pointer"
            >
              <IoMdCamera size={20} />
            </button>
            
            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              <h2 className="text-2xl font-bold">@{user?.username}</h2>
              <span className="bg-gray-800 px-3 py-1 rounded-md text-xs text-gray-400">Seller</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-300 justify-center md:justify-start">
              <span><b>10</b> Posts</span>
              <span><b>1</b> Followers</span>
              <span><b>1</b> Following</span>
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="mt-4 bg-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-700 transition-all">Edit Profile</button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="mt-4 bg-red-900/30 text-red-500 px-6 py-2 rounded-lg font-bold border border-red-900/50 hover:bg-red-900/50 transition-all">Cancel</button>
            )}
          </div>
        </div>

        {/* --- Form Area (Your Original Design) --- */}
        <div className="bg-[#0a0a0a] border border-gray-900 rounded-2xl p-6 shadow-xl">
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={formData.fullName} 
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              disabled={!isEditing}
              className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl outline-none focus:border-orange-500 disabled:opacity-50" 
            />
            <textarea 
              placeholder="Bio" 
              value={formData.bio} 
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              disabled={!isEditing}
              className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl outline-none focus:border-orange-500 disabled:opacity-50 h-24 resize-none" 
            />
            <input 
              type="text" 
              placeholder="Location" 
              value={formData.location} 
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              disabled={!isEditing}
              className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl outline-none focus:border-orange-500 disabled:opacity-50" 
            />
            {isEditing && (
              <button 
                onClick={handleUpdate}
                className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        <h3 className="mt-10 mb-4 font-bold text-gray-400 uppercase tracking-widest text-sm">My Listings</h3>
        <div className="grid grid-cols-3 gap-2">
           <div className="aspect-square bg-gray-900 rounded-lg animate-pulse"></div>
           <div className="aspect-square bg-gray-900 rounded-lg animate-pulse"></div>
           <div className="aspect-square bg-gray-900 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;