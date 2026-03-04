/**
 * controllers/adminController.js
 * Admin-only operations: view/manage users and posts.
 */

const User = require('../models/User');
const Post = require('../models/Post');

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const search = req.query.search;

    const filter = search
      ? { $or: [{ username: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, data: users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deactivate or delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin.' });

    // Soft delete — deactivate rather than removing
    user.isActive = false;
    await user.save();

    res.json({ success: true, message: 'User deactivated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all posts for admin review
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;

    const [posts, total] = await Promise.all([
      Post.find()
        .populate('author', 'username email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Post.countDocuments(),
    ]);

    res.json({ success: true, data: posts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin delete/hide a post
const removePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, message: 'Post removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalPosts, activePosts, buyers, sellers] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller' }),
    ]);

    res.json({ success: true, data: { totalUsers, totalPosts, activePosts, buyers, sellers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, getAllPosts, removePost, getStats };
