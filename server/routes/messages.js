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
  replyTo: { type: Object, default: null }, // 🚨 ADD THIS LINE!
  time: { type: String },
  // 👇 1. ADD THESE 3 LINES 👇
  isDeleted: { type: Boolean, default: false },
  isReplaced: { type: Boolean, default: false },
  isBlurred: { type: Boolean, default: false }
}, { timestamps: true });

const HoloMessage = mongoose.models.HoloMessage || mongoose.model('HoloMessage', holoMessageSchema);

// ─── 1. FETCH CHAT HISTORY (OPTIMIZED FOR SPEED) ───
router.get('/:room', protect, async (req, res) => {
  try {
    // 🚨 Sort by Newest First (-1), limit to 50, then reverse them so they display bottom-to-top!
    const messages = await HoloMessage.find({ room: req.params.room })
      .sort({ createdAt: -1 }) 
      .limit(50);
      
    res.status(200).json(messages.reverse());
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

// ─── 3. UPDATE MESSAGE (SMART DELETE / EDIT) ───
router.put('/:id', protect, async (req, res) => {
  try {
    // Finds the message by its ID and updates the text and true/false flags
    const updatedMessage = await HoloMessage.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    res.status(200).json(updatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 4. HARD DELETE MESSAGE (Remove for me) ───
router.delete('/:id', protect, async (req, res) => {
  try {
    await HoloMessage.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Message deleted permanently" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;