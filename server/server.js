import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import adminRoutes from './routes/admin.routes.js';
import productRoutes from './routes/product.routes.js';

dotenv.config();

// Enhanced environment validation
const requiredEnvVars = ['MONGO_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
requiredEnvVars.forEach(varName => {
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

// Production CORS setup
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN : '',
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL : ''
].filter(Boolean); // Remove empty strings

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Preflight handling
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '50mb' }));  // Increased for image uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Request logger (more detailed in development)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
  }
  next();
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version
  });
});

// Serve frontend React build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  app.use(express.static(clientBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err);
  
  // Handle specific errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Generic error response
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// MongoDB connection with retry logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    w: 'majority'
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

mongoose.connection.on('error', (err) => console.error('❌ MongoDB runtime error:', err));
mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected'));

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 Access at: http://localhost:${PORT}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ') || 'None'}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`🛑 Received ${signal}. Shutting down gracefully...`);
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

process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Rejection:', err);
  shutdown('unhandledRejection');
});