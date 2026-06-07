/**
 * controllers/postController.js
 * Handles all post operations: create, feed, like, comment, save, search, filter.
 */
const Post = require('../models/Post');
const User = require('../models/User');
const { Like, SavedProperty, Comment } = require('../models/index');
// ─── Create Post ──────────────────────────────────────────────────────────────
/**
 * POST /api/posts
 * Multipart form data with media files + property details.
 */
const createPost = async (req, res) => {
  try {
    const {
      title, description, price, priceUnit, propertyType,
      area, bedrooms, bathrooms, phone,
      taluk, district, state, country,
      hashtags, mediaType,
      lat, lng, address,
      mainCategory, subCategory, postType // 👈 ADDED HERE
    } = req.body;

    if (!title || !mediaType) {
      return res.status(400).json({ success: false, message: 'Title and media type are required.' });
    }

    // Inside createPost function (around line 26):

    let postData = {
      author: req.user._id,
      title, 
      description, 
      price: Number(price) || 0,
      priceUnit, 
      propertyType, 
      area,
      mainCategory: mainCategory || 'Social', // 👈 Standardized for your feed
      subCategory: subCategory || 'All', 
      postType: postType || 'Social',        
      isActive: true,                        // 👈 CRITICAL: This ensures your post shows up
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      taluk, 
      district, 
      state, 
      country, 
      phone,
      mediaType,
      hashtags: hashtags ? JSON.parse(hashtags).map(h => h.toLowerCase().replace('#', '')) : [],
      location: (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng), address } : undefined,
    };

    if (mediaType === 'video') {
      if (!req.file) return res.status(400).json({ success: false, message: 'Video file is required.' });
      postData.videoUrl = req.file.path;
      postData.videoPublicId = req.file.filename;
    } else {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one image is required.' });
      }
      postData.images = req.files.map(f => ({ url: f.path, publicId: f.filename }));
    }

    const post = await Post.create(postData);

    // Increment user's posts count
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    const populatedPost = await Post.findById(post._id).populate('author', 'username profilePhoto isVerified');
    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Feed (Infinite Scroll & AI Engine) ───────────────────────────────────
/**
 * GET /api/posts/feed?page=1&limit=10
 * Returns paginated posts, filtered by AI preferences or manual queries.
 */
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ─── GET FEED (TEMPORARY DEBUGGING VERSION) ───
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // --- TEMPORARY FIX: FETCH ALL POSTS WITHOUT FILTERS ---
    const posts = await Post.find({}) 
        .populate('author', 'username profilePhoto isVerified role phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(20)
        .lean();

    const total = await Post.countDocuments({});

    console.log("DEBUG: Total posts in DB:", total);
    if (posts.length > 0) {
        console.log("DEBUG: First post in DB:", posts[0].title, "| Category:", posts[0].mainCategory);
    } else {
        console.log("DEBUG: Database returned zero posts.");
    }
    // ──────────────────────────────────────────────────────────────

    // Attach user's like/save status to each post (Keep this logic)
    if (req.user) {
      const postIds = posts.map(p => p._id);
      const [likes, saves] = await Promise.all([
        Like.find({ user: req.user._id, post: { $in: postIds } }).select('post'),
        SavedProperty.find({ user: req.user._id, post: { $in: postIds } }).select('post'),
      ]);
      const likedSet = new Set(likes.map(l => l.post.toString()));
      const savedSet = new Set(saves.map(s => s.post.toString()));

      posts.forEach(p => {
        p.isLiked = likedSet.has(p._id.toString());
        p.isSaved = savedSet.has(p._id.toString());
      });
    }

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'username profilePhoto isVerified role phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    // Attach user's like/save status to each post
    if (req.user) {
      const postIds = posts.map(p => p._id);
      const [likes, saves] = await Promise.all([
        Like.find({ user: req.user._id, post: { $in: postIds } }).select('post'),
        SavedProperty.find({ user: req.user._id, post: { $in: postIds } }).select('post'),
      ]);
      const likedSet = new Set(likes.map(l => l.post.toString()));
      const savedSet = new Set(saves.map(s => s.post.toString()));

      posts.forEach(p => {
        p.isLiked = likedSet.has(p._id.toString());
        p.isSaved = savedSet.has(p._id.toString());
      });
    }

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ─── Get Single Post ──────────────────────────────────────────────────────────
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePhoto isVerified role bio location followersCount phone');

    if (!post || !post.isActive) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Increment view count
    await Post.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Post ──────────────────────────────────────────────────────────────
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    // Only author or admin can delete
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Remove media from Cloudinary
    if (post.mediaType === 'video' && post.videoPublicId) {
      await deleteFromCloudinary(post.videoPublicId, 'video');
    } else {
      for (const img of post.images) {
        await deleteFromCloudinary(img.publicId);
      }
    }

    await post.deleteOne();
    await User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } });

    res.json({ success: true, message: 'Post deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Toggle Like ──────────────────────────────────────────────────────────────
const toggleLike = async (req, res) => {
  try {
    const existingLike = await Like.findOne({ post: req.params.id, user: req.user._id });

    if (existingLike) {
      await existingLike.deleteOne();
      await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: -1 } });
      return res.json({ success: true, liked: false });
    }

    await Like.create({ post: req.params.id, user: req.user._id });
    await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: 1 } });
    res.json({ success: true, liked: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Toggle Save ──────────────────────────────────────────────────────────────
const toggleSave = async (req, res) => {
  try {
    const existing = await SavedProperty.findOne({ post: req.params.id, user: req.user._id });

    if (existing) {
      await existing.deleteOne();
      await Post.findByIdAndUpdate(req.params.id, { $inc: { savesCount: -1 } });
      return res.json({ success: true, saved: false });
    }

    await SavedProperty.create({ post: req.params.id, user: req.user._id });
    await Post.findByIdAndUpdate(req.params.id, { $inc: { savesCount: 1 } });
    res.json({ success: true, saved: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Comments ─────────────────────────────────────────────────────────────
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id, parentComment: null })
      .populate('author', 'username profilePhoto')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Add Comment ──────────────────────────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text is required.' });

    const comment = await Comment.create({
      post: req.params.id,
      author: req.user._id,
      text,
    });

    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
    const populated = await comment.populate('author', 'username profilePhoto');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Search Posts ─────────────────────────────────────────────────────────────
/**
 * GET /api/posts/search?q=keyword&hashtag=luxury
 */
const searchPosts = async (req, res) => {
  try {
    const { q, hashtag } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 12;

    let filter = { isActive: true };

    if (hashtag) {
      filter.hashtags = hashtag.toLowerCase().replace('#', '');
    } else if (q) {
      filter.$text = { $search: q };
    }

    const posts = await Post.find(filter)
      .populate('author', 'username profilePhoto isVerified phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Saved Posts ──────────────────────────────────────────────────────────
const getSavedPosts = async (req, res) => {
  try {
    const saved = await SavedProperty.find({ user: req.user._id })
      .populate({ path: 'post', populate: { path: 'author', select: 'username profilePhoto phone' } })
      .sort({ createdAt: -1 });

    const posts = saved.map(s => s.post).filter(Boolean);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Update Post Logic ---
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    // Check if the user owns this post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPost,
  getFeed,
  getPost,
  deletePost,
  updatePost,
  toggleLike,
  toggleSave,
  getComments,
  addComment,
  searchPosts,
  getSavedPosts,
};
