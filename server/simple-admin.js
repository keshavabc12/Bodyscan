// Simple admin creation script
// This will help you create an admin user if you don't have MongoDB set up

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

console.log('🔍 Checking environment variables...');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not set. Please set it in your environment variables.');
      return;
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      // Create new admin
      const admin = new Admin({
        username: 'admin',
        password: 'admin123'
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully');
      console.log('Username: admin');
      console.log('Password: admin123');
    }
    
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'MongoNetworkError') {
      console.error('💡 Make sure your MONGO_URI is correct and MongoDB is accessible');
    }
  }
};

createAdmin(); 