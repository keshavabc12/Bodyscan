import express from "express";
import {
  getAllProducts,
  addProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { upload } from "../middleware/cloudinary.js";
import { authenticateToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Debug helper to catch malformed routes
const wrapRoute = (method, path, ...handlers) => {
  try {
    // Validate route path syntax
    if (path.includes(':/') || path.endsWith(':') || (path.match(/:/g) || []).length > (path.match(/\/:[a-zA-Z0-9_]+/g) || []).length) {
      throw new Error(`Invalid route pattern: ${method.toUpperCase()} ${path}`);
    }
    return router[method](path, ...handlers);
  } catch (err) {
    console.error(`🚨 Route registration error: ${err.message}`);
    throw err; // Rethrow to fail fast during startup
  }
};

// Public - Get all products
wrapRoute('get', '/', getAllProducts);

// Admin-only - Add product
wrapRoute(
  'post',
  '/',
  authenticateToken,
  verifyAdmin,
  upload.single("image"),
  addProduct
);

// Admin-only - Delete product
wrapRoute('delete', '/:id', authenticateToken, verifyAdmin, deleteProduct);

export default router;