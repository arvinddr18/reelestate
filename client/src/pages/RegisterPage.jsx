/**
 * pages/RegisterPage.jsx
 * Registration form with role selection (buyer/seller).
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', role: 'buyer' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.data);
      toast.success('Account created! Welcome to ReelEstate 🏠');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold"><span className="text-orange-500">Reel</span>Estate</h1>
          <p className="text-zinc-400 text-sm mt-2">Join thousands discovering properties through reels</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-5">Create Account</h2>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {['buyer', 'seller'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setForm(f => ({ ...f, role }))}
                className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all
                  ${form.role === role
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
              >
                {role === 'buyer' ? '🏡 Buyer' : '🏗️ Seller'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full name" className="input-field" />
            <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="input-field" required minLength={3} />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="input-field" required />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password (6+ chars)" className="input-field" required minLength={6} />

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating account...' : `Join as ${form.role === 'buyer' ? 'Buyer' : 'Seller'}`}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
