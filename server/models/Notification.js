const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  type: {
    type: String,
    enum: ['nod', 'message', 'tag', 'comment', 'system', 'alert'],
    required: true
  },
  content: { 
    type: String, 
    required: true // e.g., "nodded at your profile" or "sent you a secure message"
  },
  linkId: { 
    type: mongoose.Schema.Types.ObjectId, // Connects to a Post ID or Chat ID
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Post', 'User', 'Message']
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);