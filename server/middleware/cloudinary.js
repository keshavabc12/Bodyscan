import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up storage engine for Multer using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'product_images',  // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }] // Optional: resize uploaded images
  },
});

// Multer middleware for file upload
const upload = multer({ storage });

export { upload, cloudinary };
