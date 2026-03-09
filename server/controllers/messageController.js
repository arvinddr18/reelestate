/**
 * controllers/messageController.js
 * Real-time messaging between buyers and sellers.
 */

const { Message } = require('../models/index');
const User = require('../models/User');

// ─── Get Conversation ─────────────────────────────────────────────────────────
/**
 * GET /api/messages/:userId
 * Returns the full chat history between the logged-in user and :userId
 */
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
    .populate('sender', 'username profilePhoto')
    .populate('receiver', 'username profilePhoto')
    .populate('relatedPost', 'title images videoUrl')
    .populate('replyTo') // ADD THIS LINE HERE
    .sort({ createdAt: 1 });
    // Mark received messages as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Send Message ─────────────────────────────────────────────────────────────
/**
 * POST /api/messages
 * Body: { receiverId, text, relatedPostId? }
 * Also emits via Socket.io for real-time delivery.
 */
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, relatedPostId } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ success: false, message: 'Receiver and text are required.' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: 'Receiver not found.' });

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
      relatedPost: relatedPostId || null,
    });

    const populated = await message
      .populate('sender', 'username profilePhoto')

    // Emit via Socket.io (server-side)
    const io = req.app.get('io');
    io.emit(`message:${receiverId}`, populated); // Target specific user's channel

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Conversations (Inbox) ───────────────────────────────────────────
/**
 * GET /api/messages/inbox
 * Returns last message from each unique conversation partner.
 */
const getInbox = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate to get latest message per conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] },
                1, 0,
              ],
            },
          },
        },
      },
    ]);

    // Populate the other user's info
    const populated = await User.populate(conversations, {
      path: '_id',
      select: 'username profilePhoto fullName isVerified',
      model: 'User',
    });

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getConversation, sendMessage, getInbox };
