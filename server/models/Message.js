const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { 
    type: String, 
    required: true 
  },
  senderId: { 
    type: String, 
    required: true 
  },
  // 🚨 CHANGED: text is no longer "required: true", so you can send JUST a photo/video without typing!
  text: { 
    type: String, 
    default: "" 
  },
  time: { 
    type: String 
  },
  // 🚨 ADDED THESE TWO LINES SO MONGOOSE SAVES YOUR MEDIA!
  image: { 
    type: String, 
    default: "" 
  },
  video: { 
    type: String, 
    default: "" 
  }
}, { timestamps: true });

// We are keeping your 'holographic_messages' fix here so your database stays perfectly connected!
module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema, 'holographic_messages');