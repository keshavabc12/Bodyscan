import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/admin/login", { username, password });

      // Save token and isAdmin flag
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isAdmin", "true");

      // ✅ Navigate to admin panel after login
      navigate("/admin-panel");
    } catch (err) {
      console.error("Login error:", err);
      setError("❌ Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-sm" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="mb-4 text-center">Admin Login</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="form-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          onClick={login}
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

export default Login;
