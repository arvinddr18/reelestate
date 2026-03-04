/**
 * controllers/authController.js
 * Handles user registration and login, returns JWT tokens.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token (expires in 30 days)
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper to build the user response object (no password)
const userResponse = (user, token) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  profilePhoto: user.profilePhoto,
  bio: user.bio,
  location: user.location,
  followersCount: user.followersCount,
  followingCount: user.followingCount,
  postsCount: user.postsCount,
  isVerified: user.isVerified,
  token,
});

/**
 * POST /api/auth/register
 * Body: { username, email, password, fullName, role }
 */
const register = async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email and password are required.' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(409).json({ success: false, message: `${field} is already taken.` });
    }

    // Only allow buyer/seller roles during registration (admin created separately)
    const allowedRoles = ['buyer', 'seller'];
    const userRole = allowedRoles.includes(role) ? role : 'buyer';

    const user = await User.create({ username, email, password, fullName, role: userRole });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, data: userResponse(user, token) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user and explicitly include password (select: false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    res.json({ success: true, data: userResponse(user, token) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/auth/me — Get currently logged-in user
 */
const getMe = async (req, res) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe };
