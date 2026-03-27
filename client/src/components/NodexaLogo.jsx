import React from 'react';
import MyLogo from '../assets/nodexa-logo.png'; 

export default function NodexaLogo({ size = "w-48 md:w-64" }) {
  return (
    <div className={`relative ${size} flex flex-col items-center animate-float`}>
      {/* Just the pure, transparent sticker image */}
      <img 
        src={MyLogo} 
        alt="Nodexa" 
        className="w-full h-auto drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" 
      />
      
      {/* THE NEW TAGLINE */}
      <div className="mt-5 flex items-center justify-center gap-3 whitespace-nowrap">
          <div className="h-[1px] w-8 md:w-12 bg-gradient-to-r from-transparent to-[#00F0FF]" />
          <span className="text-[9px] md:text-[10px] font-black tracking-[0.3em] text-[#00F0FF] uppercase opacity-90">
              Unlock the NODEXA experience
          </span>
          <div className="h-[1px] w-8 md:w-12 bg-gradient-to-l from-transparent to-[#00F0FF]" />
      </div>
    </div>
  );
}