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
    marketplaceCategory: { type: String }, // 👈 NEW: 'Sofa', 'Seeds', etc.
    priceType: { type: String },
    condition: { type: String }, // e.g., 'Brand New', 'Like New', 'Used'
    brand: { type: String },     // e.g., 'Apple', 'Honda'
    mileage: { type: String },   // e.g., '15,000 km'

    // ── 💼 JOBS & 🛠️ SERVICES SPECIFIC ──
    jobRole: { type: String },
    workMode: { type: String },
    salary: { type: String },     // e.g., '₹50,000 - ₹80,000/month'
    jobType: { type: String },    // e.g., 'Full-Time', 'Remote', 'Freelance'
    experience: { type: String }, // e.g., '2-4 Years'

    // ── 🎟️ EVENTS & TRAVEL SPECIFIC ──
    eventDate: { type: String },  // e.g., '2026-04-15'
    eventTime: { type: String },  // e.g., '18:30'
    ticketPrice: { type: String },// e.g., '₹499', 'Free'

    // ── ✈️ TRAVEL & TRIPS SPECIFIC ──
    destination: { type: String },
    packageType: { type: String }, // e.g., 'Solo', 'Couple', 'Group'
    duration: { type: String },    // e.g., '3 Days, 2 Nights'
    included: { type: String },    // e.g., 'Stay, Food, Transport'
    
    // ── 🍔 FOOD & CAFES SPECIFIC ──
    cuisine: { type: String },    // e.g., 'Italian', 'South Indian'
    dietary: { type: String },    // e.g., 'Pure Veg', 'Non-Veg', 'Both'
    dishName: { type: String },         
    restaurantName: { type: String },    
    offer: { type: String },             
    swiggyLink: { type: String },        
    zomatoLink: { type: String },      
    restaurantWebsite: { type: String }, 

    // ── 🎓 EDUCATION & 💼 SERVICES SPECIFIC ──
    institute: { type: String },
    collegeWebsite: { type: String },
    serviceAvailable: { type: String },
    // ── 🎓 EDUCATION SPECIFIC ──
    educationCategory: { type: String }, // 'School', 'Coaching', etc.
    institutionType: { type: String },   // 'School', 'College', 'University'
    board: { type: String },             // 'CBSE', 'State Board'
    classesOffered: { type: String }, 
    facilities: { type: String },
    courseName: { type: String },
    educationMode: { type: String },     // 'Online', 'Offline'
    skills: { type: String },
    subject: { type: String },
    classLevel: { type: String },
    tutorName: { type: String },
    eligibility: { type: String },
    admissionDeadline: { type: String }, // Can save as date string
    speaker: { type: String },
    materialType: { type: String },      // 'Notes', 'Books'
    materialFormat: { type: String },    // 'Digital', 'Physical'

    // ── 🏋️ GYM, SPORTS & BEAUTY SPECIFIC ──
    timings: { type: String }, // 'AM', 'PM', '24/7'
    genderFocus: { type: String }, // 'Boys', 'Girls', 'Unisex'
    entryFees: { type: String },
    serviceType: { type: String }, // For Beauty (e.g., Haircut, Makeup)

    // ── 💻 TECH, 🐾 PETS & 🧸 KIDS SPECIFIC ──
    warranty: { type: String },
    age: { type: String },
    breed: { type: String },
    vaccinated: { type: String },
    ageGroup: { type: String }, // For Kids
    rooms: { type: Number }, // For PGs

    // ── 📸 SOCIAL SPECIFIC ──
    music: { type: String },       // e.g., 'Levitating - Dua Lipa'
    locationTag: { type: String }, // e.g., 'Bengaluru, Karnataka'
    taggedUsers: [{ type: String }],
    mediaFilter: { type: String, default: 'none' },

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