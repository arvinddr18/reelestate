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
  text: { 
    type: String, 
    default: "" 
  },
  time: { 
    type: String 
  },
  image: { 
    type: String, 
    default: "" 
  },
  video: { 
    type: String, 
    default: "" 
  },
  // 🚨 NEW FIELDS ADDED BELOW FOR YOUR PRO FEATURES 🚨
  audio: { 
    type: String, 
    default: "" 
  },
  replyTo: { 
    type: Object, 
    default: null 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  isReplaced: { 
    type: Boolean, 
    default: false 
  },
  isBlurred: { 
    type: Boolean, 
    default: false 
  },
  isEdited: { 
    type: Boolean, 
    default: false 
  },
  timestamp: { 
    type: Number 
  }
}, { timestamps: true });

// We are keeping your 'holographic_messages' fix here so your database stays perfectly connected!
module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema, 'holographic_messages');