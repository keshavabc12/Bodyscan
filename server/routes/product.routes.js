import express from "express";
import {
  getAllProducts,
  addProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

// Fixed: Use single upload middleware import
import { upload } from "../middleware/cloudinary.js";

// Auth middlewares
import { authenticateToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Public - Get all products
router.get("/", getAllProducts);

// ✅ Admin-only - Add product with image upload
router.post(
  "/",
  authenticateToken,
  verifyAdmin,
  upload.single("image"),
  addProduct
);

// ✅ Admin-only - Delete product by ID
router.delete("/:id", authenticateToken, verifyAdmin, deleteProduct);

export default router;