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
