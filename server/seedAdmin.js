// seedAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js"; // Adjust path as needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    // Check if admin already exists
    const existing = await Admin.findOne({ username: "admin" });
    if (existing) {
      console.log("Admin already exists");
    } else {
      const newAdmin = new Admin({
        username: "admin",
        password: "admin123", // ⚠️ Store hashed password in production
      });

      await newAdmin.save();
      console.log("Admin created successfully");
    }

    mongoose.disconnect();
  } catch (err) {
    console.error("Error creating admin:", err);
    mongoose.disconnect();
  }
};

seedAdmin();
