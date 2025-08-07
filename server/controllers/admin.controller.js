import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  console.log('🔐 Login attempt received:', { 
    username: req.body.username ? 'provided' : 'missing',
    password: req.body.password ? 'provided' : 'missing',
    body: req.body 
  });

  const { username, password } = req.body;

  if (!username || !password) {
    console.log('❌ Missing credentials');
    return res.status(400).json({ error: "Username and password are required" });
  }

  const normalizedUsername = username.toLowerCase().trim();
  console.log('🔍 Looking for admin with username:', normalizedUsername);

  try {
    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not set');
      return res.status(500).json({ error: "Server configuration error" });
    }

    const admin = await Admin.findOne({ username: normalizedUsername });
    console.log('🔍 Admin found:', admin ? 'yes' : 'no');

    if (!admin) {
      console.log('❌ Admin not found');
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Plain text comparison
    if (password !== admin.password) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log('✅ Credentials valid, generating JWT...');

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log('✅ Login successful for admin:', admin.username);

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
    console.error("🔥 Error stack:", err.stack);
    return res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};