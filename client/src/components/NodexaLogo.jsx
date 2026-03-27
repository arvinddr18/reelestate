import React from 'react';
// This grabs your newly renamed image from the assets folder!
import MyLogo from '../assets/nodexa-logo.png'; 

export default function NodexaLogo({ size = "w-64" }) {
  return (
    <div className={`relative ${size} flex flex-col items-center group animate-float`}>
      {/* 1. The glowing aura behind the logo */}
      <div className="absolute inset-0 bg-[#00F0FF] opacity-20 blur-[60px] rounded-full group-hover:opacity-40 transition-opacity duration-700" />
      
      {/* 2. Your actual image file */}
      <div className="relative z-10 select-none cursor-default flex flex-col items-center">
        <img 
          src={MyLogo} 
          alt="Nodexa" 
          className="w-full h-auto drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] mix-blend-screen" 
        />
        
        {/* Optional: OMNI Subtext below the image */}
        <div className="mt-2 flex items-center justify-center gap-2">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#00F0FF]" />
            <span className="text-[9px] font-black tracking-[0.6em] text-[#00F0FF] uppercase opacity-80">
                OMNI ECOSYSTEM
            </span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#00F0FF]" />
        </div>
      </div>
      
      {/* 3. Reflection effect at the bottom */}
      <div className="absolute -bottom-4 w-full h-8 bg-gradient-to-t from-[#00F0FF]/20 to-transparent blur-md opacity-30 skew-x-12" />
    </div>
  );
}