import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt for: ${username}`);

  try {
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    
    if (!admin) {
      console.log(`Admin not found: ${username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // TEMPORARY: Plain text comparison
    const isMatch = password === admin.password;
    
    if (!isMatch) {
      console.log(`Password mismatch for: ${username}`);
      console.log(`Input: "${password}" | Stored: "${admin.password}"`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: admin._id, username: admin.username } });
    
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};