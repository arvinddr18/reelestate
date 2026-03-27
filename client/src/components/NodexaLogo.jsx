import React from 'react';
import { IoMdPulse } from 'react-icons/io';

export default function NodexaLogo({ size = "text-6xl" }) {
  return (
    <div className={`flex flex-col items-center justify-center font-black italic tracking-tighter ${size} select-none group`}>
      <div className="relative">
        <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent drop-shadow-2xl">
          NODEXA
        </span>
        {/* Holographic underline */}
        <div className="absolute -bottom-2 left-0 w-0 h-[3px] bg-gradient-to-r from-[#0057FF] to-[#00F0FF] transition-all duration-700 group-hover:w-full shadow-[0_0_15px_rgba(0,240,255,0.8)]" />
      </div>
      <div className="flex items-center gap-2 mt-2">
         <span className="text-[10px] uppercase tracking-[0.5em] text-[#00F0FF] font-black animate-pulse">
           OMNI ECOSYSTEM
         </span>
         <IoMdPulse className="text-[#00F0FF] text-xs" />
      </div>
    </div>
  );
}