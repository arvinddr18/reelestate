const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // ── CATEGORY & ROUTING (The Super App Core) ──
    mainCategory: { type: String, default: 'Social' }, 
    subCategory: { type: String, default: 'All' },
    postType: { type: String, default: 'Social' }, // Removed strict enum so it accepts Jobs, Cars, etc.

    // ── MEDIA (Universal) ──
    mediaType: { type: String, enum: ['video', 'images'], required: true },
    videoUrl: { type: String },           
    videoPublicId: { type: String },      
    images: [{ url: String, publicId: String }],

    // ── UNIVERSAL DETAILS ──
    title: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 2000 },
    phone: { type: String, trim: true },
    hashtags: [{ type: String, lowercase: true }], 

    // ── 🏠 REAL ESTATE SPECIFIC ──
    price: { type: Number, default: 0 }, // Removed 'required: true'
    priceUnit: { type: String, default: 'total' },
    propertyType: { type: String, default: 'other' }, // Removed strict enum
    area: { type: String },               
    bedrooms: { type: Number },
    bathrooms: { type: Number },

    // ── 🛍️ MARKETPLACE & 🚗 AUTO SPECIFIC ──
    condition: { type: String }, // e.g., 'Brand New', 'Like New', 'Used'
    brand: { type: String },     // e.g., 'Apple', 'Honda'
    mileage: { type: String },   // e.g., '15,000 km'

    // ── 💼 JOBS & 🛠️ SERVICES SPECIFIC ──
    salary: { type: String },     // e.g., '₹50,000 - ₹80,000/month'
    jobType: { type: String },    // e.g., 'Full-Time', 'Remote', 'Freelance'
    experience: { type: String }, // e.g., '2-4 Years'

    // ── 📸 SOCIAL SPECIFIC ──
    music: { type: String },       // e.g., 'Levitating - Dua Lipa'
    locationTag: { type: String }, // e.g., 'Bengaluru, Karnataka'

    // ── MAPS & LOCATION ──
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

    // ── ENGAGEMENT STATS ──
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