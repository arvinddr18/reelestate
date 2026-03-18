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

router.get('/feed', optionalAuth, getFeed);
router.get('/search', searchPosts);
router.get('/saved', protect, getSavedPosts);
router.get('/:id', optionalAuth, getPost);
router.delete('/:id', protect, deletePost);

// Create — handle video OR images based on mediaType field
router.post('/video', protect, uploadVideo.single('video'), createPost);
router.post('/images', protect, uploadImages.array('images', 10), createPost);

// Social
router.put('/:id/like', protect, toggleLike);
router.put('/:id/save', protect, toggleSave);
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);

module.exports = router;
// ── TEMPORARY: DATABASE CLEANUP ROUTE ──
// This assigns 'Sale Hub' to every post that has no category
router.get('/admin/cleanup-categories', async (req, res) => {
  try {
    const Post = require('../models/Post'); // Ensure path to your Post model is correct
    
    const result = await Post.updateMany(
      { mainCategory: { $exists: false } }, // Find posts with no category
      { $set: { mainCategory: 'Sale Hub', subCategory: 'All' } } // Assign default
    );

    const result2 = await Post.updateMany(
      { mainCategory: "All" }, // Find posts with the literal word "All"
      { $set: { mainCategory: 'Sale Hub' } } 
    );

    res.json({ 
      message: "Database Cleaned!", 
      updatedCount: result.modifiedCount + result2.modifiedCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});