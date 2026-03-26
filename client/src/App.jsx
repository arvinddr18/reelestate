/**
 * App.jsx — Root component
 * Sets up React Router, Auth context, and all application routes.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import PostDetailPage from './pages/PostDetailPage';
import SavedPage from './pages/SavedPage';

// ─── NEW 2045 MESSAGING COMPONENTS ───
import Messages from './pages/Messages'; // The Holographic Hub (Inbox)
import ChatRoom from './pages/ChatRoom'; // The Individual Floating Chat

// Layout
import Layout from './components/common/Layout';

// Protected route wrapper — redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  // Change from bg-black to bg-brand-950
if (loading) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

// Admin route wrapper
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

// Public route — redirect to feed if already logged in
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected routes with sidebar layout */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<FeedPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="create" element={<CreatePostPage />} />
        
        {/* ─── SPLIT MESSAGING ROUTES ─── */}
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:userId" element={<ChatRoom />} />
        
        <Route path="saved" element={<SavedPage />} />
        <Route path="profile/:userId?" element={<ProfilePage />} />
        <Route path="post/:postId" element={<PostDetailPage />} />
        <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        {/* Toast notifications (Updated to match 2045 Cyberpunk Theme) */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#151A25', color: '#fff', border: '1px solid #1E2532' },
            success: { iconTheme: { primary: '#00F0FF', secondary: '#151A25' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}