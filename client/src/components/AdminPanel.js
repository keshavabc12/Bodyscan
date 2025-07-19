import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddProduct() {
  const [category, setCategory] = useState("");
  const [subtypes, setSubtypes] = useState("");
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setError("❌ Please upload a JPG or PNG image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("❌ File size should be less than 5MB.");
        return;
      }
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!category.trim() || !subtypes.trim() || !image) {
      setError("❌ All fields including an image are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("category", category);
      formData.append("subTypes", subtypes);
      formData.append("image", image);

      const token = localStorage.getItem("token");

      const response = await axios.post("http://localhost:5000/api/products", formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Product added:", response.data);
      setMessage("✅ Product added successfully!");

      // Reset fields
      if (formRef.current) formRef.current.reset();
      setCategory("");
      setSubtypes("");
      setImage(null);
      setPreviewURL("");

      // Redirect after delay
      setTimeout(() => {
        navigate("/admin-panel");
      }, 1000);
    } catch (err) {
      console.error("❌ Error adding product:", err);
      if (err.response?.data?.message) {
        setError(`❌ ${err.response.data.message}`);
      } else if (err.message === "Network Error") {
        setError("❌ Network error. Check your backend server.");
      } else {
        setError("❌ Failed to add product. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 fw-bold">➕ Add New Clothing Product</h2>

      <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Category</label>
          <input
            type="text"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Shirt, Pant"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Subtypes (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            value={subtypes}
            onChange={(e) => setSubtypes(e.target.value)}
            placeholder="e.g., Cotton, Denim"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Product Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
            required
          />
          {previewURL && (
            <div className="mt-3">
              <img
                src={previewURL}
                alt="Preview"
                style={{ width: "200px", height: "auto", borderRadius: "10px" }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-success"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Product"}
        </button>
      </form>

      {message && <div className="alert alert-success mt-3">{message}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}

export default AddProduct;
