import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NodexaLogo from '../components/NodexaLogo';
import { IoMdMail, IoMdLock, IoMdPerson, IoMdRocket } from 'react-icons/io';
import { MdOutlineAlternateEmail } from 'react-icons/md';

export default function Register() {
  const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await register(formData);
      if (success) {
        navigate('/'); // Goes to main feed
      } else {
        setError('Initialization failed. Email or Handle may be taken.');
      }
    } catch (err) {
      setError('Network error. Check server connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0057FF]/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#00F0FF]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mb-6 relative z-20">
        <NodexaLogo size="w-40 md:w-56" />
      </div>

      <div className="w-full max-w-[440px] relative z-10 group">
        <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 via-white/5 to-[#00F0FF]/20 rounded-[40px] blur-sm opacity-50 transition duration-1000" />
        
        <div className="relative bg-[#0B0F19]/80 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <div className="absolute top-6 right-8 opacity-20 text-[9px] font-black text-white uppercase tracking-[0.5em]">Phase 01</div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-black italic tracking-widest text-white/90">OPERATOR INIT</h2>
            <div className="w-12 h-[2px] bg-[#00F0FF] mx-auto mt-2 shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
          </div>

          {/* ERROR DISPLAY */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-bold text-center tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-500 tracking-[0.3em] uppercase ml-2">Legal Name</label>
                <div className="relative">
                  <IoMdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 focus-within:text-[#00F0FF]" size={16} />
                  <input 
                    type="text" 
                    value={formData.fullName}
                    placeholder="John Doe" 
                    className="w-full bg-[#05070A]/50 border border-[#1E2532] rounded-2xl py-3 pl-10 pr-3 text-xs font-bold outline-none focus:border-[#00F0FF]/40 transition-all text-white"
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-500 tracking-[0.3em] uppercase ml-2">Network Handle</label>
                <div className="relative">
                  <MdOutlineAlternateEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 focus-within:text-[#00F0FF]" size={16} />
                  <input 
                    type="text" 
                    value={formData.username}
                    placeholder="operator_01" 
                    className="w-full bg-[#05070A]/50 border border-[#1E2532] rounded-2xl py-3 pl-10 pr-3 text-xs font-bold outline-none focus:border-[#00F0FF]/40 transition-all text-white"
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-500 tracking-[0.3em] uppercase ml-2">Identity (Email)</label>
              <div className="relative">
                <IoMdMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 focus-within:text-[#00F0FF]" size={18} />
                <input 
                  type="email" 
                  value={formData.email}
                  placeholder="name@nodexa.com" 
                  className="w-full bg-[#05070A]/50 border border-[#1E2532] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#00F0FF]/40 transition-all text-white"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-500 tracking-[0.3em] uppercase ml-2">Neural Access Key</label>
              <div className="relative">
                <IoMdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 focus-within:text-[#00F0FF]" size={18} />
                <input 
                  type="password" 
                  value={formData.password}
                  placeholder="Create Secure Key" 
                  className="w-full bg-[#05070A]/50 border border-[#1E2532] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#00F0FF]/40 transition-all text-white"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Launching...' : 'Launch Node'} <IoMdRocket size={18} />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 flex flex-col items-center gap-4">
            <Link to="/login" className="text-[9px] font-black text-gray-500 hover:text-[#00F0FF] tracking-widest uppercase transition-colors">
              Already an Operator? <span className="text-white ml-1">Access Terminal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}