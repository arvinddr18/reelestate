/**
 * pages/CreatePostPage.jsx
 * The Super App Creation Router (Y-Fork Architecture)
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { IoMdCloudUpload, IoMdVideocam, IoMdImages, IoMdPin, IoMdInformationCircle, IoMdArrowBack, IoMdCall } from 'react-icons/io';
import { MAIN_CATEGORIES } from '../constants/categories'; // Your 19 categories

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'plot', 'commercial', 'farmland', 'other'];

// ─── HELPER COMPONENTS ───
const MusicPicker = ({ onSelect, onClose }) => {
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

const TagPicker = ({ onSelect, onClose }) => {
  const USERS = [{ id: '1', handle: '@arvinddr', name: 'Arvind' }, { id: '2', handle: '@nodexa', name: 'Nodexa Official' }];
  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0F19]/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 flex flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black italic tracking-tighter">TAG PEOPLE</h2>
        <button onClick={onClose} className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest">Close</button>
      </div>
      <div className="space-y-3">
        {USERS.map(user => (
          <button key={user.id} onClick={() => { onSelect(user); onClose(); }} className="w-full flex items-center gap-4 p-4 bg-[#151A25] rounded-2xl border border-[#1E2532] hover:border-[#00F0FF] text-left">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] flex items-center justify-center font-black">{user.name[0]}</div>
            <div>
              <span className="text-xs font-black text-white block">{user.handle}</span>
              <span className="text-[10px] text-gray-500 font-bold">{user.name}</span>
            </div>
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
  const [postIntent, setPostIntent] = useState('business');

  // 2. CORE FORM STATE
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [mediaType, setMediaType] = useState('images'); 
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const FILTERS = [ // 👈 NEW: CSS Filters for Instagram look
    { name: 'Normal', class: '' },
    { name: 'Vivid', class: 'contrast-125 brightness-110 saturate-150' },
    { name: 'Cool', class: 'brightness-105 hue-rotate-15 saturate-50' },
    { name: 'Mono', class: 'grayscale contrast-125' }
  ];

  const [form, setForm] = useState({
    title: '', description: '', price: '', propertyType: '', area: '', bedrooms: '', locationTag: '', music: '',
    // ── NEW SUPER APP FIELDS ──
    salary: '', jobType: '', experience: '', jobRole: '', condition: '', brand: '', mileage: '', 
    eventDate: '', eventTime: '', ticketPrice: '', cuisine: '', dietary: '',
    institute: '', collegeWebsite: '', serviceAvailable: '', timings: '', genderFocus: '', 
    entryFees: '', serviceType: '', warranty: '', age: '', breed: '', ageGroup: '', rooms: '',
    taggedUsers: [], mediaFilter: ''
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
    if (createMode === 'social' || postIntent === 'activity') {
      safeForm.price = 0; 
      safeForm.propertyType = 'other';
      safeForm.mainCategory = createMode === 'social' ? 'Social' : selectedHub;
      safeForm.title = safeForm.description ? `${safeForm.description.substring(0, 20)}...` : 'Community Update';
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
                  onClick={() => { setSelectedHub(cat.name); setCreateMode('hub-intent'); }}
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
            NEW VIEW: THE INTENT SELECTOR (Activity vs Business)
        ──────────────────────────────────────────────────────── */}
        {createMode === 'hub-intent' && (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="bg-[#00F0FF]/10 text-[#00F0FF] px-4 py-1.5 rounded-full inline-block text-[10px] font-black uppercase tracking-widest mb-4 border border-[#00F0FF]/30">
                {selectedHub}
              </div>
              <h2 className="text-2xl font-black text-white">What type of post is this?</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div onClick={() => { setPostIntent('activity'); setCreateMode('hub-form'); }} className="bg-[#151A25] border border-[#1E2532] hover:border-[#00F0FF] p-6 rounded-3xl cursor-pointer transition-all active:scale-95 group flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-[#0B0F19] border border-[#1E2532] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📸</div>
                <div>
                  <h3 className="text-lg font-black text-white">Activity Feed</h3>
                  <p className="text-xs text-gray-400 font-bold mt-1">Share photos, updates, or vibes with the community.</p>
                </div>
              </div>

              <div onClick={() => { setPostIntent('business'); setCreateMode('hub-form'); }} className="bg-[#151A25] border border-[#1E2532] hover:border-[#00F0FF] p-6 rounded-3xl cursor-pointer transition-all active:scale-95 group flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-[#0B0F19] border border-[#1E2532] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏪</div>
                <div>
                  <h3 className="text-lg font-black text-white">Business Listing</h3>
                  <p className="text-xs text-gray-400 font-bold mt-1">Sell, Hire, Rent, or Advertise specific details.</p>
                </div>
              </div>
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
                  {/* Notice 'multiple' is here, allowing gallery selection! */}
                  <input type="file" accept={mediaType === 'video' ? 'video/*' : 'image/*'} multiple={mediaType === 'images'} onChange={handleFileChange} className="hidden" />
                  <IoMdCloudUpload size={40} className="mx-auto text-gray-600 group-hover:text-[#00F0FF] transition-colors mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{files.length > 0 ? `${files.length} Selected` : `Tap to open Gallery`}</p>
                </div>
              </label>

              {/* Previews & Filters */}
              {previews.length > 0 && (
                <div className="mt-4">
                  {/* Horizontal Scroll of Images */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {previews.map((p, i) => (
                      <div key={i} className="w-24 h-24 rounded-xl overflow-hidden bg-[#1E2532] shrink-0 border border-[#2A3441] relative">
                        {p.type.startsWith('video') ? 
                          <video src={p.url} className={`w-full h-full object-cover ${form.mediaFilter}`} /> : 
                          <img src={p.url} className={`w-full h-full object-cover ${form.mediaFilter}`} alt=""/>
                        }
                      </div>
                    ))}
                  </div>
                  
                  {/* 🎨 FILTER SELECTOR */}
                  {mediaType === 'images' && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-[#1E2532]">
                      {FILTERS.map(filter => (
                        <button type="button" key={filter.name} onClick={() => setForm({...form, mediaFilter: filter.class})} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 transition-all ${form.mediaFilter === filter.class ? 'bg-[#00F0FF] text-black' : 'bg-[#0B0F19] text-gray-500 border border-[#1E2532]'}`}>
                          {filter.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- SOCIAL OR ACTIVITY FEED FORM --- */}
            {(createMode === 'social' || postIntent === 'activity') && (
              <div className="bg-[#151A25] border border-[#1E2532] rounded-[32px] p-6 space-y-6 shadow-xl relative overflow-hidden">
                {createMode === 'hub-form' && (
                  <div className="absolute top-0 left-0 right-0 bg-[#0057FF]/20 text-[#00F0FF] text-center text-[10px] font-black uppercase tracking-[0.2em] py-1.5 border-b border-[#00F0FF]/20">
                    {selectedHub} Community Feed
                  </div>
                )}

                <div className={`flex gap-4 bg-[#0B0F19] p-4 rounded-3xl border border-[#1E2532] ${createMode === 'hub-form' ? 'mt-4' : ''}`}>
                  <textarea name="description" placeholder={createMode === 'social' ? "Write a caption..." : `Share an update with the ${selectedHub} community...`} value={form.description} onChange={handleChange} className="w-full bg-transparent text-sm outline-none resize-none pt-2 text-white" rows={4} />
                </div>
                
                <div className="overflow-hidden rounded-3xl border border-[#1E2532] bg-[#0B0F19]">
                  {/* Add Audio */}
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

                  {/* Add Location */}
                  <button type="button" onClick={() => setShowLocationModal(true)} className="w-full flex items-center justify-between p-5 hover:bg-[#1E2532] transition-colors border-b border-[#1E2532]/50">
                    <div className="flex items-center gap-4">
                      <span className="text-xl">📍</span>
                      <div className="text-left">
                        <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">{form.locationTag ? 'Location Tagged' : 'Add Location'}</span>
                        {form.locationTag && <p className="text-[9px] text-[#00F0FF] font-black uppercase mt-0.5">{form.locationTag}</p>}
                      </div>
                    </div>
                    <span className="text-gray-600 text-lg">❯</span>
                  </button>

                  {/* 👤 TAG PEOPLE */}
                  <button type="button" onClick={() => setShowTagModal(true)} className="w-full flex items-center justify-between p-5 hover:bg-[#1E2532] transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-xl">👤</span>
                      <div className="text-left">
                        <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">{form.taggedUsers.length > 0 ? `${form.taggedUsers.length} People Tagged` : 'Tag People'}</span>
                        {form.taggedUsers.length > 0 && <p className="text-[9px] text-[#00F0FF] font-black uppercase mt-0.5">{form.taggedUsers.join(', ')}</p>}
                      </div>
                    </div>
                    <span className="text-gray-600 text-lg">❯</span>
                  </button>
                </div>
              </div>
            )}

            {/* --- THE DYNAMIC HUB FORM --- */}
            {createMode === 'hub-form' && postIntent === 'business' && (
              <div className="bg-[#151A25] border border-[#1E2532] rounded-[32px] p-6 space-y-5 shadow-xl">
                <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 p-3 rounded-xl mb-4 flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#00F0FF] uppercase tracking-widest">Posting in: {selectedHub}</span>
                </div>
                
                {/* 1. UNIVERSAL TITLE */}
                <input name="title" value={form.title} onChange={handleChange} placeholder="LISTING TITLE *" className="w-full bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50 transition-colors" required />
                
                {/* 2. DYNAMIC FIELDS (Changes based on category) */}

               {/* 💼 JOBS & GIGS */}
                {selectedHub === 'Jobs & Gigs' && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    <input name="jobRole" value={form.jobRole} onChange={handleChange} placeholder="JOB ROLE (e.g. Graphic Designer) *" className="col-span-2 bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50 transition-colors" required />
                    <input name="salary" value={form.salary} onChange={handleChange} placeholder="SALARY (₹) *" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" required />
                    <select name="jobType" value={form.jobType} onChange={handleChange} className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-gray-400 outline-none">
                      <option value="">JOB TYPE</option><option value="Full-Time">Full-Time</option><option value="Part-Time">Part-Time</option><option value="Freelance">Freelance</option>
                    </select>
                    <input name="experience" value={form.experience} onChange={handleChange} placeholder="EXPERIENCE (e.g. 2-4 Yrs)" className="col-span-2 bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                  </div>
                )}

                {/* 🛠️ HOME SERVICES & BEAUTY */}
                {['Home Services', 'Beauty & Care'].includes(selectedHub) && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="STARTING PRICE (₹) *" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" required />
                    <input name="serviceAvailable" value={form.serviceAvailable} onChange={handleChange} placeholder={selectedHub === 'Beauty & Care' ? "SERVICE (e.g. Haircut, Bridal)" : "SERVICE (e.g. Plumbing, Cleaning)"} className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                  </div>
                )}

                {/* 🎓 EDUCATION */}
                {selectedHub === 'Education' && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    <input name="institute" value={form.institute} onChange={handleChange} placeholder="INSTITUTE NAME *" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" required />
                    <input name="collegeWebsite" value={form.collegeWebsite} onChange={handleChange} placeholder="WEBSITE LINK" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                  </div>
                )}

                {/* 🏋️ GYM & FITNESS */}
                {selectedHub === 'Gym & Fitness' && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="MONTHLY FEES (₹) *" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" required />
                    <select name="genderFocus" value={form.genderFocus} onChange={handleChange} className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-gray-400 outline-none">
                      <option value="">GENDER</option><option value="Unisex">Unisex</option><option value="Boys Only">Boys Only</option><option value="Girls Only">Girls Only</option>
                    </select>
                    <input name="timings" value={form.timings} onChange={handleChange} placeholder="TIMINGS (e.g. 6AM - 10PM)" className="col-span-2 bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                  </div>
                )}

                {/* ⚽ SPORTS */}
                {selectedHub === 'Sports' && (
                  <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-300">
                    <input name="entryFees" value={form.entryFees} onChange={handleChange} placeholder="ENTRY FEES (₹) or 'Free' *" className="w-full bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" required />
                  </div>
                )}

                {/* 🎟️ EVENTS, CINEMA & TRIPS */}
                {['Local Events', 'Cinema', 'Travel & Trips'].includes(selectedHub) && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    <div className="bg-[#0B0F19] border border-[#1E2532] rounded-2xl p-2 relative">
                      <label className="text-[9px] font-black text-[#00F0FF] uppercase tracking-widest absolute top-2 left-4">Date</label>
                      <input name="eventDate" type="date" value={form.eventDate} onChange={handleChange} className="w-full bg-transparent p-2 pt-4 text-sm font-bold text-white outline-none" required />
                    </div>
                    <div className="bg-[#0B0F19] border border-[#1E2532] rounded-2xl p-2 relative">
                      <label className="text-[9px] font-black text-[#00F0FF] uppercase tracking-widest absolute top-2 left-4">Time</label>
                      <input name="eventTime" type="time" value={form.eventTime} onChange={handleChange} className="w-full bg-transparent p-2 pt-4 text-sm font-bold text-white outline-none" required />
                    </div>
                  </div>
                )}

                {/* 🐾 PETS */}
                {selectedHub === 'Pets' && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="PRICE (₹) *" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" required />
                    <input name="age" value={form.age} onChange={handleChange} placeholder="AGE (e.g. 2 Months)" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                    <input name="breed" value={form.breed} onChange={handleChange} placeholder="BREED (e.g. Golden Retriever)" className="col-span-2 bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                  </div>
                )}

                {/* 🧸 KIDS */}
                {selectedHub === 'Kids' && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="PRICE (₹) *" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" required />
                    <input name="ageGroup" value={form.ageGroup} onChange={handleChange} placeholder="AGE GROUP (e.g. 0-2 Yrs)" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                  </div>
                )}

                {/* 🛍️ MARKETPLACE, AUTO, FASHION, TECH */}
                {['Marketplace', 'Auto & Motors', 'Tech & Gadgets', 'Fashion'].includes(selectedHub) && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="PRICE (₹) *" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" required />
                    <select name="condition" value={form.condition} onChange={handleChange} className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-gray-400 outline-none">
                      <option value="">CONDITION</option><option value="Brand New">Brand New</option><option value="Used - Good">Used - Good</option>
                    </select>
                    <input name="brand" value={form.brand} onChange={handleChange} placeholder="BRAND / MAKE" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                    
                    {selectedHub === 'Auto & Motors' && <input name="mileage" value={form.mileage} onChange={handleChange} placeholder="KM DRIVEN" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />}
                    {selectedHub === 'Tech & Gadgets' && <input name="warranty" value={form.warranty} onChange={handleChange} placeholder="WARRANTY LEFT" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />}
                  </div>
                )}

                {/* 🍔 FOOD & CAFES */}
                {selectedHub === 'Food & Cafes' && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    <input name="cuisine" value={form.cuisine} onChange={handleChange} placeholder="CUISINE *" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" required />
                    <select name="dietary" value={form.dietary} onChange={handleChange} className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-gray-400 outline-none">
                      <option value="">DIETARY</option><option value="Pure Veg">Pure Veg</option><option value="Non-Veg">Non-Veg</option><option value="Both">Both</option>
                    </select>
                  </div>
                )}

                {/* 🏠 REAL ESTATE (Sale, Rents, PGs) */}
                {['Sale Hub', 'Rents', 'PGs & Co-Living'].includes(selectedHub) && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder={selectedHub === 'Sale Hub' ? "PRICE (₹) *" : "MONTHLY RENT (₹) *"} className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" required />
                    
                   {/* Filter Property Types based on Sale vs Rent vs PG */}
                    <select name="propertyType" value={form.propertyType} onChange={handleChange} className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-gray-400 outline-none">
                      <option value="">PROPERTY TYPE</option>
                      
                      {selectedHub === 'PGs & Co-Living' ? (
                        ['PG for Boys', 'PG for Girls', 'Co-Living', 'Hostel'].map(t => <option key={t} value={t} className="text-white">{t}</option>)
                      
                      ) : selectedHub === 'Rents' ? (
                        <>
                          <optgroup label="── ROOMS ──" className="text-[#00F0FF] bg-[#151A25]">
                            <option value="Single Room" className="text-white">Single Room</option>
                            <option value="Shared Room" className="text-white">Shared Room</option>
                            <option value="Independent Room" className="text-white">Independent Room</option>
                            <option value="Room with attached bathroom" className="text-white">Room with attached bathroom</option>
                            <option value="Room with kitchen" className="text-white">Room with kitchen</option>
                          </optgroup>
                          
                          <optgroup label="── FLATS / APARTMENTS ──" className="text-[#00F0FF] bg-[#151A25]">
                            <option value="1BHK" className="text-white">1BHK</option>
                            <option value="2BHK" className="text-white">2BHK</option>
                            <option value="3BHK" className="text-white">3BHK</option>
                            <option value="Studio Apartment" className="text-white">Studio Apartment</option>
                          </optgroup>
                          
                          <optgroup label="── INDEPENDENT HOUSES ──" className="text-[#00F0FF] bg-[#151A25]">
                            <option value="Full house for rent" className="text-white">Full house for rent</option>
                            <option value="Floor-wise rent" className="text-white">Floor-wise rent</option>
                            <option value="Villa rent" className="text-white">Villa rent</option>
                          </optgroup>
                          
                          <optgroup label="── COMMERCIAL RENT ──" className="text-[#00F0FF] bg-[#151A25]">
                            <option value="Shop" className="text-white">Shop</option>
                            <option value="Office" className="text-white">Office</option>
                            <option value="Warehouse" className="text-white">Warehouse</option>
                            <option value="Showroom" className="text-white">Showroom</option>
                          </optgroup>
                        </>

                      ) : (
                        <>
                          {/* Default to Sale Hub Options */}
                          <optgroup label="── RESIDENTIAL ──" className="text-[#00F0FF] bg-[#151A25]">
                            <option value="Independent House" className="text-white">Independent House</option>
                            <option value="Apartment / Flat" className="text-white">Apartment / Flat</option>
                            <option value="Villa" className="text-white">Villa</option>
                            <option value="Old House" className="text-white">Old House</option>
                            <option value="Under Construction Home" className="text-white">Under Construction Home</option>
                          </optgroup>
                          
                          <optgroup label="── LAND / PLOTS ──" className="text-[#00F0FF] bg-[#151A25]">
                            <option value="Residential Plots" className="text-white">Residential Plots</option>
                            <option value="Layout Sites" className="text-white">Layout Sites</option>
                            <option value="Agriculture Land" className="text-white">Agriculture Land</option>
                            <option value="Farm Land" className="text-white">Farm Land</option>
                            <option value="Farm House Land" className="text-white">Farm House Land</option>
                          </optgroup>
                          
                          <optgroup label="── COMMERCIAL ──" className="text-[#00F0FF] bg-[#151A25]">
                            <option value="Shops" className="text-white">Shops</option>
                            <option value="Office Space" className="text-white">Office Space</option>
                            <option value="Warehouse" className="text-white">Warehouse</option>
                            <option value="Showroom" className="text-white">Showroom</option>
                            <option value="Hotels" className="text-white">Hotels</option>
                          </optgroup>
                        </>
                      )}
                    </select>
                    <input name="area" value={form.area} onChange={handleChange} placeholder="AREA (Sqft)" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                    
                    {selectedHub === 'PGs & Co-Living' ? (
                       <input name="rooms" type="number" value={form.rooms} onChange={handleChange} placeholder="ROOMS AVAILABLE" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                    ) : (
                       <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} placeholder="BHK (e.g. 2, 3)" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50" />
                    )}
                  </div>
                )}

                {/* 3. UNIVERSAL DESCRIPTION */}
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="DETAILED DESCRIPTION..." rows={4} className="w-full bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm text-white outline-none focus:border-[#00F0FF]/50 transition-colors" />

                {/* 4. UNIVERSAL LOCATION & CONTACT (Applies to ALL Hubs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#1E2532]">
                   <div className="relative">
                      <IoMdCall className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="CONTACT NUMBER (Optional)" className="w-full bg-[#0B0F19] border border-[#1E2532] pl-10 pr-4 py-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50 transition-colors" />
                   </div>
                   <div className="relative">
                      <IoMdPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input name="locationTag" value={form.locationTag} onChange={handleChange} placeholder="LOCATION (City/Area) *" className="w-full bg-[#0B0F19] border border-[#1E2532] pl-10 pr-4 py-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#00F0FF]/50 transition-colors" required />
                   </div>
                </div>

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
      {showTagModal && <TagPicker onClose={() => setShowTagModal(false)} onSelect={(user) => setForm({ ...form, taggedUsers: [...form.taggedUsers, user.handle] })} />}
    </div>
  );
}