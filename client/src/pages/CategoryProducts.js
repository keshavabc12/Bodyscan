import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";

function CategoryProducts() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/api/products")
      .then(res => {
        const filtered = res.data.filter(
          product => product.category.toLowerCase() === categoryName.toLowerCase()
        );
        setProducts(filtered);
      })
      .catch(err => console.error("Failed to load category products:", err));
  }, [categoryName]);

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-capitalize">{categoryName} - Varieties</h2>
      <div className="row">
        {products.map(product => {
          const imageUrl = product.image; // Use the full Cloudinary URL
          return (
            <div key={product._id} className="col-md-4 mb-4">
              <div className="card h-100 text-center shadow-sm">
                <img
                  src={imageUrl || "https://via.placeholder.com/300x400?text=No+Image"}
                  alt={product.category}
                  className="card-img-top img-fluid p-3"
                  style={{ maxHeight: '350px', objectFit: 'contain' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.category}</h5>
                  <p className="text-muted">
                    {Array.isArray(product.subTypes) ? product.subTypes.join(", ") : "No sub-types"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {products.length === 0 && <p>No products found in this category.</p>}
      </div>
    </div>
  );
}

export default CategoryProducts;
