// middleware/auth.js
import jwt from 'jsonwebtoken';

// Middleware to check if user is authenticated
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Access token missing' });

  // Fixed: Use JWT_SECRET with fallback
  const secret = process.env.JWT_SECRET || 'yourSecretKey';
  
  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user;
    next();
  });
};

// Middleware to check if the user is an admin
export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // ✅ User is admin
  } else {
    return res.status(403).json({ message: 'Admin access required' });
  }
};