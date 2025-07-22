import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const verifyAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const admins = await Admin.find({});
    
    if (admins.length === 0) {
      console.log("❌ No admin accounts found");
      return;
    }

    console.log("📋 Admin Accounts:");
    admins.forEach(admin => {
      console.log(`- Username: ${admin.username}`);
      console.log(`- Password: ${admin.password.substring(0, 20)}... (hashed)`);
      console.log(`- Created: ${admin.createdAt}`);
      console.log("----------------------------------");
    });

  } catch (err) {
    console.error("❌ Verification error:", err);
  } finally {
    mongoose.disconnect();
  }
};

verifyAdmins();