// models/product.model.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  subTypes: [{ 
    type: String 
  }],
  image: {
    type: String,  // ✅ Stores filename only, like "123-shirt.png"
    required: true,
  },
});

export default mongoose.model("Product", productSchema);
