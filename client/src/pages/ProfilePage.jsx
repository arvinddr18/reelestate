/**
 * client/src/pages/EditProfilePage.jsx
 * Full Profile Editing UI with Working Image Preview
 */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Importing standard icons
import { IoMdCamera, IoMdPerson, IoMdMail, IoMdPhonePortrait, IoMdClose, IoMdCheckmarkCircle } from 'react-icons/io';

// --- Helper Functions (Re-using our perfected logic!) ---
const getApiUrl = (endpoint) => {
  const base = import.meta.env.VITE_API_URL || '';
  if (base.endsWith('/api') && endpoint.startsWith('/api')) {
    return base.replace('/api', '') + endpoint;
  }
  return base + endpoint;
};

const getAuthConfig = () => {
  let token = localStorage.getItem('reelestate_token');
  const config = { withCredentials: true };
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers = { Authorization: `Bearer ${token}` };
  }
  return config;
};

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

const EditProfilePage = () => {
  const navigate = useNavigate();
  // We need a reference to the hidden file input
  const fileInputRef = useRef(null); 

  // --- Form State ---
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    email: '',
  });
  
  // --- Avatar State (Preview & Final File) ---
  const [avatarPreview, setAvatarPreview] = useState(null); // Shows the temporary preview
  const [avatarFileBase64, setAvatarFileBase64] = useState(null); // What we send to backend

  // --- UI Feedback State ---
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'|'error', text: '' }

  // --- 1. Load current data on page mount ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = getAuthConfig();
        if (!config.headers) {
          navigate('/signin'); // Kick back to login if no token
          return;
        }
        
        // Ensure your backend has this route!
        const res = await axios.get(getApiUrl('/api/users/me'), config);
        const user = res.data.data;
        
        if (user) {
          setFormData({
            fullName: user.fullName || '',
            username: user.username || '',
            phone: user.phone || '',
            email: user.email || '',
          });
          // Set initial profile picture if it exists
          setAvatarPreview(user.avatar || user.profilePhoto || null); 
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- THE CORE FIX: Opening the file input programmatically ---
  const triggerFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // This simulates clicking the hidden <input type="file">
    }
  };

  // --- FIXED Image Processing Workflow ---
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic security check
      if (!file.type.startsWith('image/')) {
        return setStatusMessage({ type: 'error', text: 'Please select an image file (PNG, JPG, etc.).' });
      }
      
      try {
        // 1. Convert file to Base64 (Using our reusable function)
        const base64 = await convertToBase64(file);
        
        // 2. Set the data so we can send it to backend later
        setAvatarFileBase64(base64); 
        
        // 3. Update the UI to show the new preview immediately!
        setAvatarPreview(base64); 
        
        setStatusMessage({ type: 'success', text: 'Image loaded. Click Update to save.' });
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Error processing image.' });
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setStatusMessage(null);

    // Prepare payload, including the Base64 avatar only if it changed
    const payload = {
        ...formData,
        avatar: avatarFileBase64 || null // Send new base64 string or null if not changed
    };

    try {
      // Make sure your backend update route handles this!
      const res = await axios.put(getApiUrl('/api/users/update'), payload, getAuthConfig());
      
      if (res.data.success) {
        setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
        setAvatarFileBase64(null); // Clear pending file state
        // Optional: redirect to profile after success
        // setTimeout(() => navigate('/profile'), 1500); 
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setUpdating(false);
    }
  };

  // Handle Loading State
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- RENDER UI (Matching your screenshot!) ---
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-lg flex flex-col items-center">
        
        {/* --- Header --- */}
        <div className="w-full flex justify-center mb-6 relative">
          <button onClick={() => navigate(-1)} className="absolute left-0 top-1 text-gray-500 hover:text-white transition-colors">
            <IoMdClose size={24} />
          </button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        {/* --- Feedback Alert (Success/Error) --- */}
        {statusMessage && (
          <div className={`w-full p-3 rounded-lg flex items-center gap-2 mb-4 animate-fade-in-up text-sm font-bold ${statusMessage.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
            <IoMdCheckmarkCircle size={20} />
            {statusMessage.text}
          </div>
        )}

        {/* --- RESTORED Profile Picture workflow (Matches screenshot layout) --- */}
        <div className="flex flex-col items-center mb-8 gap-4 w-full">
          <p className="text-gray-400 text-sm">Tap to add profile picture</p>
          
          {/* THE FIX: We make this div clickable to trigger the file input! */}
          <div 
            onClick={triggerFileSelection} 
            title="Click to change profile picture"
            className="w-36 h-36 bg-gray-800 rounded-full flex items-center justify-center text-gray-600 cursor-pointer transition-all hover:bg-gray-700 hover:scale-105 shadow-xl border-4 border-gray-900 group relative overflow-hidden"
          >
            {avatarPreview ? (
              // Show the image (either existing or new preview)
              <img src={avatarPreview} alt="Profile Preview" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70" />
            ) : (
              // Placeholder when no image exists
              <IoMdPerson className="text-gray-700" size={60} />
            )}
            
            {/* The '+' overlay from your screenshot */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:opacity-100 transition-opacity">
              <IoMdCamera className="text-white drop-shadow-lg" size={40} />
            </div>
          </div>

          {/* --- THE HIDDEN FILE INPUT ("The Ear") --- */}
          <input 
            type="file" 
            ref={fileInputRef} // Connect the JavaScript reference
            onChange={handleImageChange} // Call the processing function
            accept="image/*" // Restrict to images only
            className="hidden" // Hide it visually!
          />
        </div>

        {/* --- RESTORED: Form Fields (Matched to screenshot) --- */}
        <form onSubmit={handleUpdateProfile} className="w-full flex flex-col gap-6">
          {[
            { name: 'fullName', placeholder: 'Full Name', icon: IoMdPerson },
            { name: 'username', placeholder: 'Username', icon: IoMdPerson },
            { name: 'phone', placeholder: 'Phone', icon: IoMdPhonePortrait, type: 'tel' },
            { name: 'email', placeholder: 'Email', icon: IoMdMail, type: 'email' },
          ].map((field) => (
            <div key={field.name} className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-orange-500">
                <field.icon size={22} />
              </div>
              <input 
                type={field.type || 'text'}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full pl-14 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl text-lg text-white placeholder-gray-600 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-950 shadow-inner"
              />
            </div>
          ))}

          {/* --- RESTORED: Update Button (Matched to screenshot) --- */}
          <button 
            type="submit" 
            disabled={updating}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-orange-950/40 active:scale-95 transform"
          >
            {updating ? (
              <>
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : 'Update Profile'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default EditProfilePage;