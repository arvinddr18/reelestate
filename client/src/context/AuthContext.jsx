import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if a valid VIP token exists
// On mount: check if a valid VIP token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nodexa_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // 1. Get the current user
          const { data } = await api.get('/auth/me');
          if (data.success) {
            setUser(data.data);
            socketService.connect(data.data._id);

            // ─── 🚨 2. CLOUD SYNC THE MULTI-ACCOUNT VAULT ───
            try {
              const syncRes = await api.get('/auth/linked-accounts');
              if (syncRes.data.success) {
                // Instantly update the local browser memory with the cloud memory!
                localStorage.setItem('nodexa_saved_accounts', JSON.stringify(syncRes.data.data));
              }
            } catch (syncErr) {
              console.error("Cloud sync failed, using local vault only.", syncErr);
            }
            // ────────────────────────────────────────────────
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

// —— UPGRADED LOGIN ROUTE ——
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

        // ─── 🚨 3. MULTI-ACCOUNT VAULT LOGIC ───
        const existingAccounts = JSON.parse(localStorage.getItem('nodexa_saved_accounts')) || [];
        const accountExists = existingAccounts.some(acc => String(acc.user._id) === String(userInfo._id));

        if (!accountExists) {
          existingAccounts.push({
            token: token,
            user: userInfo
          });
          localStorage.setItem('nodexa_saved_accounts', JSON.stringify(existingAccounts));
        }
        // ────────────────────────────────────────

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

        // ─── 🚨 SAVE TO MULTI-ACCOUNT VAULT DURING REGISTRATION ───
        const existingAccounts = JSON.parse(localStorage.getItem('nodexa_saved_accounts')) || [];
        const accountExists = existingAccounts.some(acc => String(acc.user._id) === String(userInfo._id));

        if (!accountExists) {
          existingAccounts.push({
            token: token,
            user: userInfo
          });
          localStorage.setItem('nodexa_saved_accounts', JSON.stringify(existingAccounts));
        }
        // ─────────────────────────────────────────────────────────

        return true; // Success! Let them in.
      }
      return false;
    } catch (error) {
      console.error("Registration Error:", error.response?.data?.message || error.message);
      return false; // Tells UI to show error
    }
  };

 // 👇 🚨 INDESTRUCTIBLE ONLINE PRESENCE 👇
  useEffect(() => {
    if (user && socketService.socket) {
      const userId = user._id || user.id;

      const announceOnline = () => {
        socketService.socket.emit('iam_online', userId);
      };

      // 1. If socket is already connected, tell server immediately
      if (socketService.socket.connected) {
        announceOnline();
      } 
      
      // 2. If socket connects (or reconnects after dropping), tell server!
      socketService.socket.on('connect', announceOnline);

      // Cleanup listener when they log out
      return () => {
        socketService.socket.off('connect', announceOnline);
      };
    }
  }, [user]);
  // 👆 🚨 ────────────────────────────── 👆

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