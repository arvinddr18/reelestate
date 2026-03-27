import React from 'react';
import MyLogo from '../assets/nodexa-logo.png'; 

export default function NodexaLogo({ size = "w-72" }) {
  return (
    <div className={`relative ${size} flex flex-col items-center animate-float`}>
      
      {/* THE FIX: Removed drop-shadow, kept mix-blend-screen */}
      <img 
        src={MyLogo} 
        alt="Nodexa" 
        className="w-full h-auto mix-blend-screen" 
      />
      
      {/* OMNI Subtext */}
      <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#00F0FF]" />
          <span className="text-[9px] font-black tracking-[0.6em] text-[#00F0FF] uppercase opacity-80">
              OMNI ECOSYSTEM
          </span>
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#00F0FF]" />
      </div>
    </div>
  );
}