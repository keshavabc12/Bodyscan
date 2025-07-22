import Product from "../models/Product.js";

// GET all products (public)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    console.log("Fetched products:", products);
    res.json(products);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// POST Add new product (admin only)
export const addProduct = async (req, res) => {
  try {
    const { category } = req.body;
    let { subTypes } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    // Improved validation
    if (!category || !subTypes || !imageUrl) {
      return res.status(400).json({ 
        message: "Category, subTypes and image are required" 
      });
    }

    // Handle subTypes string
    if (typeof subTypes === "string") {
      subTypes = subTypes.split(",").map(s => s.trim());
    }

    // Validate subTypes array (FIXED: removed extra parenthesis)
    if (!Array.isArray(subTypes)) {
      return res.status(400).json({ 
        message: "subTypes must be an array or comma-separated string" 
      });
    }

    const product = new Product({ category, subTypes, image: imageUrl });
    await product.save();

    res.status(201).json({ message: "Product added successfully", product });

  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
};

// DELETE product by ID (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });

  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};