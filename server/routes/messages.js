const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); 
const Message = require('../models/Message'); // Importing our new Model!

// ─── 1. FETCH CHAT HISTORY ───
router.get('/:room', protect, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error("Fetch History Error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ─── 2. SAVE NEW MESSAGE ───
router.post('/', protect, async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    console.error("Save Message Error:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

module.exports = router;