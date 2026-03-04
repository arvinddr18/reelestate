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
import MessagesPage from './pages/MessagesPage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import PostDetailPage from './pages/PostDetailPage';
import SavedPage from './pages/SavedPage';

// Layout
import Layout from './components/common/Layout';

// Protected route wrapper — redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
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
        <Route path="messages" element={<MessagesPage />} />
        <Route path="messages/:userId" element={<MessagesPage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="profile/:userId" element={<ProfilePage />} />
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
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1c1c1e', color: '#fff', border: '1px solid #333' },
            success: { iconTheme: { primary: '#f97316', secondary: '#000' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
