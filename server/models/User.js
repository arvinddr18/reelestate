/**
 * models/User.js
 * Defines the User schema for both buyers and sellers.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    loginAlerts: { type: Boolean, default: true }, // Defaults to ON for safety!

    activeSessions: [{
      deviceInfo: String,
      time: String
    }],

    lastLogoutAll: Date,

    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },
    // Profile info
    fullName: { type: String, trim: true },
    bio: { type: String, maxlength: 200 },
    profilePhoto: { type: String, default: '' },   // Cloudinary URL
    location: { type: String },
    phone: { type: String },
    website: { type: String },

    // Social counts (denormalized for performance)
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // 🚨 ADD THIS NEW FIELD RIGHT HERE 🚨
    isPrivate: { 
      type: Boolean, 
      default: true 
    },
    hideActivity: { 
      type: Boolean, 
      default: false // Default is false (meaning they ARE visible by default)
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    emailAlerts: {
      type: Boolean,
      default: true // Default is true (users get emails by default)
    },
    backupEmail: {
    type: String,
    default: ""
  },
  trustedContact: {
    type: String,
    default: ""
  },
  twoFactorSecret: { 
    type: String 
  },
  is2FAEnabled: { 
    type: Boolean, 
    default: false 
  },
  resetPasswordOtp: {
    type: String
  },
  resetPasswordOtpExpire: {
    type: Date
  },
  // Add to server/models/User.js
walletBalance: {
  type: Number,
  default: 0
},
transactions: [{
  amount: Number,
  type: { type: String, enum: ['credit', 'debit'] },
  status: String,
  razorpay_payment_id: String,
  date: { type: Date, default: Date.now }
}]

  },
  { timestamps: true, strict: false }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
