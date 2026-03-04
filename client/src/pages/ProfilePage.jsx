/**
 * pages/ProfilePage.jsx
 * User profile with photo, bio, posts grid, and follow button.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatPrice = (price) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${userId}`);
        setProfile(data.data.user);
        setPosts(data.data.posts);
        setIsFollowing(data.data.isFollowing);
        setEditForm({
          fullName: data.data.user.fullName || '',
          bio: data.data.user.bio || '',
          location: data.data.user.location || '',
          phone: data.data.user.phone || '',
          website: data.data.user.website || '',
        });
      } catch {
        toast.error('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleFollow = async () => {
    try {
      const { data } = await api.post(`/users/${userId}/follow`);
      setIsFollowing(data.following);
      setProfile(p => ({
        ...p,
        followersCount: data.following ? p.followersCount + 1 : p.followersCount - 1,
      }));
    } catch {
      toast.error('Failed to follow.');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([k, v]) => formData.append(k, v));
      if (profilePhotoFile) formData.append('profilePhoto', profilePhotoFile);

      const { data } = await api.put('/users/profile/update', formData);
      setProfile(data.data);
      updateUser(data.data); // Update global auth state
      setEditMode(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return <div className="text-center py-24 text-zinc-500">User not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* ── Profile Header ── */}
      <div className="flex items-start gap-6 mb-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {profile.profilePhoto ? (
            <img src={profile.profilePhoto} alt="" className="w-24 h-24 rounded-full object-cover ring-2 ring-orange-500" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-3xl font-bold">
              {profile.username?.[0]?.toUpperCase()}
            </div>
          )}
          {isOwnProfile && editMode && (
            <label className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-1 cursor-pointer">
              <span className="text-xs">📷</span>
              <input type="file" accept="image/*" onChange={e => setProfilePhotoFile(e.target.files[0])} className="hidden" />
            </label>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold">@{profile.username}</h1>
            {profile.isVerified && <span className="text-orange-500 text-sm">✓ Verified</span>}
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full capitalize">{profile.role}</span>
          </div>

          {/* Stats */}
          <div className="flex gap-6 my-3">
            {[
              { label: 'Posts', value: profile.postsCount },
              { label: 'Followers', value: profile.followersCount },
              { label: 'Following', value: profile.followingCount },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-bold text-white">{stat.value}</div>
                <div className="text-xs text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {isOwnProfile ? (
              <button onClick={() => setEditMode(e => !e)} className="btn-outline text-sm px-5 py-2">
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  className={`text-sm px-5 py-2 rounded-lg font-semibold transition-colors ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <Link to={`/messages/${userId}`} className="btn-outline text-sm px-5 py-2 rounded-lg font-semibold">
                  Message
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bio/Edit form */}
      {editMode ? (
        <div className="bg-zinc-900 rounded-xl p-4 mb-6 space-y-3">
          <input value={editForm.fullName} onChange={e => setEditForm(f => ({...f, fullName: e.target.value}))} placeholder="Full name" className="input-field text-sm" />
          <textarea value={editForm.bio} onChange={e => setEditForm(f => ({...f, bio: e.target.value}))} placeholder="Bio" rows={2} className="input-field text-sm resize-none" />
          <input value={editForm.location} onChange={e => setEditForm(f => ({...f, location: e.target.value}))} placeholder="Location" className="input-field text-sm" />
          <input value={editForm.phone} onChange={e => setEditForm(f => ({...f, phone: e.target.value}))} placeholder="Phone" className="input-field text-sm" />
          <input value={editForm.website} onChange={e => setEditForm(f => ({...f, website: e.target.value}))} placeholder="Website" className="input-field text-sm" />
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary w-full py-2.5">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      ) : (
        <div className="mb-6">
          {profile.fullName && <p className="font-semibold text-sm">{profile.fullName}</p>}
          {profile.bio && <p className="text-zinc-300 text-sm mt-1">{profile.bio}</p>}
          {profile.location && <p className="text-zinc-500 text-xs mt-1">📍 {profile.location}</p>}
        </div>
      )}

      {/* ── Posts Grid ── */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          {isOwnProfile ? 'My Listings' : 'Listings'}
        </h2>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <p className="text-3xl mb-2">🏠</p>
            <p>No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map(post => (
              <Link key={post._id} to={`/post/${post._id}`} className="relative aspect-square overflow-hidden bg-zinc-900 group">
                {post.mediaType === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <span className="text-2xl">🎬</span>
                  </div>
                ) : (
                  <img src={post.images?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                )}
                {/* Price overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-xs font-bold text-orange-400">{formatPrice(post.price)}</p>
                  <p className="text-xs text-zinc-300 truncate">{post.title}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
