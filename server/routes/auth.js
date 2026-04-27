/**
 * routes/auth.js — Authentication routes
 */
const express = require('express');
const router = express.Router();
const { register, login, getMe, getLinkedAccounts, logoutAll, changePassword, verify2FALogin, sendPasswordOTP, resetPasswordWithOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth'); // Assuming you have an auth middleware

router.post('/verify-2fa-login', verify2FALogin);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.get('/linked-accounts', protect, getLinkedAccounts);

router.post('/logout-all', protect, logoutAll); // new killswitch

router.put('/change-password', protect, changePassword);

// Make sure to import them at the top first!
router.post('/send-password-otp', protect, sendPasswordOTP);
router.post('/reset-password-with-otp', protect, resetPasswordWithOTP);

module.exports = router;
