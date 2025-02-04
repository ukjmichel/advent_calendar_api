const jwt = require('jsonwebtoken');

const jwt_secret = process.env.JWT_SECRET || 'your_jwt_secret';

// Secret key for signing JWTs (use environment variable in production)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  jwt.verify(token, jwt_secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid' });
    }
    req.user = user; // Attach the token's payload to req.user
    next();
  });
};

module.exports = authMiddleware;
