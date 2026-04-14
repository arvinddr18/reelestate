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


   // Check for existing user (ONLY BY USERNAME NOW)
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Initialization failed. Handle (@username) is already taken.' });
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
  // Find user by USERNAME (even though the frontend variable is called 'email')
    const user = await User.findOne({ username: email }).select('+password');
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

/**
 * GET /api/auth/linked-accounts
 * Finds all accounts sharing the same email as the logged-in user and issues tokens for them.
 */
const getLinkedAccounts = async (req, res) => {
  try {
    // 1. Find the current user to get their email
    const currentUser = await User.findById(req.user.id); // Assuming req.user comes from your protect middleware
    if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

    // 2. Find ALL users that share this exact same email
    const siblingAccounts = await User.find({ email: currentUser.email });

    // 3. Create a ready-to-use vault array with fresh tokens for all of them
    const syncedVault = siblingAccounts.map(user => ({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profilePhoto: user.profilePhoto,
      }
    }));

    res.json({ success: true, data: syncedVault });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🚨 Make sure you add getLinkedAccounts to your exports at the bottom!
module.exports = { register, login, getMe, getLinkedAccounts };
