/**
 * components/common/Layout.jsx
 * Main app shell with Instagram-style left sidebar nav and content area.
 */

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// SVG icon components (inline to avoid icon library dependency)
const HomeIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? 'white' : 'none'} stroke="currentColor" strokeWidth={2}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
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
const AdminIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
     ${isActive ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`;

  return (
    <div className="flex min-h-screen bg-black">
      {/* ── Left Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-zinc-800 flex flex-col py-6 px-4 z-40 bg-black hidden md:flex">
        {/* Logo */}
        <div className="mb-8 px-3">
          <span className="text-2xl font-bold">
            <span className="text-orange-500">Reel</span>Estate
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1">
          <NavLink to="/" end className={navLinkClass}>
            {({ isActive }) => <><HomeIcon filled={isActive} /><span>Feed</span></>}
          </NavLink>
          <NavLink to="/search" className={navLinkClass}>
            <SearchIcon /><span>Search</span>
          </NavLink>
          <NavLink to="/create" className={navLinkClass}>
            <PlusIcon /><span>Create Post</span>
          </NavLink>
          <NavLink to="/messages" className={navLinkClass}>
            <MessageIcon /><span>Messages</span>
          </NavLink>
          <NavLink to="/saved" className={navLinkClass}>
            <BookmarkIcon /><span>Saved</span>
          </NavLink>
          <NavLink to={`/profile/${user?._id}`} className={navLinkClass}>
            <UserIcon /><span>Profile</span>
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              <AdminIcon /><span>Admin</span>
            </NavLink>
          )}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-zinc-800 pt-4 mt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">@{user?.username}</p>
              <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-zinc-400 hover:text-red-400 transition-colors text-sm rounded-lg hover:bg-zinc-900">
            <LogoutIcon /> Logout
          </button>
        </div>
      </aside>

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-around py-3 z-40 md:hidden">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'text-white' : 'text-zinc-500'}>
          <HomeIcon />
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? 'text-white' : 'text-zinc-500'}>
          <SearchIcon />
        </NavLink>
        <NavLink to="/create" className={({ isActive }) => isActive ? 'text-orange-500' : 'text-zinc-500'}>
          <PlusIcon />
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => isActive ? 'text-white' : 'text-zinc-500'}>
          <MessageIcon />
        </NavLink>
        <NavLink to={`/profile/${user?._id}`} className={({ isActive }) => isActive ? 'text-white' : 'text-zinc-500'}>
          <UserIcon />
        </NavLink>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
