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
  },
  customKeywords: {
    type: [String],
    default: ['urgent', 'emergency', 'broken', 'help'] // Standard system defaults
  },
  lockChat: { type: Boolean, default: false },
  hideChat: { type: Boolean, default: false },
  vaultKey: { type: String, default: '' },
  screenshotProtection: { type: String, default: 'Off' },
  readReceipts: { type: Boolean, default: true },
  chatPin: { type: String, default: '' },
  autoDownload: { type: String, enum: ['Wi-Fi Only', 'Wi-Fi + Cellular', 'Never'], default: 'Wi-Fi Only' },
  imageQuality: { type: String, enum: ['Standard', 'HD Quality'], default: 'Standard' },
  saveToGallery: { type: Boolean, default: false },
  isPinnedChat: { type: Boolean, default: false },
  isImportantChat: { type: Boolean, default: false }

}, { timestamps: true });

chatSettingSchema.index({ userId: 1, room: 1 }, { unique: true });

module.exports = mongoose.model('ChatSetting', chatSettingSchema);