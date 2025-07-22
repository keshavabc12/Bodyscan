// middleware/upload.js
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define Cloudinary storage for multer
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 600, height: 600, crop: 'limit' }],
    public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
  },
});

// Export the multer upload middleware
export const upload = multer({ storage: cloudinaryStorage });
