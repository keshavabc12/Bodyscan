import express from "express";
import {
  getAllProducts,
  addProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { upload } from "../middleware/cloudinary.js";
import { authenticateToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllProducts);

router.post(
  "/",
  authenticateToken,
  verifyAdmin,
  upload.single("image"),
  addProduct
);

router.delete(
  "/:id",
  authenticateToken,
  verifyAdmin,
  deleteProduct
);

export default router;