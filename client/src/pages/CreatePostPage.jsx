/**
 * pages/CreatePostPage.jsx
 * Form to upload a property post (video reel or images + details).
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'plot', 'commercial', 'farmland', 'other'];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [mediaType, setMediaType] = useState('images'); // 'images' | 'video'
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [form, setForm] = useState({
    title: '', description: '', price: '', priceUnit: 'total',
    propertyType: 'apartment', area: '', bedrooms: '', bathrooms: '',
    taluk: '', district: '', state: '', country: 'India',
    hashtags: '', // comma-separated string
    lat: '', lng: '', address: '',
  });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Handle file selection and generate previews
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map(f => ({ url: URL.createObjectURL(f), type: f.type })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) { toast.error('Please select media files.'); return; }

    const formData = new FormData();

    // Append form fields
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'hashtags') {
        // Convert comma-separated string to JSON array
        const tags = val.split(',').map(t => t.trim()).filter(Boolean);
        formData.append('hashtags', JSON.stringify(tags));
      } else if (val) {
        formData.append(key, val);
      }
    });

    formData.append('mediaType', mediaType);

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

      toast.success('Property posted! 🏠');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Post a Property</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Media Type Toggle ── */}
        <div className="grid grid-cols-2 gap-3">
          {['images', 'video'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => { setMediaType(type); setFiles([]); setPreviews([]); }}
              className={`py-3 rounded-xl text-sm font-semibold capitalize transition-all
                ${mediaType === type ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              {type === 'images' ? '📸 Images' : '🎥 Video Reel'}
            </button>
          ))}
        </div>

        {/* ── File Upload ── */}
        <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
          <input
            type="file"
            accept={mediaType === 'video' ? 'video/*' : 'image/*'}
            multiple={mediaType === 'images'}
            onChange={handleFileChange}
            className="hidden"
            id="media-upload"
          />
          <label htmlFor="media-upload" className="cursor-pointer">
            <div className="text-4xl mb-2">{mediaType === 'video' ? '🎬' : '🖼️'}</div>
            <p className="text-zinc-400 text-sm">
              {files.length > 0
                ? `${files.length} file(s) selected`
                : `Click to upload ${mediaType === 'video' ? 'a video (max 60s)' : 'up to 10 images'}`
              }
            </p>
          </label>
        </div>

        {/* Media previews */}
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {previews.map((p, i) => (
              <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800">
                {p.type.startsWith('video') ? (
                  <video src={p.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Property Details ── */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Property Details</h2>

          <input name="title" value={form.title} onChange={handleChange} placeholder="Property title *" className="input-field" required />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price *" className="input-field" required />
            </div>
            <select name="priceUnit" value={form.priceUnit} onChange={handleChange} className="input-field">
              <option value="total">Total Price</option>
              <option value="per_sqft">Per Sq.Ft</option>
              <option value="per_month">Per Month</option>
            </select>
          </div>

          <select name="propertyType" value={form.propertyType} onChange={handleChange} className="input-field">
            {PROPERTY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>

          <div className="grid grid-cols-3 gap-3">
            <input name="area" value={form.area} onChange={handleChange} placeholder="Area (e.g. 1200 sqft)" className="input-field" />
            <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} placeholder="Bedrooms" className="input-field" />
            <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} placeholder="Bathrooms" className="input-field" />
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {/* ── Location ── */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Location</h2>
          <div className="grid grid-cols-2 gap-3">
            <input name="taluk" value={form.taluk} onChange={handleChange} placeholder="Taluk" className="input-field" />
            <input name="district" value={form.district} onChange={handleChange} placeholder="District" className="input-field" />
            <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="input-field" />
            <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="input-field" />
          </div>
        </div>
        {/* Google Maps Pin */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-700 mt-3">
            <p className="text-sm font-semibold text-zinc-300 mb-3">📍 Pin Property on Map <span className="text-zinc-500 font-normal">(optional)</span></p>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Full address (e.g. 123 MG Road, Bangalore)" className="input-field mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} placeholder="Latitude (e.g. 12.9716)" className="input-field" />
              <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} placeholder="Longitude (e.g. 77.5946)" className="input-field" />
            </div>
            <button type="button" onClick={() => { navigator.geolocation.getCurrentPosition((pos) => { setForm(f => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })); toast.success('Location captured!'); }, () => toast.error('Could not get location. Enter manually.')); }} className="mt-3 w-full py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">
              📡 Use My Current Location
            </button>
            {form.lat && form.lng && (
              <a href={`https://www.google.com/maps?q=${form.lat},${form.lng}`} target="_blank" rel="noreferrer" className="mt-2 block text-center text-xs text-orange-400 hover:underline">
                ✅ Preview on Google Maps →
              </a>
            )}
          </div>

        {/* ── Hashtags ── */}
        <div>
          <input
            name="hashtags"
            value={form.hashtags}
            onChange={handleChange}
            placeholder="Hashtags (comma-separated): luxury, 2bhk, beachfront"
            className="input-field"
          />
          <p className="text-xs text-zinc-500 mt-1">Separate with commas. # not needed.</p>
        </div>

        {/* Upload progress */}
        {loading && progress > 0 && (
          <div className="space-y-1">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-zinc-400 text-right">{progress}% uploaded</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
          {loading ? 'Uploading...' : '🚀 Publish Property'}
        </button>
      </form>
    </div>
  );
}
