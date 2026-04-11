import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoMdCamera, IoMdPin, IoMdFingerPrint, IoMdLink } from 'react-icons/io';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PersonalInfo() {
  const { user, setUser } = useAuth();
  
  // 1. Unified Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    location: user?.location || '',
    website: user?.website || '',
    bio: user?.bio || ''
  });

  const [saving, setSaving] = useState(false);
  
  // 🚨 THIS WAS THE MISSING LINE CAUSING THE CRASH!
  const [strength, setStrength] = useState(0); 

  // 2. Updated Sync Strength Logic (Neural Link is now a bonus/optional)
  useEffect(() => {
    let score = 0;
    
    // Core requirements (25% each)
    if (formData.name?.length > 2) score += 25;
    if (formData.username?.length > 2) score += 25;
    if (formData.location?.length > 2) score += 25;
    if (formData.bio?.length > 5) score += 25;
    
    // website is now optional - we don't add points for it to reach 100
    // but if you want it to be a "Bonus" score, you can keep it separate
    
    setStrength(score);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bio' && value.length > 250) return;
    setFormData({ ...formData, [name]: value });
  };
 

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const res = await api.put('/users/update', formData);
      if (res.data.success) {
        setUser(res.data.user); // Updates the entire app in real-time
        toast.success("Identity synchronized with Node matrix.");
      }
    } catch (err) {
      toast.error("Network synchronization failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* ─── 📊 NODE SYNCHRONIZATION BAR ─── */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl">
        <div className="flex justify-between items-end mb-3 px-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00F0FF]">Sync Status</span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
              {strength === 100 ? 'Fully Integrated' : 'Linking Identity...'}
            </span>
          </div>
          <span className="text-3xl font-black italic text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            {strength}%
          </span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[2px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            transition={{ type: "spring", stiffness: 50 }}
            className="h-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] rounded-full shadow-[0_0_15px_rgba(0,240,255,0.5)]"
          />
        </div>
      </div>

      {/* ─── 🛰️ NEURAL SCANNER (PHOTO) ─── */}
      <div className="flex items-center gap-6 bg-white/5 border border-white/5 p-6 rounded-[32px]">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-[24px] overflow-hidden border-2 border-white/10 p-1 bg-black/40 transition-all duration-500 group-hover:border-[#00F0FF]/50">
            {/* The Animated Scanning Line */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden rounded-[24px]">
               <div className="w-full h-[2px] bg-[#00F0FF] shadow-[0_0_12px_#00F0FF] animate-[scan_2s_linear_infinite] absolute top-0" />
            </div>
            <img 
              src={user?.profilePhoto || user?.avatar || "https://i.pravatar.cc/150"} 
              className="w-full h-full object-cover rounded-[20px] grayscale group-hover:grayscale-0 transition-all duration-700" 
              alt="avatar" 
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00F0FF] rounded-xl flex items-center justify-center text-black shadow-lg scale-90 group-hover:scale-100 transition-transform">
            <IoMdCamera size={18} />
          </div>
        </div>
        <div>
           <h3 className="text-white font-black text-sm uppercase tracking-widest">Neural Link Photo</h3>
           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Tap image to broadcast new signal</p>
        </div>
      </div>

      {/* ─── 📝 DATA ENTRIES ─── */}
     {/* ─── 📝 DATA ENTRIES (Updated for Username & Links) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Legal Identity</label>
          <div className="relative flex items-center">
            <IoMdFingerPrint className="absolute left-4 text-[#00F0FF] opacity-40" size={18} />
            <input 
              name="name" value={formData.name} onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00F0FF] transition-all font-bold placeholder:text-gray-700"
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
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00F0FF] transition-all font-bold placeholder:text-gray-700"
              placeholder="Unique_ID"
            />
          </div>
        </div>

        {/* Geographic Node */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Geographic Node</label>
          <div className="relative flex items-center">
            <IoMdPin className="absolute left-4 text-[#00F0FF] opacity-40" size={18} />
            <input 
              name="location" value={formData.location} onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00F0FF] transition-all font-bold placeholder:text-gray-700"
              placeholder="City, Region"
            />
          </div>
        </div>

        {/* Neural Link (Website) */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Neural Link (optional)</label>
          <div className="relative flex items-center">
            <IoMdLink className="absolute left-4 text-[#00F0FF] opacity-40" size={18} />
            <input 
              name="website" value={formData.website} onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#00F0FF] transition-all font-bold placeholder:text-gray-700"
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