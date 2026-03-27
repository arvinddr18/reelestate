import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NodexaLogo from '../components/NodexaLogo';
import { IoMdLock, IoMdMail, IoMdArrowRoundForward } from 'react-icons/io';

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
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* ─── LEFT SIDE: BRAND COMMAND ─── */}
      <div className="hidden md:flex flex-[1.5] relative items-center justify-center bg-[#0D121F] border-r border-white/5">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#0057FF] opacity-10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00F0FF] opacity-10 blur-[150px] rounded-full" />
        
        <div className="relative z-10 text-center space-y-8 p-12">
          <NodexaLogo size="text-8xl" />
          <p className="max-w-md mx-auto text-gray-500 font-bold text-lg leading-relaxed tracking-wide">
            The next generation of real estate. Socially connected. Digitally optimized. Physically absolute.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-12">
             {['Direct Network', 'Instant Comms', 'Holographic Media', 'Market Intel'].map(tag => (
               <div key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#00F0FF]">
                 {tag}
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE: SECURE ACCESS ─── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="md:hidden absolute top-10 left-1/2 -translate-x-1/2">
           <NodexaLogo size="text-4xl" />
        </div>

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic tracking-tighter">SECURE ACCESS</h2>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Enter Neural Link Credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="group relative">
                <IoMdMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00F0FF] transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="IDENTITY (EMAIL)" 
                  className="w-full bg-[#151A25] border border-[#1E2532] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#00F0FF]/50 transition-all placeholder:text-gray-600 shadow-inner"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="group relative">
                <IoMdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00F0FF] transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="ACCESS KEY (PASSWORD)" 
                  className="w-full bg-[#151A25] border border-[#1E2532] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#00F0FF]/50 transition-all placeholder:text-gray-600 shadow-inner"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#00F0FF] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 group">
              Establish Connection
              <IoMdArrowRoundForward size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">
              New to the Network? {' '}
              <Link to="/register" className="text-[#00F0FF] hover:underline decoration-2 underline-offset-4">
                Initialize Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}