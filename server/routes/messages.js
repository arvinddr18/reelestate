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
  replyTo: { type: Object, default: null },
  time: { type: String },
  
  isDeleted: { type: Boolean, default: false },
  isReplaced: { type: Boolean, default: false },
  isBlurred: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  timestamp: { type: Number },
  
  // 🌟 🚨 THE ULTIMATE FIX: Added isRead so MongoDB stops throwing it away! 🚨 🌟
  isRead: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  pinnedBy: { type: [String], default: [] }
  

}, { timestamps: true });


const HoloMessage = mongoose.models.HoloMessage || mongoose.model('HoloMessage', holoMessageSchema);

// ─── 1. FETCH CHAT HISTORY (WITH PAGINATION) ───
router.get('/:room', protect, async (req, res) => {
  try {
    // Grab the page number from the URL, default to page 1
    const page = parseInt(req.query.page) || 1;
    const limit = 50; 
    const skip = (page - 1) * limit; // Calculates how many messages to skip

    // Fetch the specific chunk of messages
    const messages = await HoloMessage.find({ room: req.params.room })
      .sort({ createdAt: -1 }) // 1. Sort Newest First
      .skip(skip)              // 2. Skip the ones we already loaded
      .limit(limit);           // 3. Grab exactly 50

    // Reverse them so they show chronologically (top-to-bottom) on the screen
    res.status(200).json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 2. SAVE NEW MESSAGE (WITH AUTOMATED MAILMAN) ───
router.post('/', protect, async (req, res) => {
  try {
    const newMessage = new HoloMessage(req.body);
    const savedMessage = await newMessage.save();
    
    // 👇 🚨 AUTOMATED SMART EMAIL TRIGGER 👇
    try {
      const User = require('../models/User'); // Adjust path if needed
      const sendEmail = require('../utils/sendEmail'); // Call the Mailman
      
      // 1. In HoloMessages, the 'room' string usually looks like "senderId_receiverId". 
      // We need to figure out who the OTHER person is!
      const ids = req.body.room.split('_');
      const receiverId = ids.find(id => id !== String(req.user._id));

      if (receiverId) {
        // 2. Find the person receiving the message
        const receiver = await User.findById(receiverId);

        // 3. Only send if they exist, want emails, AND are currently offline!
        if (receiver && receiver.emailAlerts && !receiver.isOnline) {
          
          await sendEmail({
            email: receiver.email,
            subject: `New Message from ${req.user.username} on Nodexa 💬`,
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #05070A; color: white; padding: 40px; border-radius: 24px; border: 1px solid #1E2532; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #00F0FF; margin-top: 0; font-weight: 900; letter-spacing: -0.5px;">New Encrypted Node</h2>
                
                <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5;">
                  <b>@${req.user.username}</b> sent you a secure message while you were away from the network.
                </p>
                
                <div style="background-color: #151A25; border-left: 4px solid #00F0FF; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 25px 0; font-style: italic; color: #9CA3AF;">
                  "${req.body.text || '📷 Sent an attachment'}"
                </div>
                
                <a href="${process.env.CLIENT_URL || 'https://reelestate-beta.vercel.app'}/messages" 
                   style="display: inline-block; background-color: #00F0FF; color: #05070A; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Reply on Nodexa
                </a>
              </div>
            `
          });
          console.log(`📧 Email notification sent to ${receiver.email}`);
        }
      }
    } catch (emailErr) {
      // If the email fails, the chat still works perfectly!
      console.error("Failed to send notification email:", emailErr);
    }
    // 👆 🚨 ───────────────────────────────── 👆

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