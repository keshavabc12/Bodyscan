import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Routes
import adminRoutes from './routes/admin.routes.js';
import productRoutes from './routes/product.routes.js';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGO_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'JWT_SECRET' // Added as required
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security and performance middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Temporarily disable CSP to resolve deployment issues
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Configure CORS with enhanced flexibility
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://[::1]:3000',
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
  process.env.FRONTEND_URL,
  // Add Render.com domains
  'https://*.onrender.com',
  'https://*.render.com'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Case-insensitive origin matching
    const normalizedOrigin = origin.toLowerCase();
    
    // Check against allowed origins
    const isAllowed = allowedOrigins.some(allowed => 
      normalizedOrigin === allowed.toLowerCase() || 
      normalizedOrigin.includes('localhost') || 
      normalizedOrigin.includes('127.0.0.1') || 
      normalizedOrigin.includes('::1')
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🚫 Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Enhanced request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip} | Origin: ${req.headers.origin || 'none'} | User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'none'}`);
  next();
});

// Route registration
const registerRoute = (path, router) => {
  app.use(path, router);
  console.log(`Registered routes for: ${path}`);
};

console.log('\n===== ROUTE REGISTRATION =====');
try {
  registerRoute('/api/admin', adminRoutes);
  registerRoute('/api/products', productRoutes);
  console.log('===== ROUTES REGISTERED =====\n');
} catch (err) {
  console.error('🚨 ROUTE REGISTRATION ERROR:', err);
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working correctly',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      'user-agent': req.headers['user-agent']?.substring(0, 100)
    }
  });
});

// Production frontend serving
if (process.env.NODE_ENV === 'production') {
  const clientPath = process.env.CLIENT_BUILD_PATH 
    ? path.resolve(process.env.CLIENT_BUILD_PATH)
    : path.join(__dirname, '../client/build');

  if (fs.existsSync(clientPath)) {
    console.log(`✅ Serving frontend from: ${clientPath}`);
    app.use(express.static(clientPath, { maxAge: '7d' }));

    // Simple SPA routing without wildcard
    app.get('/', (req, res) => {
      res.sendFile(path.join(clientPath, 'index.html'));
    });
  } else {
    console.warn(`⚠️ Frontend build not found at: ${clientPath}`);
  }
} else {
  // Development mode - serve static files if they exist
  const clientPath = path.join(__dirname, '../client/build');
  if (fs.existsSync(clientPath)) {
    console.log(`✅ Serving frontend from: ${clientPath}`);
    app.use(express.static(clientPath));
  }
}

// Error handling
app.use((err, req, res, next) => {
  console.error(`🚨 [${new Date().toISOString()}] Error:`, err.message);
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    ...(err.errors && { details: err.errors })
  });
});

// MongoDB connection with retries and detailed error handling
const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    w: 'majority'
  };

  try {
    console.log('🔐 Attempting MongoDB connection...');
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    
    // Mask password in logs
    const maskedURI = process.env.MONGO_URI?.replace(/:[^@]+@/, ':****@');
    console.error(`Connection string: ${maskedURI || 'Not found'}`);
    
    console.log('Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Server startup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 Access at: http://localhost:${PORT}`);
  console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ') || 'None'}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  try {
    await new Promise(resolve => server.close(resolve));
    console.log('🔌 HTTP server closed');
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected');
    }
    
    console.log('👋 Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Shutdown error:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));