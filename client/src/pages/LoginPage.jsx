import React, { useState, useEffect } from 'react'; // 🚨 ADDED useEffect HERE
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NodexaLogo from '../components/NodexaLogo';
import { IoMdMail, IoMdLock, IoMdFingerPrint, IoMdClose } from 'react-icons/io';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// 🚨 ADD THIS HELPER
const getApiUrl = (endpoint) => {
  const base = import.meta.env.VITE_API_URL || '';
  return base.endsWith('/api') && endpoint.startsWith('/api') 
    ? base.replace('/api', '') + endpoint 
    : base + endpoint;
};

export default function Login() {
 // 🚨 Checks if we just came from the account switcher
const [email, setEmail] = useState(localStorage.getItem('nodexa_last_username') || '');

// Clean up memory after autofilling so it doesn't stay there forever
useEffect(() => {
  localStorage.removeItem('nodexa_last_username');
}, []);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 👇 🚨 2FA STATE ADDED HERE 👇
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);
    
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // 🚨 We use axios directly here so we can catch the 2FA Gatekeeper!
      const res = await axios.post(getApiUrl('/api/auth/login'), { 
        email, 
        password, 
        timezone: userTimeZone 
      });
      
      // THE GATEKEEPER CAUGHT THEM!
      if (res.data.requires2FA) {
        setPendingUserId(res.data.userId); // Save ID for the next step
        setShow2FAModal(true); // Open the vault
        setLoading(false);
        return; // STOP! Do not let them in yet.
      }

      // If 2FA is OFF, let them in normally
      if (res.data.success) {
        localStorage.setItem('nodexa_token', res.data.data.token);
        window.location.href = '/'; // Hard redirect to load their profile
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Access Denied: Invalid credentials.');
      setLoading(false);
    } 
  };

  // 🚨 THIS RUNS WHEN THEY TYPE THE 6 DIGITS
  const submit2FACode = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(getApiUrl('/api/auth/verify-2fa-login'), { 
        userId: pendingUserId, 
        code: twoFactorCode 
      });
      
      // Success! Token granted.
      localStorage.setItem('nodexa_token', res.data.data.token);
      window.location.href = '/'; 
    } catch (err) {
      setError(err.response?.data?.message || "Invalid 2FA Code");
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0057FF]/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#00F0FF]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mb-10 relative z-20">
        <NodexaLogo size="w-48 md:w-64" />
      </div>

      <div className="w-full max-w-[400px] relative z-10 group">
        <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 via-white/5 to-[#00F0FF]/20 rounded-[40px] blur-sm opacity-50 transition duration-1000" />
        
        <div className="relative bg-[#0B0F19]/80 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-black italic tracking-widest text-white/90">SECURE TERMINAL</h2>
            <div className="w-12 h-[2px] bg-[#00F0FF] mx-auto mt-2 shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
          </div>

          {/* ERROR DISPLAY SYSTEM */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-bold text-center tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 tracking-[0.3em] uppercase ml-2">Operator Alias (@username)</label>
<div className="relative">
  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-600 text-lg">@</span>
  <input 
    type="text" // 🚨 Changed from email to text
    value={email} 
    placeholder="Enter Username" 
    className="w-full bg-[#05070A]/50 border border-[#1E2532] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#00F0FF]/40 transition-all text-white"
    onChange={(e) => setEmail(e.target.value)}
    required
  />
</div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 tracking-[0.3em] uppercase ml-2">Neural Access Key</label>
              <div className="relative">
                <IoMdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="password" 
                  value={password} // Fixes the autofill bug!
                  placeholder="••••••••" 
                  className="w-full bg-[#05070A]/50 border border-[#1E2532] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#00F0FF]/40 transition-all text-white"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 mt-2 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Establishing...' : 'Establish Link'} <IoMdFingerPrint size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <Link to="/register" className="text-[9px] font-black text-gray-500 hover:text-[#00F0FF] tracking-widest uppercase transition-colors">
              New User? <span className="text-white ml-1">Initialize Identity</span>
            </Link>
          </div>

          {/* ─── 📱 2FA LOGIN MODAL ─── */}
        <AnimatePresence>
          {show2FAModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#05070A]/90 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-[#0B0F19] border border-[#00F0FF]/30 rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(0,240,255,0.15)] relative"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#1E2532] flex justify-between items-center bg-[#151A25]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1E2532] flex items-center justify-center text-emerald-400">
                      <IoMdLock size={20} />
                    </div>
                    <h3 className="text-white font-black text-lg tracking-tight">2FA Required</h3>
                  </div>
                  <button onClick={() => setShow2FAModal(false)} className="text-gray-500 hover:text-white transition-colors">
                    <IoMdClose size={24} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={submit2FACode} className="p-6 flex flex-col items-center">
                  <p className="text-xs text-gray-400 font-medium text-center mb-6 leading-relaxed">
                    Enter the 6-digit code from your Authenticator app to access your terminal.
                  </p>

                  <div className="w-full space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1">Authentication Code</label>
                    <input 
                      type="text" 
                      required
                      maxLength="6"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#05070A] border border-[#1E2532] rounded-2xl py-3 px-4 text-center text-2xl tracking-[0.5em] font-black text-white outline-none focus:border-emerald-500/50 transition-colors"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={twoFactorCode.length < 6}
                    className="w-full py-4 mt-6 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
                  >
                    Verify & Enter
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}