const jwt = require('jsonwebtoken');

// Secret key for signing JWTs (use environment variable in production)
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Middleware function for authentication
const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1]; // Expected format: "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: 'Token is missing' });
    }

    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY);

    // Attach the decoded user information to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authMiddleware;
