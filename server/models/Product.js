// models/product.model.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, "Product category is required"],
    trim: true,
  },
  subTypes: [
    {
      type: String,
      trim: true,
    }
  ],
  image: {
    type: String, // Stores Cloudinary URL like "https://res.cloudinary.com/..."
    required: [true, "Product image is required"],
  },
}, {
  timestamps: true // ✅ Adds createdAt and updatedAt automatically
});

export default mongoose.model("Product", productSchema);
