const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../../db');

const jwt_secret = process.env.JWT_SECRET || 'your_jwt_secret';

const register = async (req, res) => {
  const { email, username, password } = req.body;

  // Validate required fields
  if (!email || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists based on email or username
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password with a salt round of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const result = await db.query(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashedPassword]
    );

    // Get the inserted user's ID
    const userId = result[0].insertId;

    // Generate a JWT token with a 1-hour expiration
    const token = jwt.sign({ id: userId, email, username }, jwt_secret, {
      expiresIn: '1h',
    });

    // Send back a success response with the token
    res.status(201).json({
      message: 'User registered successfully',
      token,
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate that both email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Fetch the user by email
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    // If no user is found, respond with an error
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token that expires in 1 hour
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      jwt_secret,
      { expiresIn: '1h' }
    );

    // Respond with the token if login is successful
    res.status(200).json({ message: 'Logged in successfully', token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  // Add other functions as needed
};
