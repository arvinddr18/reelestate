const { Message } = require('../models/index');
const User = require('../models/User');

/**
 * messageController.js
 * Real-time messaging with Replies, Reactions, and Inbox logic.
 */

// --- 1. GET CONVERSATION ---
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
    .populate('replyTo') // Populates the message being replied to
    .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. SEND MESSAGE ---
const sendMessage = async (req, res) => {
  try {
    // 1. Pull the new file fields from the request body
    const { receiverId, text, relatedPostId, replyTo, image, file, fileName } = req.body;

    // 2. We changed this! Now it only crashes if there is NO text AND NO image AND NO file.
    if (!receiverId || (!text && !image && !file)) {
      return res.status(400).json({ success: false, message: 'Receiver and message content are required.' });
    }

    // 3. Save everything to the database
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: text || "",
      image: image || null,
      file: file || null,
      fileName: fileName || null,
      relatedPost: relatedPostId || null,
      replyTo: replyTo || null,
    });
    const populated = await Message.findById(message._id)
      .populate('sender', 'username profilePhoto')
      .populate('replyTo')
      .populate('relatedPost');

    // Emit via Socket.io for real-time delivery
    const io = req.app.get('io');
    if (io) {
      io.emit(`message:${receiverId}`, populated); 
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3. ADD EMOJI REACTION ---
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    const reactionIndex = message.reactions.findIndex(r => r.user.toString() === userId.toString());

    if (reactionIndex > -1) {
      if (message.reactions[reactionIndex].emoji === emoji) {
        message.reactions.splice(reactionIndex, 1);
      } else {
        message.reactions[reactionIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 4. GET INBOX (CONVERSATIONS) ---
const getInbox = async (req, res) => {
  try {
    const userId = req.user._id;

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
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    const populated = await User.populate(conversations, {
      path: "_id",
      select: "username profilePhoto fullName isVerified",
    });

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getConversation, 
  sendMessage, 
  getInbox, 
  addReaction 
};