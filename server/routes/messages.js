/**
 * routes/messages.js - Chat routes (Upgraded for Room Architecture)
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Keeping your security!
const Message = require('../models/Message'); // Importing the new Model

// 1. FETCH CHAT HISTORY: Get all messages for a specific room
// We use the `protect` middleware so only logged-in users can fetch chats
router.get('/:room', protect, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// 2. SAVE NEW MESSAGE: Store a message in the database
router.post('/', protect, async (req, res) => {
  const newMessage = new Message(req.body);
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

module.exports = router;