// FORCE UPDATE TO SUPER APP
/**
 * constants/categories.js
 * The Master List for the Super App Ecosystem
 */

export const MAIN_CATEGORIES = [
  // ── CORE: REAL ESTATE & LIVING ──
  { id: 'social', name: 'Social', icon: '📸' }, // This is your "Insta" mode!
  { id: 'sale-hub', name: 'Sale Hub', icon: '🏠' },
  { id: 'rents', name: 'Rents', icon: '🔑' },
  { id: 'pgs', name: 'PGs & Co-Living', icon: '🛏️' },
  { id: 'home-services', name: 'Home Services', icon: '🛠️' },
  
  // ── CAREER & ECONOMY ──
  { id: 'jobs', name: 'Jobs & Gigs', icon: '💼' },
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'marketplace', name: 'Marketplace', icon: '🛒' },
  { id: 'auto', name: 'Auto & Motors', icon: '🚗' },
  
  // ── LIFESTYLE & ENTERTAINMENT ──
  { id: 'food', name: 'Food & Cafes', icon: '🍔' },
  { id: 'events', name: 'Local Events', icon: '🎟️' },
  { id: 'cinema', name: 'Cinema', icon: '🍿' },
  { id: 'travel', name: 'Travel & Trips', icon: '✈️' },
  
  // ── WELLNESS & HOBBIES ──
  { id: 'fitness', name: 'Gym & Fitness', icon: '💪' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'beauty', name: 'Beauty & Care', icon: '✨' },
  { id: 'tech', name: 'Tech & Gadgets', icon: '💻' },
  { id: 'pets', name: 'Pets', icon: '🐾' },
  { id: 'kids', name: 'Kids', icon: '🧸' },
];

// Sub-categories specifically for when "Sale Hub" is active
export const SALE_HUB_SUBS = ['All', 'Villas', 'Apartments', 'Plots', 'Commercial', 'Farmhouses'];

// Sub-categories specifically for when "Rents" is active
export const RENT_SUBS = ['All', '1 BHK', '2 BHK', '3+ BHK', 'Offices', 'Shops'];

// --- DATA FOR DROPDOWNS ---
export const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'plot', 'commercial', 'farmland', 'other'];

export const KNOWLEDGE_LEVELS = ['Beginner', 'Intermediate', 'Expert', 'Pro Tips'];

// This helps your CreatePostPage dropdown stay in sync with the icons
export const CATEGORY_NAMES = ['Social', 'Sale Hub', 'Rents', 'Jobs & Gigs', 'Education', 'Marketplace'];