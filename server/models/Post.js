const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Media — either a video reel OR multiple images
    mediaType: {
      type: String,
      enum: ['video', 'images'],
      required: true,
    },
    videoUrl: { type: String },           // Cloudinary video URL
    videoPublicId: { type: String },      // For deletion from Cloudinary
    images: [{ url: String, publicId: String }],

    // Property details
    title: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 2000 },
    price: { type: Number, required: true },
    priceUnit: { type: String, enum: ['total', 'per_sqft', 'per_month'], default: 'total' },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'plot', 'commercial', 'farmland', 'other'],
      required: true,
    },
    area: { type: String },               // e.g. "1200 sqft"
    bedrooms: { type: Number },
    bathrooms: { type: Number },

    // Location hierarchy (for filtering)
    taluk: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },

    // Google Maps coordinates & Privacy System
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, trim: true }, // The Exact Address (Hidden initially)
    },

    // --- NEW: NEIGHBORHOOD INTELLIGENCE SECTION ---
    neighborhood: {
      score: { type: Number, default: 0 },   // e.g. 8.7
      schools: { type: String },            // e.g. "1.2 km"
      hospitals: { type: String },          // e.g. "700 m"
      transport: { type: String },          // e.g. "1.8 km to Metro"
      shopping: { type: String },           // e.g. "1.3 km to Mall"
    },

    hashtags: [{ type: String, lowercase: true }], // e.g. ['luxury', '2bhk']

    // Social metrics (denormalized for fast feed queries)
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for keyword search
postSchema.index({ title: 'text', description: 'text', hashtags: 'text' });

// Compound index for location filtering
postSchema.index({ district: 1, state: 1, propertyType: 1, price: 1 });

module.exports = mongoose.model('Post', postSchema);