const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth'); 
const ChatSetting = require('../models/ChatSetting');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');

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

// Route: Send OTP to Email
router.post('/send-otp', protect, async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
  try {
    // 1. Save OTP to Database
    await OTP.create({ email, otp });

    // 2. Use your existing sendEmail utility
    await sendEmail({
      email: email,
      subject: "Your Chat Reset Code",
      html: `<p>Your 4-digit verification code is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`
    });

    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route: Verify OTP
router.post('/verify-otp', protect, async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    const entry = await OTP.findOne({ email, otp });
    
    if (entry) {
      await OTP.deleteMany({ email }); // Remove OTP after successful use
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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

// ─── 2. SAVE NEW MESSAGE (WITH AUTOMATED MAILMAN & SMART ALERTS) ───
router.post('/', protect, async (req, res) => {
  try {
    const newMessage = new HoloMessage(req.body);
    const savedMessage = await newMessage.save();

    // 🚨 NEW: GLOBAL NOTIFICATION GENERATOR FOR LOCATION REQUESTS 🚨
    if (req.body.isLocationRequest) {
      const Notification = require('../models/Notification');
      
      // Figure out who the other person in the room is
      const users = req.body.room.split('_');
      const recipientId = users.find(id => id !== String(req.user._id));

      if (recipientId) {
        await Notification.create({
          recipient: recipientId,
          sender: req.user._id,
          type: 'location', // You can use this to render a special map icon in your panel!
          content: 'is requesting your Live Location in a secure chat.',
          onModel: 'User',
          linkId: req.user._id
        });
      }
    }
    
    // 👇 🚨 AUTOMATED SMART EMAIL TRIGGER & SMART SCAN INTERCEPTOR 👇
    try {
      const User = require('../models/User'); 
      const sendEmail = require('../utils/sendEmail'); 
      
      const ids = req.body.room.split('_');
      const receiverId = ids.find(id => id !== String(req.user._id));

      if (receiverId) {
        // 1. Check Chat Room DB Config Settings for Custom User Triggers
        let shouldAlert = true;
        const recipientSettings = await ChatSetting.findOne({ userId: receiverId, room: req.body.room });

        if (recipientSettings) {
          if (recipientSettings.smartAlerts) {
            // Read custom precious keywords dynamically from MongoDB
            const userKeywords = recipientSettings.customKeywords && recipientSettings.customKeywords.length > 0 
              ? recipientSettings.customKeywords 
              : ['urgent', 'emergency', 'broken', 'help'];

            // Creates dynamic case-insensitive search rule
            const customPattern = new RegExp(userKeywords.join('|'), 'i');
            const matchedPriority = customPattern.test(req.body.text || '');

            if (matchedPriority) {
              shouldAlert = true;   // 🚨 Alert immediately! Precious keyword found!
            } else {
              shouldAlert = false;  // 🌑 Quiet delivery—suppress alert smoothly.
            }
          }

          // Final check: If they chose "Always" mute and no precious keyword matched
          if (recipientSettings.muteOption === 'Always' && !shouldAlert) {
            shouldAlert = false;
          }
        }

        // 2. Find the person receiving the message
        const receiver = await User.findById(receiverId);

        // 3. Only send email alert if system checks pass AND receiver is offline!
        if (receiver && receiver.emailAlerts && !receiver.isOnline && shouldAlert) {
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
        } else {
          console.log("📬 Alert suppressed safely via active user smart configurations.");
        }
      }
    } catch (emailErr) {
      console.error("Failed to run notification intercept processes:", emailErr);
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

// ─── GET CHAT ROOM SPECIFIC SETTINGS ────────────────────────────────────
router.get('/settings/:room', protect, async (req, res) => {
  try {
    let settings = await ChatSetting.findOne({ userId: req.user._id, room: req.params.room });

    // If no custom settings exist yet, return standard system defaults
    if (!settings) {
      settings = { muteOption: 'Off', priorityMode: false, smartAlerts: true };
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── UPDATE/UPSERT CHAT ROOM SPECIFIC SETTINGS ───────────────────────────
router.post('/settings/:room', protect, async (req, res) => {
  try {
    const { 
      muteOption, 
      priorityMode, 
      smartAlerts, 
      customKeywords, 
      lockChat, 
      hideChat, 
      screenshotProtection, 
      readReceipts,
      chatPin,
      vaultKey,
      autoDownload, imageQuality, saveToGallery, isPinnedChat, isImportantChat, isBlocked
    } = req.body;

    // 🚨 CHECK YOUR TERMINAL AFTER TOGGLING A SETTING
    console.log("Saving Settings for Room:", req.params.room, "Data:", req.body);

    const updatedSettings = await ChatSetting.findOneAndUpdate(
      { userId: req.user._id, room: req.params.room },
      { 
        $set: { 
          muteOption, 
          priorityMode, 
          smartAlerts, 
          customKeywords,
          lockChat, 
          hideChat, 
          screenshotProtection, 
          readReceipts,
          chatPin,
          vaultKey,
          autoDownload, imageQuality, saveToGallery, isPinnedChat, isImportantChat, isBlocked
        } 
      },
      { new: true, upsert: true }
    );

    // 🚨 NEW: GLOBAL BLOCK LIST SYNC 🚨
    if (isBlocked !== undefined) {
      const User = require('../models/User');
      
      // Figure out who the other person is
      const ids = req.params.room.split('_');
      const friendId = ids.find(id => id !== String(req.user._id));

      if (friendId) {
        if (isBlocked === true) {
          // Add them to the global Blocked list
          await User.findByIdAndUpdate(req.user._id, { $addToSet: { blockedUsers: friendId } });
        } else {
          // Remove them from the global Blocked list
          await User.findByIdAndUpdate(req.user._id, { $pull: { blockedUsers: friendId } });
        }
      }
    }
    

    res.status(200).json({ success: true, data: updatedSettings });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── 5. OTP FORGOT PIN FLOW ──────────────────────────────────────────

// ─── CLEAR ENTIRE CHAT HISTORY ───────────────────────────
router.delete('/room/:room', protect, async (req, res) => {
  try {
    const HoloMessage = mongoose.models.HoloMessage || mongoose.model('Message');
    await HoloMessage.deleteMany({ room: req.params.room });
    res.status(200).json({ success: true, message: "Chat wiped securely." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



module.exports = router;