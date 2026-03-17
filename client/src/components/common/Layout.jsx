import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- SVG Icons (Keep these at the top) ---
const HomeIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? 'white' : 'none'} stroke="currentColor" strokeWidth={2}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const MessageIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Swipe logic
  let touchStart = 0;
  let touchEnd = 0;
  const handleTouchStart = (e) => { touchStart = e.targetTouches[0].clientX; };
  const handleTouchMove = (e) => { touchEnd = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (touchStart - touchEnd < -70 && touchStart < 50) setIsMenuOpen(true);
    if (touchStart - touchEnd > 70) setIsMenuOpen(false);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group overflow-hidden
     ${isActive 
       ? 'bg-gradient-to-r from-brand-500/10 to-transparent border border-brand-500/20 text-white font-black shadow-lg' 
       : 'text-brand-100 hover:text-white hover:bg-white/5 hover:translate-x-2'}`;

  return (
    <div 
      className="relative flex h-screen w-screen overflow-hidden bg-brand-950"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sidebar */}
      {/* ── 📱 FLOATING GLASS SIDEBAR ── */}
      <aside className={`fixed md:relative left-0 top-0 h-full w-[280px] border-r border-white/5 flex flex-col py-8 px-4 z-50 bg-brand-950/80 backdrop-blur-3xl transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.8)]' : '-translate-x-full md:translate-x-0'}`}>
        
       {/* Mobile Header (Hidden on Desktop since logo is in CategoryBar now) */}
        <div className="mb-10 px-4 flex items-center justify-between md:hidden">
          {/* ✨ CUSTOM CODED TEXT LOGO ✨ */}
          <h1 className="text-2xl font-black tracking-tighter leading-none drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">
            <span className="text-white">NODE</span>
            <span className="bg-gradient-to-r from-brand-500 to-yellow-400 bg-clip-text text-transparent">XA</span>
          </h1>
          <button onClick={() => setIsMenuOpen(false)} className="text-white p-2 hover:text-brand-500 transition-colors">✕</button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 mt-2">
          
          <NavLink to="/" end className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-500 rounded-r-full shadow-[0_0_15px_#f97316]" />}
                <span className={`transition-all ${isActive ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] text-brand-500' : 'opacity-50 group-hover:opacity-100'}`}><HomeIcon filled={isActive} /></span>
                <span className="tracking-widest text-sm flex-1">Feed</span>
              </>
            )}
          </NavLink>

          <NavLink to="/search" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-500 rounded-r-full shadow-[0_0_15px_#f97316]" />}
                <span className={`transition-all ${isActive ? 'text-brand-500' : 'opacity-50 group-hover:opacity-100'}`}><SearchIcon /></span>
                <span className="tracking-widest text-sm flex-1">Search</span>
              </>
            )}
          </NavLink>

          <NavLink to="/create" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-500 rounded-r-full shadow-[0_0_15px_#f97316]" />}
                <span className={`transition-all ${isActive ? 'text-brand-500' : 'opacity-70 group-hover:opacity-100 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]'}`}><PlusIcon /></span>
                <span className={`${isActive ? '' : 'bg-gradient-to-r from-brand-400 to-pink-500 bg-clip-text text-transparent'} tracking-widest text-sm flex-1`}>Create Post</span>
              </>
            )}
          </NavLink>

          <NavLink to="/messages" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-500 rounded-r-full shadow-[0_0_15px_#f97316]" />}
                <div className="relative">
                  <span className={`transition-all ${isActive ? 'text-brand-500' : 'opacity-50 group-hover:opacity-100'}`}><MessageIcon /></span>
                  {/* Live Ping Dot */}
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-brand-950"></span>
                  </span>
                </div>
                <span className="tracking-widest text-sm flex-1">Messages</span>
                {/* Notification Badge */}
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-[9px] font-black">3 NEW</span>
              </>
            )}
          </NavLink>

          <NavLink to="/saved" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-500 rounded-r-full shadow-[0_0_15px_#f97316]" />}
                <span className={`transition-all ${isActive ? 'text-brand-500' : 'opacity-50 group-hover:opacity-100'}`}><BookmarkIcon /></span>
                <span className="tracking-widest text-sm flex-1">Saved</span>
              </>
            )}
          </NavLink>

        </nav>

        {/* ── BOTTOM USER PROFILE PLATE ── */}
        <div className="mt-auto pt-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl flex flex-col gap-3 group transition-colors">
            
            <NavLink to={`/profile/${user?._id}`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-brand-500 to-purple-600 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <div className="w-full h-full rounded-full bg-brand-900 border-2 border-brand-950 flex items-center justify-center font-bold text-white">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-white font-bold text-xs truncate">@{user?.username}</span>
                <span className="text-brand-500 text-[9px] font-black uppercase tracking-widest truncate">{user?.role || 'Digital OS'}</span>
              </div>
            </NavLink>

            <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-2.5 text-brand-100/60 hover:text-red-400 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
              <span className="w-4 h-4 flex items-center justify-center"><LogoutIcon /></span>
              Logout
            </button>
            
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative h-full flex flex-col overflow-hidden">
        <div className="flex-1 h-full w-full overflow-hidden bg-brand-950">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden" onClick={() => setIsMenuOpen(false)} />
      )}
    </div>
  );
}