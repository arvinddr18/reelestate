import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { IoMdCamera, IoMdPin, IoMdFingerPrint, IoMdLink, IoMdImage } from 'react-icons/io';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PersonalInfo() {
  const { user, setUser } = useAuth();

  // 🚨 1. Add Two Refs and a Menu State
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  const fileInputRef = useRef(null);
  
  // 1. Updated Form State (Location Removed 🛡️)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    website: user?.website || '',
    bio: user?.bio || '',
    profilePhoto: user?.profilePhoto || user?.avatar || ''
  });

  // State just for showing the picture on the screen immediately
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || user?.avatar || "https://i.pravatar.cc/150");

  const [saving, setSaving] = useState(false);
  const [strength, setStrength] = useState(0);

  // 2. Updated Sync Logic (Points redistributed to 3 fields)
  useEffect(() => {
    let score = 0;
    if (formData.name?.length > 2) score += 33;     // Identity
    if (formData.username?.length > 2) score += 33; // Alias
    if (formData.bio?.length > 5) score += 34;      // Transmission
    
    setStrength(score);
  }, [formData]);

  // 🚨 Add this function to handle file selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // 1. Create an image element in memory
        const img = new Image();
        img.src = reader.result;
        
        img.onload = () => {
          // 2. Set maximum dimensions for a profile picture
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          // 3. Draw it to a hidden canvas to resize it
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // 4. Compress it to a JPEG with 70% quality (Shrinks 5MB to ~100KB!)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

          // 5. Update state with the lightweight image
          setPhotoPreview(compressedBase64); 
          setFormData({ ...formData, profilePhoto: compressedBase64 });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // 🚨 ADD THIS MISSING FUNCTION BACK:
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bio' && value.length > 250) return; // Prevents typing past 250 characters
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* ─── 📊 NODE SYNCHRONIZATION BAR ─── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-[32px] p-4 md:p-6 backdrop-blur-xl">
        <div className="flex justify-between items-end mb-3 px-1">
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#00F0FF]">Sync Status</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              {strength === 100 ? 'Fully Integrated' : 'Linking Identity...'}
            </span>
          </div>
          {/* Shrunk percentage for mobile */}
          <span className="text-2xl md:text-3xl font-black italic text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            {strength}%
          </span>
        </div>
        {/* Slightly thinner bar for mobile */}
        <div className="h-1.5 md:h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            className="h-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] rounded-full shadow-[0_0_15px_rgba(0,240,255,0.5)]"
          />
        </div>
      </div>

     {/* ─── 🛰️ NEURAL SCANNER (PHOTO) ─── */}
      <div className="flex items-center gap-6 bg-white/5 border border-white/5 p-6 rounded-[32px] relative">
        
       {/* 🚨 Hidden Input 1: DIRECT CAMERA */}
        <input 
          type="file" 
          hidden 
          ref={cameraInputRef} 
          accept="image/*" 
          capture="environment" // 🚨 Best standard for forcing mobile camera
          onChange={handlePhotoChange} 
        />

        {/* 🚨 Hidden Input 2: GALLERY */}
        <input 
          type="file" 
          hidden 
          ref={galleryInputRef} 
          accept="image/*" 
          onChange={handlePhotoChange} 
        />

        <div className="relative">
          {/* The Clickable Avatar */}
          <div 
            className="relative group cursor-pointer" 
            onClick={() => setShowPhotoMenu(!showPhotoMenu)} // Toggles the menu
          >
            <div className="w-24 h-24 rounded-[24px] overflow-hidden border-2 border-white/10 p-1 bg-black/40 transition-all duration-500 group-hover:border-[#00F0FF]/50">
              <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden rounded-[24px]">
                 <div className="w-full h-[2px] bg-[#00F0FF] shadow-[0_0_12px_#00F0FF] animate-[scan_2s_linear_infinite] absolute top-0" />
              </div>
              <img 
                src={photoPreview} 
                className="w-full h-full object-cover rounded-[20px] grayscale group-hover:grayscale-0 transition-all duration-700" 
                alt="avatar" 
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00F0FF] rounded-xl flex items-center justify-center text-black shadow-lg scale-90 group-hover:scale-100 transition-transform">
              <IoMdCamera size={18} />
            </div>
          </div>

          {/* 🚨 The Action Menu Popover */}
          {showPhotoMenu && (
            <div className="absolute top-full left-0 mt-4 bg-[#0B0F19] border border-[#1E2532] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50 w-56 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => { cameraInputRef.current.click(); setShowPhotoMenu(false); }}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#151A25] transition-colors border-b border-[#1E2532] text-left"
              >
                <IoMdCamera size={20} className="text-[#00F0FF]" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Take Photo</span>
              </button>
              <button 
                onClick={() => { galleryInputRef.current.click(); setShowPhotoMenu(false); }}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#151A25] transition-colors text-left"
              >
                <IoMdImage size={20} className="text-purple-400" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Gallery</span>
              </button>
            </div>
          )}
        </div>

        <div>
           <h3 className="text-white font-black text-sm uppercase tracking-widest">Neural Link Photo</h3>
           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Tap image to broadcast new signal</p>
        </div>
      </div>

      {/* ─── 📝 DATA ENTRIES MATRIX ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Legal Identity</label>
          <div className="relative flex items-center">
            <IoMdFingerPrint className="absolute left-4 text-[#00F0FF] opacity-40" size={18} />
            <input 
              name="name" value={formData.name} onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00F0FF] transition-all font-bold"
              placeholder="Enter Full Name"
            />
          </div>
        </div>

        {/* Username */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Public Alias (@username)</label>
          <div className="relative flex items-center">
            <span className="absolute left-4 font-black text-[#00F0FF] opacity-40 text-lg">@</span>
            <input 
              name="username" value={formData.username} onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00F0FF] transition-all font-bold"
              placeholder="Unique_ID"
            />
          </div>
        </div>

        {/* Neural Link (URL) - Now alone on the second row for a spacious look */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Neural Link (Optional)</label>
          <div className="relative flex items-center">
            <IoMdLink className="absolute left-4 text-[#00F0FF] opacity-40" size={18} />
            <input 
              name="website" value={formData.website} onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00F0FF] transition-all font-bold"
              placeholder="https://portfolio.me"
            />
          </div>
        </div>

      </div>

      {/* ─── 📡 TRANSMISSION (BIO) ─── */}
      <div className="flex flex-col gap-2">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">System Transmission (Bio)</label>
        <div className="relative">
          <textarea 
            name="bio" value={formData.bio} onChange={handleChange} rows="4"
            className="w-full bg-black/40 border border-white/10 rounded-[32px] p-6 text-gray-200 outline-none focus:border-[#00F0FF] transition-all resize-none font-medium leading-relaxed"
            placeholder="Broadcasting profile data to the network..."
          />
          {/* Byte Counter */}
          <div className="absolute bottom-5 right-6 flex items-center gap-2">
             <span className={`text-[9px] font-black tracking-widest ${formData.bio.length >= 250 ? 'text-red-500' : 'text-gray-600'}`}>
               {formData.bio.length} / 250 BYTES
             </span>
             <div className={`w-1.5 h-1.5 rounded-full ${formData.bio.length > 0 ? 'bg-[#00F0FF] animate-pulse' : 'bg-gray-800'}`} />
          </div>
        </div>
      </div>

      {/* ─── 🚨 ACTION ─── */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSaveChanges}
          disabled={saving}
          className="group relative px-12 py-5 bg-gradient-to-r from-[#0057FF] to-[#00F0FF] rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,87,255,0.4)] active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em] text-white">
            {saving ? 'Synchronizing...' : 'Synchronize Node'}
          </span>
        </button>
      </div>

    </div>
  );
}