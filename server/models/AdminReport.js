/**
 * models/AdminReport.js
 * The Trust & Safety Ledger for Nodexa
 */
const mongoose = require('mongoose');

const adminReportSchema = new mongoose.Schema({
  reporterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  reportedUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Under Review', 'Resolved', 'Dismissed'], 
    default: 'Pending' 
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminReport', adminReportSchema);