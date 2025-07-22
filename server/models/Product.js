// models/product.model.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  subTypes: [
    { type: String }
  ],
  image: {
    type: String, // ✅ Stores full Cloudinary URL like "https://res.cloudinary.com/..."
    required: true,
  },
});

export default mongoose.model("Product", productSchema);
