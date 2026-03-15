const mongoose = require('mongoose');
const Post = require('../models/Post'); // <-- ADD THIS LINE RIGHT HERE!

// Grab the Message database model
const Message = mongoose.models.Message || mongoose.model('Message');

// --- 1. GET MESSAGES ---
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    // Find all messages between the logged-in user and the selected user
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId }
      ]
    })
    .populate('sender', 'username profilePhoto fullName')
    .populate('replyTo')
    .populate('relatedPost')
    .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({ success: false, message: 'Server error getting messages.' });
  }
};

// --- 2. SEND MESSAGE ---
const sendMessage = async (req, res) => {
  try {
    // Pull the new file fields from the frontend request
    const { receiverId, text, relatedPostId, replyTo, image, file, fileName } = req.body;

    // It will only crash if there is NO text AND NO image AND NO file
    if (!receiverId || (!text && !image && !file)) {
      return res.status(400).json({ success: false, message: 'Receiver and message content are required.' });
    }

    // Save everything to the database
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
      .populate('sender', 'username profilePhoto fullName')
      .populate('replyTo')
      .populate('relatedPost');

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({ success: false, message: 'Server error sending message.' });
  }
};

// Export the functions so your server can use them
module.exports = { getMessages, sendMessage };