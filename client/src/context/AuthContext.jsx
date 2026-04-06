import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if a valid VIP token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nodexa_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const { data } = await api.get('/auth/me');
          if (data.success) {
            setUser(data.data);
            socketService.connect(data.data._id);
          }
        } catch {
          // Token is dead - clear it out
          localStorage.removeItem('nodexa_token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // ─── UPGRADED LOGIN ROUTE ───
  const login = async (email, password) => {
    try {
      // 1. Send credentials to backend
      const response = await api.post('/auth/login', { email, password });
      
      // Handle the data structure (whether wrapped in 'data' or not)
      const userData = response.data.data || response.data;
      const { token, ...userInfo } = userData;

      if (token) {
        // 2. Lock in the secure token
        localStorage.setItem('nodexa_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userInfo);
        if (userInfo._id) socketService.connect(userInfo._id);
        return true; // Success! Let them in.
      }
      return false;
    } catch (error) {
      console.error("Login Error:", error.response?.data?.message || error.message);
      return false; // Tells UI to show error
    }
  };

  // ─── NEW REGISTER ROUTE ───
  const register = async (formData) => {
    try {
      // 1. Send new operator data to backend
      const response = await api.post('/auth/register', formData);
      
      const userData = response.data.data || response.data;
      const { token, ...userInfo } = userData;

      if (token) {
        // 2. Lock in the secure token
        localStorage.setItem('nodexa_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userInfo);
        if (userInfo._id) socketService.connect(userInfo._id);
        return true; // Success! Let them in.
      }
      return false;
    } catch (error) {
      console.error("Registration Error:", error.response?.data?.message || error.message);
      return false; // Tells UI to show error
    }
  };

  // Logout: clear everything
  const logout = useCallback(() => {
    localStorage.removeItem('nodexa_token');
    delete api.defaults.headers.common['Authorization'];
    socketService.disconnect();
    setUser(null);
  }, []);

  // Update user data (e.g. after profile edit)
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
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