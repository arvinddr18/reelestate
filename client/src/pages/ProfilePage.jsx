import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/profile/${userId}`),
          api.get(`/posts/user/${userId}`)
        ]);
        setProfile(profileRes.data);
        setUserPosts(postsRes.data);
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [userId]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-brand-950">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-950 text-white overflow-y-auto no-scrollbar pb-20">
      {/* Header / Cover Area */}
      <div className="h-48 bg-gradient-to-b from-brand-500/20 to-brand-950 border-b border-white/5" />

      <div className="max-w-4xl mx-auto px-6 -mt-20">
        {/* Profile Info Card */}
        <div className="bg-brand-900/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-brand-500 border-4 border-brand-950 overflow-hidden shadow-2xl flex items-center justify-center text-4xl font-black">
                {profile?.profilePhoto ? (
                  <img src={profile.profilePhoto} className="w-full h-full object-cover" alt="" />
                ) : profile?.username?.[0].toUpperCase()}
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 border-4 border-brand-950 rounded-full shadow-lg" />
            </div>

            {/* Stats & Actions */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black tracking-tighter">@{profile?.username}</h1>
              <p className="text-brand-100 font-medium opacity-60 mt-1 uppercase tracking-widest text-xs">
                {profile?.role || 'Member'} • {profile?.district || 'Location Private'}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                <div className="text-center">
                  <p className="text-xl font-black">{userPosts.length}</p>
                  <p className="text-[10px] text-brand-100 uppercase font-bold opacity-40">Listings</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black">{profile?.followersCount || 0}</p>
                  <p className="text-[10px] text-brand-100 uppercase font-bold opacity-40">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black">{profile?.followingCount || 0}</p>
                  <p className="text-[10px] text-brand-100 uppercase font-bold opacity-40">Following</p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button className="flex-1 md:flex-none bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-brand-500/20">
                  Edit Profile
                </button>
                <button className="p-3 bg-brand-200/50 rounded-2xl border border-white/5 hover:bg-brand-200/80 transition-all">
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black tracking-tight">Active Listings</h2>
            <div className="h-[2px] flex-1 bg-white/5 mx-6" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userPosts.map(post => (
              <Link to={`/post/${post._id}`} key={post._id} className="group relative aspect-square rounded-3xl overflow-hidden border border-white/5">
                <img 
                  src={post.images?.[0] || 'https://via.placeholder.com/400'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-xs font-bold text-white">₹{post.price}</p>
                </div>
              </Link>
            ))}
          </div>

          {userPosts.length === 0 && (
            <div className="text-center py-20 bg-brand-200/20 rounded-[32px] border border-dashed border-white/10">
              <p className="text-brand-100 opacity-40 font-bold uppercase tracking-widest text-xs">No properties posted yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}