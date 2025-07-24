import Product from "../models/Product.js";

// ✅ Get all products (Public)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    console.log("✅ Fetched products:", products.length);
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// ✅ Add new product (Admin only)
export const addProduct = async (req, res) => {
  try {
    const { category, subTypes } = req.body;
    const imageUrl = req.file?.path || req.file?.filename || null;

    // Input validation
    if (!category || !subTypes || !imageUrl) {
      return res.status(400).json({
        error: "Category, subTypes, and image are required",
      });
    }

    // Ensure subTypes is an array
    const parsedSubTypes = Array.isArray(subTypes)
      ? subTypes
      : subTypes
          .split(",")
          .map((type) => type.trim())
          .filter(Boolean);

    if (parsedSubTypes.length === 0) {
      return res.status(400).json({
        error: "subTypes must be a non-empty array or comma-separated string",
      });
    }

    // Create and save product
    const newProduct = new Product({
      category: category.trim(),
      subTypes: parsedSubTypes,
      image: imageUrl,
    });

    await newProduct.save();
    console.log("✅ Product added:", newProduct._id);

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("❌ Add Product Error:", err.message);
    res.status(500).json({ error: "Failed to add product" });
  }
};

// ✅ Delete product by ID (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("✅ Deleted product:", id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Product Error:", err.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
