/**
 * routes/admin.js — Admin panel routes (admin role required)
 */
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAllUsers, deleteUser, getAllPosts, removePost, getStats } = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/posts', getAllPosts);
router.delete('/posts/:id', removePost);

module.exports = router;
