import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const setupAdmin = async () => {
  try {
    await connectDB();

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Username: admin');
      console.log('Password: (already set)');
    } else {
      // Create default admin
      const admin = new Admin({
        username: 'admin',
        password: 'admin123' // Change this in production!
      });
      
      await admin.save();
      console.log('✅ Default admin user created');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('⚠️  IMPORTANT: Change this password in production!');
    }

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Setup error:', err);
    process.exit(1);
  }
};

setupAdmin(); 