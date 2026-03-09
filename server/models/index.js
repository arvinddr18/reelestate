/**
 * models/Comment.js — Post comments
 */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500, trim: true },
    // Optional: nested replies
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * models/Like.js — Post likes (one like per user per post)
 */
const likeSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);
likeSchema.index({ post: 1, user: 1 }, { unique: true }); // Prevent duplicate likes

const Like = mongoose.model('Like', likeSchema);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * models/Follow.js — User follow relationships
 */
const followSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The person following
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The person being followed
  },
  { timestamps: true }
);
followSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = mongoose.model('Follow', followSchema);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * models/SavedProperty.js — Bookmarked properties
 */
const savedPropertySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: true }
);
savedPropertySchema.index({ user: 1, post: 1 }, { unique: true });

const SavedProperty = mongoose.model('SavedProperty', savedPropertySchema);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * models/Message.js — Chat messages between users
 */
const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 1000 },
    isRead: { type: Boolean, default: false },
    relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    
    // --- NEW INSTAGRAM FEATURES ---
    // 1. Reply: Link to another message
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    
    // 2. Pin: Keep important messages at top
    isPinned: { type: Boolean, default: false },
    
    // 3. Reactions: WhatsApp/Insta style emojis
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      emoji: String
    }]
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

// ─────────────────────────────────────────────────────────────────────────────

module.exports = { Comment, Like, Follow, SavedProperty, Message };
