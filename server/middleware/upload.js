/**
 * middleware/upload.js
 * Configures Multer + Cloudinary storage for image and video uploads.
 * Images go to the 'reelestate/images' folder, videos to 'reelestate/videos'.
 */

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with environment credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Image Storage ─────────────────────────────────────────────────────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'reelestate/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }],
  }),
});

// ─── Video Storage ─────────────────────────────────────────────────────────────
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'reelestate/videos',
    allowed_formats: ['mp4', 'mov', 'webm'],
    resource_type: 'video',
    transformation: [{ quality: 'auto' }],
  }),
});

// ─── Profile Photo Storage ─────────────────────────────────────────────────────
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'reelestate/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  }),
});

// File size limits
const imageLimits = { fileSize: 10 * 1024 * 1024 };   // 10MB per image
const videoLimits = { fileSize: 200 * 1024 * 1024 };   // 200MB per video

// Export configured multer instances
const uploadImages = multer({ storage: imageStorage, limits: imageLimits });
const uploadVideo = multer({ storage: videoStorage, limits: videoLimits });
const uploadProfile = multer({ storage: profileStorage, limits: imageLimits });

// Helper: delete a file from Cloudinary by public_id
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { uploadImages, uploadVideo, uploadProfile, deleteFromCloudinary, cloudinary };
