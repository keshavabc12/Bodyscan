import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    const username = "admin7";
    const password = "admin123";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log("ℹ️ Admin account already exists");
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new admin
      const newAdmin = new Admin({
        username,
        password: hashedPassword
      });

      await newAdmin.save();
      console.log("✅ Admin created successfully");
      console.log(`👉 Username: ${username}`);
      console.log(`👉 Password: ${password}`);
    }

  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  } finally {
    mongoose.disconnect();
  }
};

seedAdmin();