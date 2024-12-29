const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();
const {db} = require('../../db'); // Import the shared database connection
const jwt_secret = process.env.JWT_SECRET;

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  jwt.verify(token, jwt_secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid' });
    }
    req.user = user; // Attach user to request object
    next();
  });
};

// Register route
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    await db.query(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile-all', async (req, res) => {
  try {
    const query = 'SELECT * FROM users';
    const [rows] = await db.execute(query);

    res
      .status(200)
      .json({ message: 'All users retrieved successfully', data: rows });
  } catch (error) {
    console.error('Error retrieving all calendars:', error);
    res
      .status(500)
      .json({
        message: 'Failed to retrieve users profile',
        error: error.message,
      });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Fetch user by email
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      jwt_secret,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Logged in successfully', token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route
router.get('/profile', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Profile data', user: req.user });
});

// Delete account route
router.delete('/delete-account', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Delete user from the database
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
