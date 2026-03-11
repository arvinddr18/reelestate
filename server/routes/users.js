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
router.get('/search', searchUsers);
router.get('/:id', getUserProfile);

// THE FIX: Changed to '/update' to match frontend, and removed the upload middleware!
router.put('/update', protect, updateProfile);

router.post('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;