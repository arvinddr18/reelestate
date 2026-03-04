/**
 * context/AuthContext.jsx
 * Global authentication state using React Context API.
 * Provides: user, login, logout, updateUser functions.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // On mount: check if a valid token exists in localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('reelestate_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const { data } = await api.get('/auth/me');
          if (data.success) {
            setUser(data.data);
            socketService.connect(data.data._id); // Connect socket on app load
          }
        } catch {
          // Token invalid/expired — clear it
          localStorage.removeItem('reelestate_token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Login: store token, set user, connect socket
  const login = useCallback((userData) => {
    const { token, ...userInfo } = userData;
    localStorage.setItem('reelestate_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userInfo);
    socketService.connect(userInfo._id);
  }, []);

  // Logout: clear everything
  const logout = useCallback(() => {
    localStorage.removeItem('reelestate_token');
    delete api.defaults.headers.common['Authorization'];
    socketService.disconnect();
    setUser(null);
  }, []);

  // Update user data (e.g. after profile edit)
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming auth context
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
