import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  // Validate JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('❌ JWT verification error:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
};

export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    console.warn('⚠️ Unauthorized admin access attempt by:', req.user?.id);
    return res.status(403).json({ message: 'Admin access required' });
  }
};