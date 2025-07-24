import express from "express";
import {
  getAllProducts,
  addProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { upload } from "../middleware/cloudinary.js";
import { authenticateToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Public Route - Fetch all products
router.get("/", getAllProducts);

// ✅ Admin-only - Add new product with image upload
router.post(
  "/",                        // Endpoint: POST /api/products/
  authenticateToken,         // Middleware: Check if logged in
  verifyAdmin,               // Middleware: Check if user is admin
  upload.single("image"),    // Upload image using Cloudinary
  addProduct                 // Controller to handle product creation
);

// ✅ Admin-only - Delete product by ID
router.delete(
  "/:id",                    // Endpoint: DELETE /api/products/:id
  authenticateToken,
  verifyAdmin,
  deleteProduct
);

export default router;
