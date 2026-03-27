import React from 'react';
import MyLogo from '../assets/logo.nodexa.png'; // Make sure this path is correct!

export default function NodexaLogo({ size = "w-64" }) {
  return (
    <div className={`relative ${size} flex flex-col items-center group animate-float`}>
      {/* ─── 1. The Glow Aura behind the logo ─── */}
      <div className="absolute inset-0 bg-[#00F0FF] opacity-10 blur-[50px] rounded-full group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />
      
      {/* ─── 2. Your actual image (the magic part) ─── */}
      <div className="relative z-10 flex flex-col items-center p-4">
        <img 
          src={MyLogo} 
          alt="Nodexa" 
          className="w-full h-auto mix-blend-screen drop-shadow-[0_0_15px_rgba(0,240,255,0.7)]" 
        />
        
        {/* ─── 3. Re-added stylized OMNI ECOSYSTEM subtext ─── */}
        <div className="mt-2 flex items-center justify-center gap-2">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#00F0FF]" />
            <span className="text-[9px] font-black tracking-[0.6em] text-[#00F0FF] uppercase opacity-80">
                OMNI ECOSYSTEM
            </span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#00F0FF]" />
        </div>
      </div>
      
      {/* ─── 4. Re-added and improved reflection effect ─── */}
      <div className="absolute -bottom-8 left-0 right-0 h-12 bg-gradient-to-t from-[#00F0FF]/15 to-transparent blur-xl opacity-60 skew-x-12 pointer-events-none" />
    </div>
  );
}