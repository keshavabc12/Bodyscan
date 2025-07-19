import Product from "../models/Product.js";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    console.log("Fetched products:", products);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const { category } = req.body;
    let { subTypes } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    if (!category || !subTypes || !imagePath) {
      return res.status(400).json({ message: "All fields are required including image." });
    }

    if (typeof subTypes === "string") {
      subTypes = subTypes.split(',').map(s => s.trim());
    }

    const product = new Product({
      category,
      subTypes,
      image: imagePath,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });

  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    let { subTypes } = req.body;

    const updatedFields = {};

    if (category) updatedFields.category = category;

    if (subTypes) {
      if (typeof subTypes === "string") {
        subTypes = subTypes.split(',').map(s => s.trim());
      }
      updatedFields.subTypes = subTypes;
    }

    if (req.file) {
      updatedFields.image = req.file.filename; // Save new image filename
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product: updatedProduct });

  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};
