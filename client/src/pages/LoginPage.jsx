import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NodexaLogo from '../components/NodexaLogo';
import { IoMdMail, IoMdLock, IoMdFingerPrint } from 'react-icons/io';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0057FF]/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#00F0FF]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* THE STICKER LOGO */}
      <div className="mb-10 relative z-20">
        <NodexaLogo size="w-48 md:w-64" />
      </div>

      {/* THE LOGIN TERMINAL */}
      <div className="w-full max-w-[400px] relative z-10 group">
        <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 via-white/5 to-[#00F0FF]/20 rounded-[40px] blur-sm opacity-50 transition duration-1000" />
        
        <div className="relative bg-[#0B0F19]/80 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <div className="text-center mb-8">
            <h2 className="text-xl font-black italic tracking-widest text-white/90">SECURE TERMINAL</h2>
            <div className="w-12 h-[2px] bg-[#00F0FF] mx-auto mt-2 shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-500 tracking-[0.3em] uppercase ml-2">Operator Identity</label>
              <div className="relative">
                <IoMdMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 focus-within:text-[#00F0FF]" size={18} />
                <input 
                  type="email" 
                  placeholder="name@nodexa.com" 
                  className="w-full bg-[#05070A]/50 border border-[#1E2532] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#00F0FF]/40 transition-all"
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
                  placeholder="••••••••" 
                  className="w-full bg-[#05070A]/50 border border-[#1E2532] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#00F0FF]/40 transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full py-4 mt-2 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2">
              Establish Link <IoMdFingerPrint size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <Link to="/register" className="text-[9px] font-black text-gray-500 hover:text-[#00F0FF] tracking-widest uppercase transition-colors">
              New User? <span className="text-white ml-1">Initialize Identity</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}