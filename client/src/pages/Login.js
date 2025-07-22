import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/admin/login", { 
        username, 
        password 
      }, {
        validateStatus: (status) => status >= 200 && status < 500
      });

      if (response.status === 200) {
        // Save token and user info
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("username", response.data.user.username);
        
        // Navigate to admin panel
        navigate("/admin-panel");
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          setError("❌ Invalid credentials. Please try again.");
        } else if (response.status === 500) {
          setError("⚠️ Server error. Please try again later.");
        } else {
          setError(`Unexpected error: ${response.status}`);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle different error types
      if (err.response) {
        setError("Server error. Please try again.");
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-sm" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="mb-4 text-center">Admin Login</h2>
        <p className="text-muted text-center mb-4">
          Access your store management dashboard
        </p>

        {error && (
          <div className="alert alert-danger d-flex align-items-center">
            <i className="bi bi-exclamation-circle me-2"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
              </button>
            </div>
          </div>

          <div className="d-grid mb-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !username || !password}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
          
          <div className="text-center mt-3">
            <small className="text-muted">
              Forgot password? Contact system administrator
            </small>
          </div>
        </form>
      </div>
      
      <div className="mt-4 text-center">
        <small className="text-muted">
          Secure access • v1.0.0
        </small>
      </div>
    </div>
  );
}

export default Login;