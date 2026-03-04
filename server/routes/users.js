/**
 * routes/users.js — Profile and social routes
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');
const {
  getUserProfile, updateProfile,
  toggleFollow, getFollowers, getFollowing,
  searchUsers,
} = require('../controllers/userController');

router.get('/search', searchUsers);
router.get('/:id', getUserProfile);
router.put('/profile/update', protect, uploadProfile.single('profilePhoto'), updateProfile);
router.post('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
