import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NodexaLogo from '../components/NodexaLogo';
import { IoMdPerson, IoMdMail, IoMdLock, IoMdRocket } from 'react-icons/io';

export default function Register() {
  const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decals */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#0057FF]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#00F0FF]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="mb-12">
        <NodexaLogo size="text-5xl" />
      </div>

      <div className="w-full max-w-md bg-[#151A25]/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-2xl relative">
        <div className="absolute top-6 right-8 opacity-20 text-[10px] font-black text-white uppercase tracking-[0.5em]">Phase 01: Init</div>
        
        <h2 className="text-2xl font-black italic mb-8 tracking-tighter uppercase">Initialize Operator</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <input 
              type="text" 
              placeholder="FULL NAME" 
              className="w-full bg-[#0B0F19] border border-[#1E2532] rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-[#00F0FF]/50"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required
            />
             <input 
              type="text" 
              placeholder="@HANDLE" 
              className="w-full bg-[#0B0F19] border border-[#1E2532] rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-[#00F0FF]/50"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          <div className="relative group">
            <IoMdMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input 
              type="email" 
              placeholder="IDENTITY (EMAIL)" 
              className="w-full bg-[#0B0F19] border border-[#1E2532] rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#00F0FF]/50"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="relative group">
            <IoMdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input 
              type="password" 
              placeholder="ACCESS KEY (PASSWORD)" 
              className="w-full bg-[#0B0F19] border border-[#1E2532] rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-[#00F0FF]/50"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(0,87,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
            Launch NODEXA <IoMdRocket size={18} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
            Already registered? Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}