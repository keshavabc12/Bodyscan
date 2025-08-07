import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubtype, setSelectedSubtype] = useState("All");
  const [subtypes, setSubtypes] = useState([]);
  const navigate = useNavigate();

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    api
      .get("/api/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);

        const subtypeSet = new Set();
        res.data.forEach((product) => {
          if (Array.isArray(product.subTypes)) {
            product.subTypes.forEach((sub) => subtypeSet.add(sub));
          }
        });

        setSubtypes(["All", ...Array.from(subtypeSet)]);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/api/products/${productId}`);
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const filteredProducts =
    selectedSubtype === "All"
      ? products
      : products.filter(
          (product) =>
            Array.isArray(product.subTypes) &&
            product.subTypes.includes(selectedSubtype)
        );

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div
        className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 text-white"
        style={{ backgroundColor: "black" }}
      >
        <img
          src="/images/logo.jpeg"
          alt="E-Kart Logo"
          style={{
            height: "60px",
            objectFit: "contain",
            borderRadius: "8px",
          }}
          onError={(e) =>
            (e.target.src = "https://via.placeholder.com/150x60?text=No+Logo")
          }
        />
        <div className="d-flex align-items-center gap-3 flex-wrap mt-3 mt-md-0">
          {subtypes.length > 1 && (
            <select
              className="form-select"
              value={selectedSubtype}
              onChange={(e) => setSelectedSubtype(e.target.value)}
            >
              {subtypes.map((sub, idx) => (
                <option key={idx} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}

          {!isAdmin ? (
            <Link to="/admin" className="btn btn-light">
              Admin Login
            </Link>
          ) : (
            <>
              <Link to="/admin-panel" className="btn btn-light">
                Add Product
              </Link>
              <button
                className="btn btn-outline-light"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Slider */}
      <div
        id="carouselExample"
        className="carousel slide mb-4"
        data-bs-ride="carousel"
        data-bs-interval="3000"
      >
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src="/images/sliderl.jpeg"
              className="d-block w-100"
              alt="Slide 1"
            />
            <div className="carousel-caption d-none d-md-block">
              <div className="container">
                <div className="row">
                  <div className="col-lg-8 col-md-10">
                    <h2 className="display-5 fw-bold mb-3">Summer Collection 2024</h2>
                    <p className="lead mb-4">Discover the latest summer trends and styles.</p>
                    <button className="btn btn-light btn-lg">
                      <i className="bi bi-arrow-right me-2"></i>
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src="/images/sli.jpeg"
              className="d-block w-100"
              alt="Slide 2"
            />
            <div className="carousel-caption d-none d-md-block">
              <div className="container">
                <div className="row">
                  <div className="col-lg-8 col-md-10">
                    <h2 className="display-5 fw-bold mb-3">Premium Quality</h2>
                    <p className="lead mb-4">Only the finest materials and craftsmanship.</p>
                    <button className="btn btn-light btn-lg">
                      <i className="bi bi-award me-2"></i>
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src="/images/slider.jpeg"
              className="d-block w-100"
              alt="Slide 3"
            />
            <div className="carousel-caption d-none d-md-block">
              <div className="container">
                <div className="row">
                  <div className="col-lg-8 col-md-10">
                    <h2 className="display-5 fw-bold mb-3">Exclusive Deals</h2>
                    <p className="lead mb-4">Limited time offers on selected items.</p>
                    <button className="btn btn-light btn-lg">
                      <i className="bi bi-tag me-2"></i>
                      View Offers
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Product Cards */}
      <div className="container">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="row">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const imageUrl = product.image;

                return (
                  <div key={product._id} className="col-md-4 mb-4">
                    <div
                      className="card h-100 shadow-sm text-center border-0"
                      style={{
                        transition: "transform 0.3s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      onClick={() => navigate(`/category/${product.category}`)}
                    >
                      <img
                        src={
                          imageUrl
                            ? imageUrl
                            : "https://via.placeholder.com/300x400?text=No+Image"
                        }
                        alt={product.category}
                        className="card-img-top img-fluid p-3"
                        style={{
                          maxHeight: "350px",
                          objectFit: "contain",
                          borderRadius: "10px",
                        }}
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/300x400?text=Image+Not+Found")
                        }
                      />
                      <div className="card-body">
                        <h5 className="card-title">{product.category}</h5>
                        {Array.isArray(product.subTypes) &&
                        product.subTypes.length > 0 ? (
                          <ul className="list-group list-group-flush mb-2">
                            {product.subTypes.map((type, i) => (
                              <li key={i} className="list-group-item">
                                {type}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">No sub-types</p>
                        )}
                        {isAdmin && (
                          <button
                            className="btn btn-outline-danger btn-sm mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product._id);
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center">No products found.</p>
            )}
          </div>
        )}
      </div>


    </div>
  );
}

export default Home;
