import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const normalizedUsername = username.toLowerCase().trim();

  try {
    const admin = await Admin.findOne({ username: normalizedUsername });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Plain text comparison
    if (password !== admin.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        username: admin.username
      }
    });

  } catch (err) {
    console.error("🔥 Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};