import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

const verifyAndRepair = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const admins = await Admin.find({});
    console.log(`🔍 Found ${admins.length} admins`);
    
    for (const admin of admins) {
      console.log("\n----------------------------------");
      console.log(`👤 Verifying admin: ${admin.username}`);
      
      // Check hash format
      const isHashValid = admin.password.startsWith('$2a$') || 
                          admin.password.startsWith('$2b$');
      
      console.log(`🔐 Hash valid: ${isHashValid}`);
      console.log(`📏 Hash length: ${admin.password.length}`);
      
      if (!isHashValid) {
        console.log("❌ Invalid hash format - resetting password");
        const newPassword = "TempPassword123!";
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        await admin.save();
        console.log(`✅ Password reset to: ${newPassword}`);
      } else {
        // Test password with itself
        const isValid = await bcrypt.compare("test", admin.password)
          .then(() => true)
          .catch(err => {
            console.error("❌ Hash validation error:", err.message);
            return false;
          });
        
        console.log(`🧪 Hash validation: ${isValid ? "✅ Valid" : "❌ Invalid"}`);
      }
    }
    
  } catch (err) {
    console.error("❌ Verification error:", err);
  } finally {
    mongoose.disconnect();
  }
};

verifyAndRepair();