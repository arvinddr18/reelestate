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
    required: true 
  },
  time: { 
    type: String 
  }
}, { timestamps: true });

// THE FIX: We added 'holographic_messages' at the end. 
// This forces MongoDB to ignore old rules and create a fresh, clean table!
module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema, 'holographic_messages');