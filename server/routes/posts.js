/**
 * routes/posts.js — Post CRUD, social interactions, search
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadImages, uploadVideo } = require('../middleware/upload');
const {
  createPost, getFeed, getPost, deletePost,
  toggleLike, toggleSave,
  getComments, addComment,
  searchPosts, getSavedPosts,
} = require('../controllers/postController');

// Feed & search (protect is optional — adds isLiked/isSaved if logged in)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return require('../middleware/auth').protect(req, res, next);
  }
  next();
};

// ── 1. MAIN FEED ROUTES ──
// FIXES the 404: This maps GET /api/posts/ to your feed
router.get('/', optionalAuth, getFeed); 
router.get('/feed', optionalAuth, getFeed);

router.get('/search', searchPosts);
router.get('/saved', protect, getSavedPosts);
router.get('/:id', optionalAuth, getPost);
router.delete('/:id', protect, deletePost);

// ── 2. CREATE ROUTES ──
router.post('/video', protect, uploadVideo.single('video'), createPost);
router.post('/images', protect, uploadImages.array('images', 10), createPost);

// ── 3. SOCIAL ROUTES ──
router.put('/:id/like', protect, toggleLike);
router.put('/:id/save', protect, toggleSave);
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);

// ── 4. DATABASE CLEANUP ROUTE ──
// MOVE THIS ABOVE module.exports so it is actually registered!
router.get('/admin/cleanup-categories', async (req, res) => {
  try {
    const Post = require('../models/Post'); 
    
    // Fix posts with NO category
    const result = await Post.updateMany(
      { mainCategory: { $exists: false } }, 
      { $set: { mainCategory: 'Sale Hub', subCategory: 'All', postType: 'Real Estate' } }
    );

    // Fix posts with the wrong word "All" as a category
    const result2 = await Post.updateMany(
      { mainCategory: "All" }, 
      { $set: { mainCategory: 'Sale Hub' } } 
    );

    res.json({ 
      success: true,
      message: "Database Cleaned!", 
      updatedCount: result.modifiedCount + result2.modifiedCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── 5. THE EXIT DOOR ──
// This MUST be the very last line
module.exports = router;