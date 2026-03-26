const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { 
    type: String, 
    required: true 
  },
  senderId: { 
    type: String, // Keeping as string to match your frontend logic easily
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

module.exports = mongoose.model('Message', messageSchema);