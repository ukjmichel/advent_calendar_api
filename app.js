const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');
const fs = require('fs');
const cors = require('cors');
//import router
const authRouter = require('./src/routes/authRoutes'); // Import the auth routes
const imagesRouter = require('./src/routes/imagesRoutes');
//import .env variable
require('dotenv').config();

// Initialize the app
const app = express();

// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:4200', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Allow cookies if needed
  })
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static image files
app.use('/image', express.static(path.join(__dirname, 'public/image')));

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is up and running!' });
});

// Use authRouter for authentication-related routes
app.use('/auth', authRouter);
// Use image routes
app.use('/api', imagesRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;