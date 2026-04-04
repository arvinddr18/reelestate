const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth'); 

// ─── THE FIX: UPDATED HOLOMESSAGE MODEL ───
const holoMessageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  senderId: { type: String, required: true },
  
  // 🚨 FIX 1: Changed to "default: ''" so you can send photos/videos WITHOUT typing text!
  text: { type: String, default: "" }, 
  
  // 🚨 FIX 2: Added image and video fields so MongoDB saves them!
  image: { type: String, default: "" }, 
  video: { type: String, default: "" }, 
  audio: { type: String, default: "" },
  
  time: { type: String }
}, { timestamps: true });

const HoloMessage = mongoose.models.HoloMessage || mongoose.model('HoloMessage', holoMessageSchema);

// ─── 1. FETCH CHAT HISTORY ───
router.get('/:room', protect, async (req, res) => {
  try {
    const messages = await HoloMessage.find({ room: req.params.room }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 2. SAVE NEW MESSAGE ───
router.post('/', protect, async (req, res) => {
  try {
    const newMessage = new HoloMessage(req.body);
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;