const mongoose = require('mongoose');

const chatSettingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  room: { 
    type: String, 
    required: true 
  },
  muteOption: { 
    type: String, 
    enum: ['Off', '1 Hour', '8 Hours', 'Always'], 
    default: 'Off' 
  },
  priorityMode: { 
    type: Boolean, 
    default: false 
  },
  smartAlerts: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

chatSettingSchema.index({ userId: 1, room: 1 }, { unique: true });

module.exports = mongoose.model('ChatSetting', chatSettingSchema);