/**
 * pages/CreatePostPage.jsx
 * The Smart Create Engine for the Super App Ecosystem.
 */

import { MAIN_CATEGORIES, SALE_HUB_SUBS } from '../constants/categories';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { IoMdCloudUpload, IoMdVideocam, IoMdImages, IoMdPin, IoMdInformationCircle } from 'react-icons/io';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'plot', 'commercial', 'farmland', 'other'];
const KNOWLEDGE_LEVELS = ['Beginner', 'Intermediate', 'Expert', 'Pro Tips'];

export default function CreatePostPage() {
  const navigate = useNavigate();
  
  // ── CORE STATE ──
  const [postType, setPostType] = useState('Real Estate'); // 'Real Estate' | 'Knowledge' | 'Social'
  const [mediaType, setMediaType] = useState('images'); // 'images' | 'video'
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [form, setForm] = useState({
    title: '', 
    description: '', 
    price: '', 
    priceUnit: 'total',
    mainCategory: 'Sale Hub', 
    subCategory: 'All', 
    propertyType: 'Apartment', 
    area: '', 
    bedrooms: '', 
    bathrooms: '',
    location: '',
    phone: '',
    hashtags: '',
    knowledgeSubject: '',
    knowledgeLevel: 'Beginner'
  });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map(f => ({ url: URL.createObjectURL(f), type: f.type })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) { toast.error('Please select media files.'); return; }

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'hashtags') {
        const tags = val.split(',').map(t => t.trim()).filter(Boolean);
        formData.append('hashtags', JSON.stringify(tags));
      } else if (val) {
        formData.append(key, val);
      }
    });

    formData.append('mediaType', mediaType);
    formData.append('postType', postType); // Send the mode to backend

    if (mediaType === 'video') {
      formData.append('video', files[0]);
    } else {
      files.forEach(f => formData.append('images', f));
    }

    setLoading(true);
    try {
      const endpoint = mediaType === 'video' ? '/posts/video' : '/posts/images';
      await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
      });

      toast.success('Successfully published to Nodexa! 🚀');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans pb-24 overflow-y-auto no-scrollbar">
      
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-b from-[#0057FF]/10 to-transparent pt-12 pb-6 px-6 text-center">
        <h1 className="text-3xl font-black tracking-tighter italic">CREATE CONTENT</h1>
        <p className="text-[#00F0FF] text-[10px] font-black uppercase tracking-[0.3em] mt-1">Share with the Nodexa Community</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-6 space-y-8">
        
        {/* ── STEP 1: PICK YOUR VIBE (MODE SWITCHER) ── */}
        <div className="bg-[#151A25] p-1.5 rounded-2xl border border-[#1E2532] flex gap-1">
          {['Real Estate', 'Knowledge', 'Social'].map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setPostType(mode);
                setForm(f => ({ ...f, mainCategory: mode === 'Real Estate' ? 'Sale Hub' : mode === 'Knowledge' ? 'Education' : 'All' }));
              }}
              className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                postType === mode ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white shadow-lg' : 'text-gray-500 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* ── STEP 2: MEDIA UPLOAD ── */}
        <div className="space-y-4">
          <div className="flex gap-2">
            {['images', 'video'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => { setMediaType(type); setFiles([]); setPreviews([]); }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                  mediaType === type ? 'bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF]' : 'bg-[#151A25] border-[#1E2532] text-gray-500'
                }`}
              >
                {type === 'images' ? <IoMdImages size={16}/> : <IoMdVideocam size={16}/>}
                {type}
              </button>
            ))}
          </div>

          <label className="group cursor-pointer block">
            <div className="border-2 border-dashed border-[#1E2532] rounded-[32px] p-10 text-center bg-[#151A25]/50 group-hover:border-[#00F0FF]/50 transition-all relative overflow-hidden">
              <input type="file" accept={mediaType === 'video' ? 'video/*' : 'image/*'} multiple={mediaType === 'images'} onChange={handleFileChange} className="hidden" />
              <IoMdCloudUpload size={40} className="mx-auto text-gray-600 group-hover:text-[#00F0FF] transition-colors mb-2" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {files.length > 0 ? `${files.length} Selected` : `Tap to upload ${mediaType}`}
              </p>
            </div>
          </label>

          {previews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
              {previews.map((p, i) => (
                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden bg-[#1E2532] border border-[#2A3441] shrink-0">
                  {p.type.startsWith('video') ? <video src={p.url} className="w-full h-full object-cover" /> : <img src={p.url} className="w-full h-full object-cover" alt=""/>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── STEP 3: DYNAMIC FORM DETAILS ── */}
        <div className="bg-[#151A25] border border-[#1E2532] rounded-[32px] p-6 space-y-5 shadow-xl">
          <h2 className="text-[10px] font-black text-[#00F0FF] uppercase tracking-[0.3em] flex items-center gap-2">
            <IoMdInformationCircle size={16}/> Essential Details
          </h2>

          <input name="title" value={form.title} onChange={handleChange} placeholder="GIVE IT A CATCHY TITLE *" className="w-full bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold focus:border-[#00F0FF]/50 outline-none transition-all" required />

          {/* REAL ESTATE SPECIFIC FIELDS */}
          {postType === 'Real Estate' && (
            <div className="space-y-5 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 gap-3">
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="PRICE (₹) *" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold focus:border-[#00F0FF]/50 outline-none" required />
                <select name="priceUnit" value={form.priceUnit} onChange={handleChange} className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-[#00F0FF] outline-none">
                  <option value="total">Total Price</option>
                  <option value="per_sqft">Per Sq.Ft</option>
                  <option value="per_month">Rent / Month</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select name="propertyType" value={form.propertyType} onChange={handleChange} className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-gray-400 outline-none">
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input name="area" value={form.area} onChange={handleChange} placeholder="AREA (e.g. 1500 SQFT)" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold focus:border-[#00F0FF]/50 outline-none" />
              </div>
            </div>
          )}

          {/* KNOWLEDGE SPECIFIC FIELDS */}
          {postType === 'Knowledge' && (
            <div className="space-y-5 animate-in fade-in duration-500">
              <input name="knowledgeSubject" value={form.knowledgeSubject} onChange={handleChange} placeholder="SUBJECT (e.g. Real Estate Law, Coding, Finance)" className="w-full bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold focus:border-[#00F0FF]/50 outline-none" />
              <select name="knowledgeLevel" value={form.knowledgeLevel} onChange={handleChange} className="w-full bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-[#00F0FF] outline-none">
                {KNOWLEDGE_LEVELS.map(lv => <option key={lv} value={lv}>{lv} Level</option>)}
              </select>
            </div>
          )}

          <textarea name="description" value={form.description} onChange={handleChange} placeholder="DESCRIBE YOUR POST..." rows={4} className="w-full bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm focus:border-[#00F0FF]/50 outline-none transition-all resize-none" />
          
          <div className="pt-4 border-t border-[#1E2532]">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><IoMdPin/> Tag Location & Contact</h3>
            <div className="grid grid-cols-2 gap-3">
              <input name="location" value={form.location} onChange={handleChange} placeholder="CITY / DISTRICT" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-bold outline-none" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="WHATSAPP / CALL" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-bold outline-none" />
            </div>
          </div>
        </div>

        {/* ── STEP 4: CATEGORY TAGGING ── */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Display Hub</label>
          <select name="mainCategory" value={form.mainCategory} onChange={handleChange} className="w-full bg-[#151A25] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-[#00F0FF] outline-none shadow-lg">
            {MAIN_CATEGORIES.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>

        {/* ── PROGRESS & SUBMIT ── */}
        <div className="space-y-4 pt-4">
          {loading && progress > 0 && (
            <div className="w-full bg-[#1E2532] h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white py-5 rounded-[24px] font-black tracking-[0.2em] uppercase shadow-[0_10px_30px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
            {loading ? 'UPLOADING TO NODEXA...' : `🚀 PUBLISH ${postType}`}
          </button>
        </div>

      </form>
    </div>
  );
}