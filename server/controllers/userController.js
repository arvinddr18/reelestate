/**
 * controllers/userController.js
 * User profile, follow/unfollow, update profile.
 */

const User = require('../models/User');
const Post = require('../models/Post');
const { Follow } = require('../models/index');
const { deleteFromCloudinary } = require('../middleware/upload');

// ─── Get User Profile ─────────────────────────────────────────────────────────
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Get user's posts
    const posts = await Post.find({ author: req.params.id, isActive: true })
      .sort({ createdAt: -1 })
      .limit(20);

    // Check if requesting user follows this profile
    let isFollowing = false;
    if (req.user) {
      const followRecord = await Follow.findOne({ follower: req.user._id, following: req.params.id });
      isFollowing = !!followRecord;
    }

    res.json({ success: true, data: { user, posts, isFollowing } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
// --- Update Profile ---
const updateProfile = async (req, res) => {
  try {
    // 1. Grab everything from req.body (including our Base64 profilePhoto string)
    const { fullName, bio, location, phone, website, profilePhoto } = req.body;
    
    const updates = { fullName, bio, location, phone, website };

    // 2. If a new photo was sent from the frontend, add it to the updates
    if (profilePhoto) {
      updates.profilePhoto = profilePhoto;
      updates.avatar = profilePhoto; // Just in case your DB uses 'avatar' instead
    }

    // 3. Update the user in the database
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: user });

  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ─── Toggle Follow ────────────────────────────────────────────────────────────
const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't follow yourself." });
    }

    const existing = await Follow.findOne({ follower: req.user._id, following: targetUserId });

    if (existing) {
      // Unfollow
      await existing.deleteOne();
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });
      return res.json({ success: true, following: false });
    }

    // Follow
    await Follow.create({ follower: req.user._id, following: targetUserId });
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });
    res.json({ success: true, following: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Followers / Following ────────────────────────────────────────────────
const getFollowers = async (req, res) => {
  try {
    const follows = await Follow.find({ following: req.params.id })
      .populate('follower', 'username profilePhoto fullName isVerified');
    res.json({ success: true, data: follows.map(f => f.follower) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFollowing = async (req, res) => {
  try {
    const follows = await Follow.find({ follower: req.params.id })
      .populate('following', 'username profilePhoto fullName isVerified');
    res.json({ success: true, data: follows.map(f => f.following) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Search Users ─────────────────────────────────────────────────────────────
// --- Search Users ---
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const users = await User.find({
      $or: [
        { username: new RegExp(q, 'i') },
        { fullName: new RegExp(q, 'i') },
      ]
      // We removed 'isActive: true' from here so it stops hiding your friends!
    })
    .select('username fullName profilePhoto isVerified role')
    .limit(20);

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Get All Users (For Inbox Sidebar) ---
// --- Get All Users (For Inbox Sidebar) ---
const getAllUsers = async (req, res) => {
  try {
    // We removed 'isActive: true' so it grabs EVERY registered user
    const users = await User.find({}).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getUserProfile, updateProfile, toggleFollow, 
  getFollowers, getFollowing, searchUsers, getAllUsers 
};
