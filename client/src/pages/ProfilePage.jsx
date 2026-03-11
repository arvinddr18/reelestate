import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdSettings, IoMdCamera, IoMdGrid } from 'react-icons/io';

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

  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]); 
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', bio: '', location: '', phone: '', website: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        const id = userId || loggedInUser?._id;
        const res = await axios.get(getApiUrl(`/api/users/${id}`), getAuthConfig());
        
        const userData = res.data.data.user || res.data.data;
        const postsData = res.data.data.posts || [];

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setAvatarPreview(reader.result);
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = { ...formData, profilePhoto: avatarPreview };
      
      // We are logging the payload to the browser console for debugging
      console.log("Sending data to backend...");
      
      const res = await axios.put(getApiUrl('/api/users/update'), payload, getAuthConfig());
      if(res.data.success) {
        setIsEditing(false);
        alert("Profile Successfully Updated!");
        window.location.reload(); 
      }
    } catch (err) {
      // THIS IS THE FIX: We stop guessing and grab the REAL error from the server
      console.error("FULL ERROR DETAILS:", err);
      
      const realError = err.response?.data?.message || err.message;
      const statusCode = err.response?.status || "Unknown";
      
      alert(`REAL BACKEND ERROR (Code ${statusCode}): \n\n${realError}`);
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="p-6 flex items-center justify-between border-b border-gray-900">
        <h1 className="text-2xl font-bold text-orange-500">ReelEstate</h1>
        <IoMdSettings className="text-2xl cursor-pointer text-gray-400 hover:text-white" />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 bg-gray-800 flex items-center justify-center text-4xl font-bold relative">
              {avatarPreview ? (
                <img src={avatarPreview} className="absolute inset-0 w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="text-gray-500">{user?.username?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-gray-700 p-2 rounded-full border-2 border-black hover:bg-orange-500 cursor-pointer z-10">
              <IoMdCamera size={20} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              <h2 className="text-2xl font-bold">@{user?.username}</h2>
              <span className="bg-orange-900/20 text-orange-500 border border-orange-900/50 px-3 py-1 rounded-md text-xs font-bold uppercase">Seller</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400 justify-center md:justify-start">
              <span><b>{userPosts.length}</b> Posts</span>
              <span><b>0</b> Followers</span>
              <span><b>0</b> Following</span>
            </div>
            <button onClick={() => setIsEditing(!isEditing)} className="mt-4 px-6 py-2 rounded-lg font-bold bg-gray-800 hover:bg-gray-700 transition-all">
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-900 rounded-2xl p-6 shadow-xl mb-12">
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} disabled={!isEditing} className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl outline-none focus:border-orange-500 disabled:opacity-40" />
            <textarea placeholder="Bio" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} disabled={!isEditing} className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl outline-none focus:border-orange-500 disabled:opacity-40 h-24 resize-none" />
            <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} disabled={!isEditing} className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl outline-none focus:border-orange-500 disabled:opacity-40" />
            {isEditing && (
              <button onClick={handleUpdate} className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all active:scale-95">
                Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8">
          <h3 className="mb-6 font-bold text-gray-500 uppercase tracking-widest text-sm flex items-center gap-2">
            <IoMdGrid /> MY LISTINGS ({userPosts.length})
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {userPosts.length > 0 ? userPosts.map((post) => (
              <div key={post._id} className="aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-800 group relative">
                <img src={post.mediaUrl || post.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Listing" />
              </div>
            )) : (
              <div className="col-span-3 text-center py-10 text-gray-600">No properties found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;