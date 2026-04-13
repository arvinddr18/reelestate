/**
 * controllers/userController.js
 * User profile, follow/unfollow, update profile.
 */

const User = require('../models/User');
const Post = require('../models/Post');
const { Follow } = require('../models/index');
const { deleteFromCloudinary } = require('../middleware/upload');

const cloudinary = require('cloudinary').v2;

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

//update profile//

const updateProfile = async (req, res) => {
  try {
    // Note: Use req.user._id or req.user.id depending on how your auth middleware sets it
    const userId = req.user._id || req.user.id; 
    
    // We get the data from the frontend (including the giant Base64 photo string)
    const { name, username, bio, website, profilePhoto } = req.body;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 🚨 1. Handle the Image Upload to Cloudinary
    // We check if it starts with 'data:image' to ensure it's a NEW Base64 photo
    if (profilePhoto && profilePhoto.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(profilePhoto, {
        folder: 'nodexa_avatars', // Puts it in a neat folder in your Cloudinary
      });
      
      // Save the secure URL to the user
      user.profilePhoto = uploadResponse.secure_url;
      user.avatar = uploadResponse.secure_url; // Updating both just in case your UI uses 'avatar'
    }

    // 🚨 2. Update the rest of the text fields
    if (name) user.fullName = name; 
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;

    // 3. Save to database
    await user.save();

    // 4. Send success back to the frontend
    return res.status(200).json({ 
      success: true, 
      user, 
      message: 'Node synchronized successfully.' 
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: 'Server error during synchronization.' });
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
