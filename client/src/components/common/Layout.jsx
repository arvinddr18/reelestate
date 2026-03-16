import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ... (Keep your SVG icon components exactly as they are) ...

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for mobile menu

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Updated class for Midnight Theme
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 group
     ${isActive ? 'bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/20' : 'text-brand-100 hover:text-white hover:bg-brand-200/50'}`;

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-brand-950">
      
      {/* ── Hidden Sidebar (Mobile Drawer + Desktop Sidebar) ── */}
      <aside className={`fixed md:relative left-0 top-0 h-full w-72 border-r border-white/5 flex flex-col py-8 px-5 z-50 bg-brand-900 transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Logo */}
        <div className="mb-10 px-3 flex items-center justify-between">
          <span className="text-2xl font-black italic tracking-tighter">
            <span className="text-brand-500">REEL</span>ESTATE
          </span>
          {/* Close button for mobile */}
          <button onClick={() => setIsMenuOpen(false)} className="md:hidden text-white">✕</button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-2">
          <NavLink to="/" end className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            {({ isActive }) => <><HomeIcon filled={isActive} /><span>Feed</span></>}
          </NavLink>
          <NavLink to="/search" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            <SearchIcon /><span>Search</span>
          </NavLink>
          <NavLink to="/create" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            <PlusIcon /><span>Create Post</span>
          </NavLink>
          <NavLink to="/messages" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            <MessageIcon /><span>Messages</span>
          </NavLink>
          <NavLink to="/saved" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            <BookmarkIcon /><span>Saved</span>
          </NavLink>
          <NavLink to={`/profile/${user?._id}`} className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
            <UserIcon /><span>Profile</span>
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
              <AdminIcon /><span>Admin</span>
            </NavLink>
          )}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-white/5 pt-6 mt-4">
          <div className="flex items-center gap-3 px-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center font-bold shadow-lg">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">@{user?.username}</p>
              <p className="text-[10px] text-brand-100 uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-3 text-brand-100 hover:text-red-400 transition-all text-sm rounded-xl hover:bg-red-500/10">
            <LogoutIcon /> Logout
          </button>
        </div>
      </aside>

      {/* ── Dark Overlay when menu is open on mobile ── */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* ── Main Content Area ── */}
      <main className="flex-1 relative h-full flex flex-col overflow-hidden">
        {/* Floating Menu Toggle (Instagram-style subtle icon) */}
        <button 
          onClick={() => setIsMenuOpen(true)} 
          className="md:hidden fixed top-6 left-6 z-[40] p-2 bg-brand-900/40 backdrop-blur-md rounded-full border border-white/10 text-white active:scale-90 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* This is the Actual FeedPage. It will now fill exactly the screen */}
        <div className="flex-1 h-full w-full overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}