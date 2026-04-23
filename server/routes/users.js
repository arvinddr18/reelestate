/**
 * routes/users.js - Profile and social routes
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  getUserProfile, updateProfile,
  toggleFollow, getFollowers, getFollowing,
  searchUsers, getAllUsers, setup2FA, verify2FA 
} = require('../controllers/userController');

const sendEmail = require('../utils/sendEmail');

// --- Routes ---
router.get('/', getAllUsers);
router.get('/search', protect, searchUsers);

// ✅ 2FA ROUTES MOVED UP - Must be before /:id routes!
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify', protect, verify2FA);

// ✅ TEST EMAIL ROUTE MOVED UP - Must be before /:id routes!
router.post('/test-email', protect, async (req, res) => {
  try {
    if (!req.user.emailAlerts) {
      return res.status(400).json({ message: "You have email alerts turned OFF in settings!" });
    }
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

// ✅ UPDATE ROUTE
router.put('/update', protect, updateProfile);

// ✅ DYNAMIC /:id ROUTES LAST
router.get('/:id', protect, getUserProfile);
router.post('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;