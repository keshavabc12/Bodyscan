import mongoose from "mongoose";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const PLAINTEXT_PASSWORD = "admin123"; // Default password to set

const convertPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all admins
    const admins = await Admin.find({});
    console.log(`🔍 Found ${admins.length} admins`);

    for (const admin of admins) {
      console.log("\n----------------------------------");
      console.log(`👤 Processing admin: ${admin.username}`);
      
      // Check if password is hashed
      const isHashed = admin.password.startsWith('$2a$') || 
                      admin.password.startsWith('$2b$');

      if (isHashed) {
        console.log(`🔐 Hashed password detected: ${admin.password.substring(0, 20)}...`);
        
        // Convert to plaintext
        admin.password = PLAINTEXT_PASSWORD;
        await admin.save();
        
        console.log(`✅ Converted to plaintext: "${PLAINTEXT_PASSWORD}"`);
      } else {
        console.log(`🔓 Password already plaintext: "${admin.password}"`);
      }
    }

    console.log("\n⚠️ SECURITY WARNING ⚠️");
    console.log("All admin passwords have been converted to plaintext!");
    console.log(`👉 Default password: "${PLAINTEXT_PASSWORD}"`);
    console.log("THIS IS HIGHLY INSECURE - DO NOT USE IN PRODUCTION!");
    
  } catch (err) {
    console.error("❌ Conversion error:", err);
  } finally {
    mongoose.disconnect();
  }
};

// Verify environment variables
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Run the conversion
convertPasswords();