// server.js or index.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes
import adminRoutes from './routes/admin.routes.js';
import productRoutes from './routes/product.routes.js';

// Load environment variables
dotenv.config();

// Define current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();

// === ✅ Environment Validation ===
const requiredEnvVars = [
  'MONGO_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing env: ${key}`);
    process.exit(1);
  }
});

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not defined, using fallback');
  process.env.JWT_SECRET = 'fallback_' + Date.now();
}

// === ✅ Middleware Setup ===
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logger for requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// === ✅ API Routes ===
console.log('\n== ROUTE REGISTRATION ==');
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);

// === ✅ Health Check ===
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: process.env.NODE_ENV || 'development'
  });
});

// === ✅ Serve React Frontend in Production ===
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'client/build');
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));

    // Serve index.html for all non-API routes
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });

    console.log('✅ Serving frontend from:', clientBuildPath);
  } else {
    console.warn('⚠️ client/build folder not found.');
  }
}

// === ✅ Global Error Handler ===
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Something went wrong',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// === ✅ MongoDB Connection ===
const connectDB = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('✅ MongoDB connected');
  }).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    setTimeout(connectDB, 5000);
  });
};

connectDB();

// === ✅ Start Server ===
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} (${process.env.NODE_ENV})`);
});

// === ✅ Graceful Shutdown ===
const shutdown = (signal) => {
  console.log(`🛑 Received ${signal}, shutting down...`);
  server.close(() => {
    mongoose.disconnect().then(() => {
      console.log('🔌 MongoDB disconnected');
      process.exit(0);
    }).catch(err => {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    });
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
