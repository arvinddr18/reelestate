import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- Premium SVG Icons ---
const HomeIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const SearchIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const MessageIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const BookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  // Desktop Nav Styling
  const navLinkClassDesktop = ({ isActive }) =>
    `relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group overflow-hidden
     ${isActive 
       ? 'bg-gradient-to-r from-[#0057FF]/20 to-[#00F0FF]/10 border border-[#00F0FF]/30 text-white font-black shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
       : 'text-gray-400 hover:text-white hover:bg-[#1E2532] hover:translate-x-2'}`;

  // Mobile Bottom Nav Styling
  const navLinkClassMobile = ({ isActive }) =>
    `flex flex-col items-center justify-center w-full h-full transition-all duration-300
     ${isActive ? 'text-[#00F0FF] scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'text-gray-500 hover:text-white'}`;

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#0B0F19]">
      
      {/* ── 💻 DESKTOP SIDEBAR (FLOATING CYBER PANEL) ── */}
      <aside className="hidden md:flex flex-col w-[280px] h-[calc(100vh-40px)] my-5 ml-5 rounded-[40px] border border-[#1E2532]/80 bg-gradient-to-b from-[#151A25]/90 to-[#0B0F19]/95 backdrop-blur-3xl py-8 px-4 z-50 shadow-[10px_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group transition-all duration-500 hover:border-[#00F0FF]/20 hover:shadow-[0_0_30px_rgba(0,240,255,0.05)]">
        
        {/* ⚡ Subtle Cyber Glowing Accents ⚡ */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF]/60 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-[#0057FF]/60 to-transparent" />
        <div className="absolute -left-10 top-1/4 w-20 h-40 bg-[#00F0FF]/5 blur-[50px] rounded-full pointer-events-none" />
        
        

        {/* Desktop Navigation Links */}
        <nav className="flex-1 space-y-2">
          <NavLink to="/" end className={navLinkClassDesktop}>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#00F0FF] rounded-r-full shadow-[0_0_10px_#00F0FF]" />}
                <span className={`transition-all ${isActive ? 'text-[#00F0FF]' : 'opacity-70 group-hover:opacity-100'}`}><HomeIcon filled={isActive} /></span>
                <span className="tracking-widest text-[13px] flex-1">Feed</span>
              </>
            )}
          </NavLink>

          <NavLink to="/search" className={navLinkClassDesktop}>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#00F0FF] rounded-r-full shadow-[0_0_10px_#00F0FF]" />}
                <span className={`transition-all ${isActive ? 'text-[#00F0FF]' : 'opacity-70 group-hover:opacity-100'}`}><SearchIcon filled={isActive} /></span>
                <span className="tracking-widest text-[13px] flex-1">Search</span>
              </>
            )}
          </NavLink>

          <NavLink to="/messages" className={navLinkClassDesktop}>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#00F0FF] rounded-r-full shadow-[0_0_10px_#00F0FF]" />}
                <div className="relative">
                  <span className={`transition-all ${isActive ? 'text-[#00F0FF]' : 'opacity-70 group-hover:opacity-100'}`}><MessageIcon filled={isActive} /></span>
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00F0FF] border border-[#0B0F19]"></span>
                  </span>
                </div>
                <span className="tracking-widest text-[13px] flex-1">Messages</span>
              </>
            )}
          </NavLink>

          <NavLink to="/saved" className={navLinkClassDesktop}>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#00F0FF] rounded-r-full shadow-[0_0_10px_#00F0FF]" />}
                <span className={`transition-all ${isActive ? 'text-[#00F0FF]' : 'opacity-70 group-hover:opacity-100'}`}><BookmarkIcon filled={isActive} /></span>
                <span className="tracking-widest text-[13px] flex-1">Saved</span>
              </>
            )}
          </NavLink>

          {/* Desktop Create Button */}
          <NavLink to="/create" className="mt-8 relative flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#0057FF] to-[#00F0FF] text-white font-black shadow-[0_4px_20px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all">
            <PlusIcon />
            <span className="tracking-widest text-[13px] uppercase">Post Property</span>
          </NavLink>
        </nav>

        {/* ── DESKTOP PROFILE & LOGOUT BOTTOM ── */}
        <div className="mt-auto pt-4 border-t border-[#1E2532] flex flex-col gap-2">
          
          {/* ✨ Re-added Profile Plate ✨ */}
          <NavLink to={`/profile/${user?._id}`} className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-[#151A25] border border-[#2A3441] shadow-inner' : 'hover:bg-[#151A25] border border-transparent hover:border-[#1E2532]'}`}>
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2)] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center text-white font-bold overflow-hidden border-2 border-[#0B0F19]">
                {user?.profilePhoto || user?.avatar ? (
                  <img src={user.profilePhoto || user.avatar} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  user?.username?.[0]?.toUpperCase()
                )}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white font-bold text-sm truncate">@{user?.username}</p>
              <p className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest mt-0.5">View Profile</p>
            </div>
          </NavLink>

          {/* Logout Button */}
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 text-gray-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/10 transition-all">
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 relative h-full flex flex-col overflow-hidden bg-[#0B0F19] pb-[70px] md:pb-0">
        <div className="flex-1 h-full w-full overflow-y-auto no-scrollbar">
          <Outlet />
        </div>
      </main>

  {/* ── 📱 MOBILE BOTTOM NAVIGATION BAR (HALF-EGG DOME) ── */}
      <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] h-[70px] bg-[#0B0F19]/90 backdrop-blur-xl border-t border-x border-[#1E2532] rounded-t-[80px] z-[100] flex items-center justify-around px-4 pb-safe">
        
        {/* ⚡ Glowing Peak of the Egg ⚡ */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF]/80 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-12 bg-[#00F0FF]/15 blur-[20px] rounded-full pointer-events-none" />
        
        {/* ── Nav Links ── */}
        <NavLink to="/" end className={navLinkClassMobile}>
          {({ isActive }) => <HomeIcon filled={isActive} />}
        </NavLink>

        <NavLink to="/search" className={navLinkClassMobile}>
          {({ isActive }) => <SearchIcon filled={isActive} />}
        </NavLink>

        {/* ── Center Create Button ── */}
        <NavLink to="/create" className="relative -top-3 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] p-[2px] shadow-[0_4px_20px_rgba(0,240,255,0.4)] active:scale-95 transition-transform">
            <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center text-white">
              <PlusIcon />
            </div>
          </div>
        </NavLink>

        <NavLink to="/messages" className={navLinkClassMobile}>
          {({ isActive }) => (
            <div className="relative">
              <MessageIcon filled={isActive} />
              <span className="absolute 0 right-0 w-2 h-2 bg-[#00F0FF] border-2 border-[#0B0F19] rounded-full shadow-[0_0_5px_#00F0FF]" />
            </div>
          )}
        </NavLink>

        <NavLink to={`/profile/${user?._id}`} className={navLinkClassMobile}>
          {({ isActive }) => (
            <div className={`w-7 h-7 rounded-full p-[2px] transition-all ${isActive ? 'bg-gradient-to-tr from-[#0057FF] to-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'bg-[#1E2532]'}`}>
               <div className="w-full h-full rounded-full bg-[#151A25] border border-[#0B0F19] flex items-center justify-center font-black text-white text-[10px] overflow-hidden">
                 {user?.profilePhoto || user?.avatar ? (
                    <img src={user.profilePhoto || user.avatar} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    user?.username?.[0]?.toUpperCase()
                  )}
               </div>
            </div>
          )}
        </NavLink>

      </nav>

    </div>
  );
}