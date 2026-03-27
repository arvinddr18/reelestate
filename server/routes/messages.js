const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); 
const Message = require('../models/Message'); 

// ─── 1. FETCH CHAT HISTORY ───
router.get('/:room', protect, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    // Spits the exact error out so we don't have to guess!
    res.status(500).json({ error: err.message });
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
    // THE FIX: Spits the exact database error back to your frontend console!
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;