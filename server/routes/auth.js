/**
 * routes/auth.js — Authentication routes
 */
const express = require('express');
const router = express.Router();
const { register, login, getMe, getLinkedAccounts, logoutAll, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth'); // Assuming you have an auth middleware

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.get('/linked-accounts', protect, getLinkedAccounts);

router.post('/logout-all', protect, logoutAll); // new killswitch

router.put('/change-password', protect, changePassword);

module.exports = router;
