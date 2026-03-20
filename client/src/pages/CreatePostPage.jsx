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

// ─── 1. MUSIC PICKER COMPONENT (Helper) ───
const MusicPicker = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const SONGS = [
    { id: '1', title: 'Midnight City', artist: 'M83', icon: '🎧' },
    { id: '2', title: 'Levitating', artist: 'Dua Lipa', icon: '✨' },
    { id: '3', title: 'Lo-fi Study', artist: 'Lofi Girl', icon: '☕' },
    { id: '4', title: 'Real Estate Vibes', artist: 'Nodexa Beats', icon: '🏠' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0F19]/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 flex flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black italic tracking-tighter">SELECT AUDIO</h2>
        <button type="button" onClick={onClose} className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">Close</button>
      </div>
      <input 
        placeholder="Search for music or artists..." 
        className="w-full bg-[#151A25] border border-[#1E2532] p-5 rounded-2xl mb-8 outline-none text-sm font-bold focus:border-[#00F0FF]/50"
        onChange={(e) => setQuery(e.target.value.toLowerCase())}
      />
      <div className="space-y-3 overflow-y-auto no-scrollbar">
        {SONGS.filter(s => s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query)).map(song => (
          <button 
            key={song.id} type="button" onClick={() => { onSelect(song); onClose(); }}
            className="w-full flex items-center justify-between p-4 bg-[#151A25] rounded-2xl border border-[#1E2532] hover:border-[#00F0FF] transition-all group"
          >
            <div className="flex items-center gap-4 text-left">
              <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{song.icon}</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{song.title}</p>
                <p className="text-[10px] text-gray-500 font-bold">{song.artist}</p>
              </div>
            </div>
            <span className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Select</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── 2. LOCATION PICKER COMPONENT (Helper) ───
const LocationPicker = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const LOCATIONS = [
    { id: '1', name: 'Bengaluru, Karnataka', type: 'City' },
    { id: '2', name: 'Kerehosahalli', type: 'Neighborhood' },
    { id: '3', name: 'Tarikere', type: 'Town' },
    { id: '4', name: 'Chikmagalur', type: 'District' },
    { id: '5', name: 'Nodexa HQ', type: 'Custom Location' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0F19]/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 flex flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black italic tracking-tighter">TAG LOCATION</h2>
        <button type="button" onClick={onClose} className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">Close</button>
      </div>
      <input 
        placeholder="Search places, cities, or neighborhoods..." 
        className="w-full bg-[#151A25] border border-[#1E2532] p-5 rounded-2xl mb-8 outline-none text-sm font-bold focus:border-[#00F0FF]/50"
        onChange={(e) => setQuery(e.target.value.toLowerCase())}
      />
      <div className="space-y-3 overflow-y-auto no-scrollbar">
        {LOCATIONS.filter(l => l.name.toLowerCase().includes(query)).map(loc => (
          <button 
            key={loc.id} type="button" onClick={() => { onSelect(loc); onClose(); }}
            className="w-full flex items-center justify-between p-4 bg-[#151A25] rounded-2xl border border-[#1E2532] hover:border-[#00F0FF] transition-all group"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-full bg-[#1E2532] flex items-center justify-center text-lg grayscale group-hover:grayscale-0 transition-all">📍</div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white">{loc.name}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{loc.type}</p>
              </div>
            </div>
            <span className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Select</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── 3. MAIN PAGE COMPONENT ───
export default function CreatePostPage() {
  const navigate = useNavigate();
  
  // CORE STATE
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [postType, setPostType] = useState('Real Estate'); 
  const [mediaType, setMediaType] = useState('images'); 
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [form, setForm] = useState({
    title: 'Social Post', 
    description: '', 
    price: '', 
    priceUnit: 'total',
    mainCategory: 'Sale Hub', 
    subCategory: 'All', 
    propertyType: 'none', 
    area: '', 
    bedrooms: '', 
    bathrooms: '',
    location: '',
    phone: '',
    hashtags: '',
    knowledgeSubject: '',
    knowledgeLevel: 'Beginner',
    music: '',
    locationTag: '',
    hasPoll: false,
    audience: 'Followers'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mainCategory' && value === 'Social') {
      setForm(prev => ({
        ...prev, [name]: value, price: '', propertyType: 'none', taluk: '', district: '', area: '', bedrooms: '', bathrooms: ''
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map(f => ({ url: URL.createObjectURL(f), type: f.type })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) { toast.error('Please select media files.'); return; }

    const formData = new FormData();
    
    // ─── THE STRICT BACKEND FIX ───
    // Mongoose demands a number for price and a valid enum for propertyType.
    // We supply safe defaults for Social posts to keep the database happy!
    let safeForm = { ...form };
    
    if (postType === 'Social') {
      safeForm.price = 0; 
      safeForm.propertyType = 'other';
      // Fallback title since Social mode doesn't have a title input
      safeForm.title = safeForm.description ? `${safeForm.description.substring(0, 20)}...` : 'Social Update';
    } else {
      // Fix for Real Estate if user left things blank accidentally
      if (!safeForm.price || isNaN(safeForm.price)) safeForm.price = 0;
      if (safeForm.propertyType === 'none' || !safeForm.propertyType) safeForm.propertyType = 'other';
    }

    // Append data safely to formData
    Object.entries(safeForm).forEach(([key, val]) => {
      if (key === 'hashtags') {
        const tags = val.split(',').map(t => t.trim()).filter(Boolean);
        formData.append('hashtags', JSON.stringify(tags));
      } else {
        formData.append(key, val);
      }
    });

    formData.append('mediaType', mediaType);
    formData.append('postType', postType);

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
      
      {/* HEADER */}
      <div className="bg-gradient-to-b from-[#0057FF]/10 to-transparent pt-12 pb-6 px-6 text-center">
        <h1 className="text-3xl font-black tracking-tighter italic">CREATE CONTENT</h1>
        <p className="text-[#00F0FF] text-[10px] font-black uppercase tracking-[0.3em] mt-1">Share with the Nodexa Community</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-6 space-y-8">
        
        {/* VIBE SWITCHER */}
        <div className="bg-[#151A25] p-1.5 rounded-2xl border border-[#1E2532] flex gap-1">
          {['Real Estate', 'Knowledge', 'Social'].map(mode => (
            <button
              key={mode} type="button"
              onClick={() => {
                setPostType(mode);
                setForm(f => ({ ...f, mainCategory: mode === 'Real Estate' ? 'Sale Hub' : mode === 'Knowledge' ? 'Education' : 'Social' }));
              }}
              className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                postType === mode ? 'bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white shadow-lg' : 'text-gray-500 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* MEDIA UPLOAD */}
        <div className="space-y-4">
          <div className="flex gap-2">
            {['images', 'video'].map(type => (
              <button
                key={type} type="button"
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

        {/* DYNAMIC FORM DETAILS */}
        <div className="bg-[#151A25] border border-[#1E2532] rounded-[32px] p-6 space-y-5 shadow-xl">
          <h2 className="text-[10px] font-black text-[#00F0FF] uppercase tracking-[0.3em] flex items-center gap-2">
            <IoMdInformationCircle size={16}/> {postType === 'Social' ? 'INSTA-STUDIO' : 'ESSENTIAL DETAILS'}
          </h2>

          {/* SOCIAL MODE */}
          {postType === 'Social' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              <div className="flex gap-4 bg-[#0B0F19] p-4 rounded-3xl border border-[#1E2532]">
                 <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden shrink-0 border border-[#1E2532]">
                    {previews[0] ? <img src={previews[0].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />}
                 </div>
                 <textarea name="description" placeholder="Write a caption..." value={form.description} onChange={handleChange} className="w-full bg-transparent text-sm outline-none resize-none pt-2" rows={3} />
              </div>

              {/* LIST OPTIONS WITH MUSIC & LOCATION BUTTONS */}
              <div className="overflow-hidden rounded-3xl border border-[#1E2532] bg-[#0B0F19]">
                <button type="button" onClick={() => setShowMusicModal(true)} className="w-full flex items-center justify-between p-5 hover:bg-[#1E2532] transition-colors border-b border-[#1E2532]/50">
                  <div className="flex items-center gap-4">
                    <span className="text-xl">🎵</span>
                    <div className="text-left">
                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">
                        {form.music ? 'Music Selected' : 'Add Audio'}
                      </span>
                      {form.music && <p className="text-[9px] text-[#00F0FF] font-black uppercase mt-0.5">{form.music}</p>}
                    </div>
                  </div>
                  <span className="text-gray-600 text-lg">❯</span>
                </button>

                <button type="button" onClick={() => setShowLocationModal(true)} className="w-full flex items-center justify-between p-5 hover:bg-[#1E2532] transition-colors border-b border-[#1E2532]/50">
                  <div className="flex items-center gap-4">
                    <span className="text-xl">📍</span>
                    <div className="text-left">
                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">
                        {form.locationTag ? 'Location Tagged' : 'Add Location'}
                      </span>
                      {form.locationTag && <p className="text-[9px] text-[#00F0FF] font-black uppercase mt-0.5">{form.locationTag}</p>}
                    </div>
                  </div>
                  <span className="text-gray-600 text-lg">❯</span>
                </button>
              </div>
            </div>
          )}

          {/* REAL ESTATE / KNOWLEDGE MODE */}
          {postType !== 'Social' && (
            <div className="space-y-5">
              <input name="title" value={form.title} onChange={handleChange} placeholder="GIVE IT A CATCHY TITLE *" className="w-full bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold outline-none" required />
              
              {form.mainCategory !== 'Social' && (
                <div className="space-y-5 animate-in fade-in duration-500">
                  <div className="grid grid-cols-2 gap-3">
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="PRICE (₹) *" className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm font-bold outline-none" required />
                    <select name="propertyType" value={form.propertyType} onChange={handleChange} className="bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-gray-400 outline-none">
                      {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="DESCRIBE YOUR POST..." rows={4} className="w-full bg-[#0B0F19] border border-[#1E2532] p-4 rounded-2xl text-sm outline-none" />
            </div>
          )}
        </div>

        {/* CATEGORY TAGGING */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Display Hub</label>
          <select name="mainCategory" value={form.mainCategory} onChange={handleChange} className="w-full bg-[#151A25] border border-[#1E2532] p-4 rounded-2xl text-[11px] font-black uppercase text-[#00F0FF] outline-none shadow-lg">
            {MAIN_CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="space-y-4 pt-4">
          {loading && progress > 0 && (
            <div className="w-full bg-[#1E2532] h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white py-5 rounded-[24px] font-black tracking-[0.2em] uppercase shadow-[0_10px_30px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
            {loading ? 'UPLOADING...' : `🚀 PUBLISH ${postType}`}
          </button>
        </div>
      </form>

      {/* ── MODALS (Hidden until clicked) ── */}
      {showMusicModal && (
        <MusicPicker onClose={() => setShowMusicModal(false)} onSelect={(song) => setForm(f => ({ ...f, music: `${song.title} - ${song.artist}` }))} />
      )}
      
      {showLocationModal && (
        <LocationPicker onClose={() => setShowLocationModal(false)} onSelect={(loc) => setForm(f => ({ ...f, locationTag: loc.name }))} />
      )}

    </div>
  );
}