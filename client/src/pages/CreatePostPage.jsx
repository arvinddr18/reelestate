/**
 * pages/CreatePostPage.jsx
 * The Super App Creation Router (Y-Fork Architecture)
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { IoMdCloudUpload, IoMdVideocam, IoMdImages, IoMdPin, IoMdInformationCircle, IoMdArrowBack } from 'react-icons/io';
import { MAIN_CATEGORIES } from '../constants/categories'; // Your 19 categories

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'plot', 'commercial', 'farmland', 'other'];

// ─── HELPER COMPONENTS ───
const MusicPicker = ({ onSelect, onClose }) => {
  /* ... (Your exact same Music Picker code goes here - keeping it brief for the structural view) ... */
  const [query, setQuery] = useState('');
  const SONGS = [{ id: '1', title: 'Midnight City', artist: 'M83', icon: '🎧' }, { id: '2', title: 'Levitating', artist: 'Dua Lipa', icon: '✨' }];
  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0F19]/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 flex flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black italic tracking-tighter">SELECT AUDIO</h2>
        <button onClick={onClose} className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest">Close</button>
      </div>
      <div className="space-y-3">
        {SONGS.map(song => (
          <button key={song.id} onClick={() => { onSelect(song); onClose(); }} className="w-full flex items-center justify-between p-4 bg-[#151A25] rounded-2xl border border-[#1E2532] hover:border-[#00F0FF] text-left">
            <span className="text-xs font-black text-white">{song.title} <span className="text-gray-500 block">{song.artist}</span></span>
          </button>
        ))}
      </div>
    </div>
  );
};

const LocationPicker = ({ onSelect, onClose }) => {
  /* ... (Your exact same Location Picker code) ... */
  const LOCATIONS = [{ id: '1', name: 'Bengaluru, Karnataka', type: 'City' }];
  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0F19]/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 flex flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black italic tracking-tighter">TAG LOCATION</h2>
        <button onClick={onClose} className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest">Close</button>
      </div>
      <div className="space-y-3">
        {LOCATIONS.map(loc => (
          <button key={loc.id} onClick={() => { onSelect(loc); onClose(); }} className="w-full flex items-center justify-between p-4 bg-[#151A25] rounded-2xl border border-[#1E2532] hover:border-[#00F0FF] text-left">
            <span className="text-xs font-black text-white">{loc.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN MASTER PAGE ───
export default function CreatePostPage() {
  const navigate = useNavigate();
  
  // 1. ROUTER STATE (The Y-Fork)
  // 'selection' (Big Buttons) -> 'social' (Insta Mode) OR 'hub-grid' (Category Grid) -> 'hub-form' (Listing Mode)
  const [createMode, setCreateMode] = useState('selection'); 
  const [selectedHub, setSelectedHub] = useState('');

  // 2. CORE FORM STATE
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [mediaType, setMediaType] = useState('images'); 
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [form, setForm] = useState({
    title: '', description: '', price: '', propertyType: '', area: '', bedrooms: '', locationTag: '', music: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map(f => ({ url: URL.createObjectURL(f), type: f.type })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) { toast.error('Please select media files.'); return; }

    const formData = new FormData();
    let safeForm = { ...form };
    
    // Auto-Format based on the route chosen
    if (createMode === 'social') {
      safeForm.price = 0; 
      safeForm.propertyType = 'other';
      safeForm.mainCategory = 'Social';
      safeForm.title = safeForm.description ? `${safeForm.description.substring(0, 20)}...` : 'Social Update';
    } else {
      safeForm.mainCategory = selectedHub; // Use the hub they clicked
      if (!safeForm.price || isNaN(safeForm.price)) safeForm.price = 0;
      if (!safeForm.propertyType) safeForm.propertyType = 'other';
    }

    Object.entries(safeForm).forEach(([key, val]) => {
      if (val !== undefined && val !== '') formData.append(key, val);
    });

    formData.append('mediaType', mediaType);
    formData.append('postType', createMode === 'social' ? 'Social' : 'Real Estate');

    if (mediaType === 'video') formData.append('video', files[0]);
    else files.forEach(f => formData.append('images', f));

    setLoading(true);
    try {
      const endpoint = mediaType === 'video' ? '/posts/video' : '/posts/images';
      await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      toast.success('Published successfully! 🚀');
      navigate('/');
    } catch (err) {
      toast.error('Upload failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans pb-24 overflow-y-auto no-scrollbar">
      
      {/* ── TOP NAV BAR ── */}
      <div className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-[#1E2532] px-6 py-4 flex items-center justify-between">
        {createMode !== 'selection' ? (
          <button onClick={() => setCreateMode(createMode === 'hub-form' ? 'hub-grid' : 'selection')} className="text-gray-400 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors">
            <IoMdArrowBack size={16}/> Back
          </button>
        ) : <div /> /* Empty div for flex spacing */}
        <h1 className="text-lg font-black tracking-tighter italic text-[#00F0FF]">NODEXA STUDIO</h1>
        <div className="w-16" />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-8 space-y-8">

        {/* ────────────────────────────────────────────────────────
            VIEW 1: THE "Y-FORK" SELECTION SCREEN
        ──────────────────────────────────────────────────────── */}
        {createMode === 'selection' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white mb-2">What are we building today?</h2>
              <p className="text-gray-400 text-sm font-bold">Choose an engine to start creating.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Option A: Social */}
              <div onClick={() => setCreateMode('social')} className="relative group cursor-pointer rounded-[32px] p-[2px] overflow-hidden hover:scale-[1.02] transition-transform active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-full bg-[#0B0F19] rounded-[30px] p-8 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(236,72,153,0.4)]">📸</div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-wide">Share Social</h3>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-2">Photos, Reels & Vibes</p>
                  </div>
                </div>
              </div>

              {/* Option B: Hub Listing */}
              <div onClick={() => setCreateMode('hub-grid')} className="relative group cursor-pointer rounded-[32px] p-[2px] overflow-hidden hover:scale-[1.02] transition-transform active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0057FF] to-[#00F0FF] opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-full bg-[#0B0F19] rounded-[30px] p-8 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0057FF] to-[#00F0FF] flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,240,255,0.4)]">🏪</div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-wide">Post a Listing</h3>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-2">Properties, Jobs & Marketplace</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────
            VIEW 2: THE HUB GRID (If they chose "Post a Listing")
        ──────────────────────────────────────────────────────── */}
        {createMode === 'hub-grid' && (
          <div className="animate-in slide-in-from-right duration-300">
            <h2 className="text-[11px] font-black text-[#00F0FF] uppercase tracking-[0.3em] mb-6 text-center">Select Your Market Hub</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MAIN_CATEGORIES.filter(cat => cat.name !== 'Social').map(cat => (
                <button 
                  key={cat.name} 
                  onClick={() => { setSelectedHub(cat.name); setCreateMode('hub-form'); }}
                  className="bg-[#151A25] border border-[#1E2532] hover:border-[#00F0FF] hover:bg-[#1E2532] transition-all p-5 rounded-2xl flex flex-col items-center gap-3 active:scale-95 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────
            VIEW 3: THE ACTUAL CREATION FORMS
        ──────────────────────────────────────────────────────── */}
        {(createMode === 'social' || createMode === 'hub-form') && (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom duration-500">
            
            {/* Shared Media Uploader */}
            <div className="bg-[#151A25] border border-[#1E2532] rounded-[32px] p-6 shadow-xl">
              <div className="flex gap-2 mb-4">
                {['images', 'video'].map(type => (
                  <button key={type} type="button" onClick={() => { setMediaType(type); setFiles([]); setPreviews([]); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${mediaType === type ? 'bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF]' : 'bg-[#0B0F19] border-[#1E2532] text-gray-500'}`}>
                    {type === 'images' ? <IoMdImages size={16}/> : <IoMdVideocam size={16}/>} {type}
                  </button>
                ))}
              </div>
              <label className="group cursor-pointer block">
                <div className="border-2 border-dashed border-[#1E2532] rounded-2xl p-10 text-center bg-[#0B0F19]/50 group-hover:border-[#00F0FF]/50 transition-all overflow-hidden">
                  <input type="file" accept={mediaType === 'video' ? 'video/*' : 'image/*'} multiple={mediaType === 'images'} onChange={handleFileChange} className="hidden" />
                  <IoMdCloudUpload size={40} className="mx-auto text-gray-600 group-hover:text-[#00F0FF] transition-colors mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{files.length > 0 ? `${files.length} Selected` : `Upload ${mediaType}`}</p>
                </div>
              </label>
              {previews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-4 mt-2">
                  {previews.map((p, i) => (
                    <div key={i} className="w-20 h-20 rounded-xl overflow-hidden bg-[#1E2532] shrink-0 border border-[#2A3441]">
                      {p.type.startsWith('video') ? <video src={p.url} className="w-full h-full object-cover" /> : <img src={p.url} className="w-full h-full object-cover" alt=""/>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- THE SOCIAL FORM --- */}
            {createMode === 'social' && (
              <div className="bg-[#151A25] border border-[#1E2532] rounded-[32px] p-6 space-y-6 shadow-xl">
                <div className="flex gap-4 bg-[#0B0F19] p-4 rounded-3xl border border-[#1E2532]">
                  <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden shrink-0 border border-[#1E2532]">
                    {previews[0] ? <img src={previews[0].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-900" />}
                  </div>
                  <textarea name="description" placeholder="Write a caption..." value={form.description} onChange={handleChange} className="w-full bg-transparent text-sm outline-none resize-none pt-2 text-white" rows={3} />
                </div>
                <div className="overflow-hidden rounded-3xl border border-[#1E2532] bg-[#0B0F19]">
                  <button type="button" onClick={() => setShowMusicModal(true)} className="w-full flex items-center justify-between p-5 hover:bg-[#1E2532] transition-colors border-b border-[#1E2532]/50">
                    <div className="flex items-center gap-4">
                      <span className="text-xl">🎵</span>
                      <div className="text-left">
                        <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">{form.music ? 'Music Selected' : 'Add Audio'}</span>
                        {form.music && <p className="text-[9px] text-[#00F0FF] font-black uppercase mt-0.5">{form.music}</p>}
                      </div>
                    </div>
                    <span className="text-gray-600 text-lg">❯</span>
                  </button>
                  <button type="button" onClick={() => setShowLocationModal(true)} className="w-full flex items-center justify-between p-5 hover:bg-[#1E2532] transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-xl">📍</span>
                      <div className="text-left">
                        <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">{form.locationTag ? 'Location Tagged' : 'Add Location'}</span>
                        {form.locationTag && <p className="text-[9px] text-[#00F0FF] font-black uppercase mt-0.5">{form.locationTag}</p>}
                      </div>
                    </div>
                    <span className="text-gray-600 text-lg">❯</span>
                  </button>
                </div>
              </div>
            )}

            {/* --- THE PROPERTY / HUB FORM --- */}
            {createMode === 'hub-form' && (
              <div className="bg-[#151A25] border border-[#1E2532] rounded-[32px] p-6 space-y-5 shadow-xl">
                <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 p-3 rounded-xl mb-4 flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#00F0FF] uppercase tracking-widest">Posting in: {selectedHub}</span>
                </div>
                
                <input name="title" value={form.title} onChange={handleChange} placeholder="LISTING TITLE *" className="w-full bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none" required />
                
                {/* Real Estate Specifics (We will expand this later based on selectedHub) */}
                <div className="grid grid-cols-2 gap-3">
                  <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="PRICE (₹) *" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none" required />
                  <select name="propertyType" value={form.propertyType} onChange={handleChange} className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-gray-400 outline-none">
                    <option value="">TYPE</option>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <textarea name="description" value={form.description} onChange={handleChange} placeholder="DETAILED DESCRIPTION..." rows={4} className="w-full bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm text-white outline-none" />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white py-5 rounded-[24px] font-black tracking-[0.2em] uppercase shadow-[0_10px_30px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'PUBLISHING...' : `🚀 PUBLISH POST`}
            </button>
          </form>
        )}

      </div>

      {showMusicModal && <MusicPicker onClose={() => setShowMusicModal(false)} onSelect={(song) => setForm({ ...form, music: `${song.title} - ${song.artist}` })} />}
      {showLocationModal && <LocationPicker onClose={() => setShowLocationModal(false)} onSelect={(loc) => setForm({ ...form, locationTag: loc.name })} />}
    </div>
  );
}