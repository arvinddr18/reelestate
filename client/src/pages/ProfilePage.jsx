import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdSettings, IoMdCamera, IoMdGrid, IoMdClose, IoMdHeart, IoMdText, IoMdTrash } from 'react-icons/io';

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
  const separator = source.startsWith('/') ? '' : '/';
  return `${cleanBase}${separator}${source}`;
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
      const res = await axios.put(getApiUrl('/api/users/update'), payload, getAuthConfig());
      if(res.data.success) {
        setIsEditing(false);
        window.location.reload(); 
      }
    } catch (err) {
      const realError = err.response?.data?.message || err.message;
      alert(`Backend Error: \n\n${realError}`);
    }
  };

  // --- NEW: Delete Post Logic ---
  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post forever?");
    if (!confirmDelete) return;

    try {
      await axios.delete(getApiUrl(`/api/posts/${postId}`), getAuthConfig());
      
      // Remove the deleted post from the grid instantly without refreshing
      setUserPosts(userPosts.filter(post => post._id !== postId));
      
      // Close the popup window
      setSelectedPost(null); 
    } catch (err) {
      const realError = err.response?.data?.message || err.message;
      alert(`Failed to delete post: \n\n${realError}`);
    }
  };

  const getPostMediaInfo = (post) => {
    if (!post) return { url: null, isVideo: false };
    let rawMediaSource = post.mediaUrl || post.image || post.media || post.videoUrl || post.video || post.file;
    if (!rawMediaSource && post.images && post.images.length > 0) rawMediaSource = post.images[0];
    
    const finalMediaSource = resolveMediaUrl(rawMediaSource);
    const isVideo = post.mediaType === 'reel' || post.mediaType === 'video' || 
                   (finalMediaSource && typeof finalMediaSource === 'string' && (finalMediaSource.match(/\.(mp4|webm|ogg)$/i) || finalMediaSource.startsWith('data:video')));
    
    return { url: finalMediaSource, isVideo };
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  // Check if viewing own profile to show edit/delete buttons
  const isOwnProfile = !userId || userId === JSON.parse(localStorage.getItem('user'))?._id;

  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      <div className="p-6 flex items-center justify-between border-b border-gray-900">
        <h1 className="text-2xl font-bold text-orange-500">ReelEstate</h1>
        <IoMdSettings className="text-2xl cursor-pointer text-gray-400 hover:text-white" />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Header section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 bg-gray-800 flex items-center justify-center text-4xl font-bold relative">
              {avatarPreview ? (
                <img src={resolveMediaUrl(avatarPreview)} className="absolute inset-0 w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="text-gray-500">{user?.username?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {isOwnProfile && (
              <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-gray-700 p-2 rounded-full border-2 border-black hover:bg-orange-500 cursor-pointer z-10">
                <IoMdCamera size={20} />
              </button>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              <h2 className="text-2xl font-bold">@{user?.username}</h2>
              <span className="bg-orange-900/20 text-orange-500 border border-orange-900/50 px-3 py-1 rounded-md text-xs font-bold uppercase">Seller</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400 justify-center md:justify-start">
              <span><b>{userPosts.length}</b> Posts</span>
              <span><b>{user?.followersCount || 0}</b> Followers</span>
              <span><b>{user?.followingCount || 0}</b> Following</span>
            </div>
            {isOwnProfile && (
              <button onClick={() => setIsEditing(!isEditing)} className="mt-4 px-6 py-2 rounded-lg font-bold bg-gray-800 hover:bg-gray-700 transition-all">
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-[#0a0a0a] border border-gray-900 rounded-2xl p-6 shadow-xl mb-12">
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl outline-none focus:border-orange-500 transition-colors" />
              <textarea placeholder="Bio" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl outline-none focus:border-orange-500 h-24 resize-none transition-colors" />
              <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl outline-none focus:border-orange-500 transition-colors" />
              <button onClick={handleUpdate} className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all active:scale-95">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Grid Section */}
        <div className="border-t border-gray-900 pt-8">
          <h3 className="mb-6 font-bold text-gray-500 uppercase tracking-widest text-sm flex items-center gap-2">
            <IoMdGrid /> MY LISTINGS ({userPosts.length})
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {userPosts.length > 0 ? userPosts.map((post) => {
              const { url, isVideo } = getPostMediaInfo(post);

              return (
                <div 
                  key={post._id} 
                  onClick={() => setSelectedPost(post)}
                  className="aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-800 group relative flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors"
                >
                  {!url ? (
                    <span className="text-gray-600 text-xs font-bold px-2 text-center">{post.title || "No Media"}</span>
                  ) : isVideo ? (
                    <video src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" muted loop autoPlay playsInline />
                  ) : (
                    <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={post.title} />
                  )}
                  
                  {url && (
                    <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px]">{isVideo ? '🎥' : '📸'}</span>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="col-span-3 text-center py-10 text-gray-600">No properties found.</div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 🚀 BULLETPROOF CLICKABLE POPUP MODAL 🚀 */}
      {/* ========================================= */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-sm">
          
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden relative shadow-2xl animate-fade-in-up">
            
            <button 
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-orange-500 text-white p-2 rounded-full transition-all"
            >
              <IoMdClose size={24} />
            </button>

            {/* Left Side: Media */}
            <div className="md:w-[55%] bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
              {(() => {
                const { url, isVideo } = getPostMediaInfo(selectedPost);
                if (!url) return <span className="text-gray-600">No Media Available</span>;
                if (isVideo) return <video src={url} controls autoPlay className="max-w-full max-h-[85vh] object-contain" />;
                return <img src={url} alt="Post" className="max-w-full max-h-[85vh] object-contain" />;
              })()}
            </div>

            {/* Right Side: Details */}
            <div className="md:w-[45%] flex flex-col h-[50vh] md:h-auto bg-[#0a0a0a]">
              
              <div className="p-4 border-b border-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500 bg-gray-800 flex-shrink-0">
                  {avatarPreview ? (
                    <img src={resolveMediaUrl(avatarPreview)} className="w-full h-full object-cover" alt="User" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm leading-tight">@{user?.username}</h4>
                  <p className="text-[10px] text-gray-500 truncate">
                    {selectedPost.location || selectedPost.district || 'Location not specified'}
                  </p>
                </div>
                
                {/* --- NEW: Delete Button (Trash Can) --- */}
                {isOwnProfile && (
                  <button 
                    onClick={() => handleDeletePost(selectedPost._id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-950/30 rounded-full transition-all"
                    title="Delete Post"
                  >
                    <IoMdTrash size={20} />
                  </button>
                )}
              </div>

              {/* Property Details (Scrollable) */}
              <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                
                <div className="mb-6">
                  {/* Fixed Crash: Checks if price exists before formatting */}
                  <h2 className="text-2xl font-black text-white mb-1">
                    {selectedPost.price ? `₹${Number(selectedPost.price).toLocaleString()}` : 'Price on Request'}
                  </h2>
                  <h3 className="text-lg font-medium text-gray-300">{selectedPost.title || 'Untitled Property'}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {selectedPost.propertyType && (
                    <div className="bg-[#111] p-3 rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Type</p>
                      <p className="text-sm font-semibold truncate">{selectedPost.propertyType}</p>
                    </div>
                  )}
                  {selectedPost.area && (
                    <div className="bg-[#111] p-3 rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Area</p>
                      <p className="text-sm font-semibold truncate">{selectedPost.area}</p>
                    </div>
                  )}
                  {selectedPost.bedrooms && (
                    <div className="bg-[#111] p-3 rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Bedrooms</p>
                      <p className="text-sm font-semibold truncate">{selectedPost.bedrooms} Beds</p>
                    </div>
                  )}
                  {selectedPost.bathrooms && (
                    <div className="bg-[#111] p-3 rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Bathrooms</p>
                      <p className="text-sm font-semibold truncate">{selectedPost.bathrooms} Baths</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Description</h4>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedPost.description || 'No description provided.'}
                  </p>
                </div>

                {/* Fixed Crash: Safely handles hashtags string */}
                {selectedPost.hashtags && typeof selectedPost.hashtags === 'string' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedPost.hashtags.split(',').map((tag, i) => (
                      <span key={i} className="text-xs text-orange-400 bg-orange-900/20 px-2 py-1 rounded-md">
                        #{tag.trim().replace('#', '')}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;