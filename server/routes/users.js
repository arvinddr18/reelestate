/**
 * routes/users.js - Profile and social routes
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Note: We completely removed the old 'uploadProfile' middleware 
// because we are using Base64 strings directly in the JSON body now!

const {
  getUserProfile, updateProfile,
  toggleFollow, getFollowers, getFollowing,
  searchUsers, getAllUsers 
} = require('../controllers/userController');

// --- Routes ---
router.get('/', getAllUsers);
router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUserProfile);

// THE FIX: Changed to '/update' to match frontend, and removed the upload middleware!
router.put('/update', protect, updateProfile);

router.post('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.post('/2fa/setup', protect, setup2FA); // Assuming 'protect' is your auth middleware
router.post('/2fa/verify', protect, verify2FA);

const sendEmail = require('../utils/sendEmail'); // Import your mailman

// 🚨 TEMPORARY TEST ROUTE 🚨
router.post('/test-email', protect, async (req, res) => {
  try {
    // 1. Check if the user actually wants emails!
    if (!req.user.emailAlerts) {
      return res.status(400).json({ message: "You have email alerts turned OFF in settings!" });
    }

    // 2. Send the test email
    await sendEmail({
      email: req.user.email,
      subject: '🚀 Welcome to Nodexa Live Nodes!',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #05070A; color: white; padding: 40px; border-radius: 20px;">
          <h2 style="color: #00F0FF;">System Alert</h2>
          <p>Hello <b>${req.user.username}</b>,</p>
          <p>Your Nodexa email pipeline is officially active and functional!</p>
          <p>You will now receive alerts when people Nod at you or send you secure messages.</p>
        </div>
      `
    });

    res.json({ success: true, message: "Check your inbox!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Email failed to send." });
  }
});

module.exports = router;