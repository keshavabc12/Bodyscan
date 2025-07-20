import express from "express";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { upload } from "../middleware/upload.js";
import { authenticateToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Public route - Get all products
router.get("/", getAllProducts);

// ✅ Admin-only - Add a new product (image upload, no ID in route)
router.post("/", authenticateToken, verifyAdmin, upload.single("image"), addProduct);

// ✅ Admin-only - Update product by ID
router.put("/:id", authenticateToken, verifyAdmin, upload.single("image"), updateProduct);

// ✅ Admin-only - Delete product by ID
router.delete("/:id", authenticateToken, verifyAdmin, deleteProduct);

export default router;
