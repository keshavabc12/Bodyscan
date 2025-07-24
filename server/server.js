import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import adminRoutes from './routes/admin.routes.js';
import productRoutes from './routes/product.routes.js';

dotenv.config();

// Check for required env vars
const requiredEnvVars = [
  'MONGO_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ ${varName} is not defined in environment variables`);
    process.exit(1);
  }
});

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not found! Using fallback');
  process.env.JWT_SECRET = 'temporary_dev_secret_' + Date.now();
}

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL
].filter(Boolean);

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Route registration
console.log('\n===== START ROUTE REGISTRATION =====');
try {
  console.log('Registering admin routes...');
  app.use('/api/admin', adminRoutes);

  console.log('Registering product routes...');
  app.use('/api/products', productRoutes);
  console.log('===== END ROUTE REGISTRATION =====\n');
} catch (err) {
  console.error('🚨 FATAL ROUTE REGISTRATION ERROR:', err);
  process.exit(1);
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');

  if (fs.existsSync(clientBuildPath)) {
    console.log('✅ Serving frontend from:', clientBuildPath);
    app.use(express.static(clientBuildPath));

    // ✅ FIXED: Use regex pattern instead of string wildcard
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    console.warn('⚠️ Frontend build not found. Skipping frontend serving.');
  }
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// MongoDB connection
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    w: 'majority'
  })
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      console.log('Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 Access at: http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`🛑 Received ${signal}. Shutting down...`);
  server.close(async () => {
    console.log('🔌 HTTP server closed');
    try {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected');
      process.exit(0);
    } catch (err) {
      console.error('❌ Shutdown error:', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));