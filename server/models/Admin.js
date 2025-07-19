// models/Admin.js

import mongoose from "mongoose";

// Define the schema
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  }
});

// Explicitly set the collection name to "admins"
export default mongoose.model("Admin", adminSchema, "admins");
