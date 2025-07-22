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

dotenv.config();

// Environment validation
const requiredEnvVars = [
  'MONGO_URI', 
  'CLOUDINARY_CLOUD_NAME', 
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET'
];

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

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL
].filter(origin => origin); // Remove falsy values

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Preflight handling
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ===========================================
// ROUTE DEBUGGING - THIS WILL FIND THE BAD ROUTE
// ===========================================
const printRoutes = (router, prefix = '') => {
  router.stack.forEach(middleware => {
    if (middleware.route) {
      // Direct route
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      console.log(`Route: ${methods} ${prefix}${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      // Router middleware
      const routerPrefix = prefix + (middleware.regexp.source.replace('\\/?', '').replace('(?=\\/|$)', '') || '');
      printRoutes(middleware.handle, routerPrefix);
    }
  });
};

// ===========================================
// SAFE ROUTE REGISTRATION WITH ERROR HANDLING
// ===========================================
try {
  console.log('Registering admin routes...');
  app.use('/api/admin', adminRoutes);
  
  console.log('Registering product routes...');
  app.use('/api/products', productRoutes);
  
  console.log('\nAll registered API routes:');
  printRoutes(app._router);
} catch (err) {
  console.error('🚨 Route registration error:', err);
  process.exit(1);
}

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

// Test route to verify basic functionality
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  
  if (fs.existsSync(clientBuildPath)) {
    console.log('✅ Serving frontend from:', clientBuildPath);
    app.use(express.static(clientBuildPath));
    
    // Catch-all route for client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    console.warn('⚠️ Frontend build not found. Skipping frontend serving.');
  }
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// MongoDB connection with retry
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

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Rejection:', err);
  shutdown('unhandledRejection');
});