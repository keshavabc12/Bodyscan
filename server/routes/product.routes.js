import express from "express";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

// ✅ Use Cloudinary-based multer upload middleware
import { upload } from "../middleware/cloudinary.js";

// ✅ Auth middlewares
import { authenticateToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Public route - Get all products
router.get("/", getAllProducts);

// ✅ Admin-only - Add a new product with image upload to Cloudinary
router.post("/", authenticateToken, verifyAdmin, upload.single("image"), addProduct);

// ✅ Admin-only - Update product with new image if provided
router.put("/:id", authenticateToken, verifyAdmin, upload.single("image"), updateProduct);

// ✅ Admin-only - Delete product by ID
router.delete("/:id", authenticateToken, verifyAdmin, deleteProduct);

export default router;
