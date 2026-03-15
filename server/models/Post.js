const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    mediaType: {
      type: String,
      enum: ['video', 'images'],
      required: true,
    },
    videoUrl: { type: String },           
    videoPublicId: { type: String },      
    images: [{ url: String, publicId: String }],

    title: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 2000 },
    price: { type: Number, required: true },
    priceUnit: { type: String, enum: ['total', 'per_sqft', 'per_month'], default: 'total' },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'plot', 'commercial', 'farmland', 'other'],
      required: true,
    },
    area: { type: String },               
    bedrooms: { type: Number },
    bathrooms: { type: Number },

    // 📞 NEW: Specific contact number for this property
    phone: { type: String, trim: true },

    taluk: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },

    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, trim: true }, 
    },

    neighborhood: {
      score: { type: Number, default: 0 },   
      schools: { type: String },            
      hospitals: { type: String },          
      transport: { type: String },          
      shopping: { type: String },           
    },

    hashtags: [{ type: String, lowercase: true }], 

    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', description: 'text', hashtags: 'text' });
postSchema.index({ district: 1, state: 1, propertyType: 1, price: 1 });

module.exports = mongoose.model('Post', postSchema);