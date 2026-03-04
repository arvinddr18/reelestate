/**
 * pages/LoginPage.jsx
 * Auth page — login form with brand styling.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.success) {
        login(data.data);
        toast.success(`Welcome back, @${data.data.username}!`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-400 items-center justify-center p-12">
        <div className="text-white text-center">
          <h1 className="text-5xl font-bold mb-4">ReelEstate</h1>
          <p className="text-xl opacity-90">Discover your dream property through stunning reels.</p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left max-w-sm mx-auto">
            {['🏠 Browse property reels', '❤️ Like & save listings', '💬 Chat with sellers', '🔍 Filter by location'].map(f => (
              <div key={f} className="bg-white/20 backdrop-blur rounded-xl p-3 text-sm font-medium">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-md mx-auto lg:max-w-none lg:w-auto lg:flex-none lg:w-96">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-3xl font-bold">
              <span className="text-orange-500">Reel</span>Estate
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Sign in</h2>
          <p className="text-zinc-400 text-sm mb-8">Welcome back! Enter your credentials.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-zinc-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
