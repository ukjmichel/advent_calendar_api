const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // Import authentication routes
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for all origins
// You can configure it to allow specific origins if needed
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

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is up and running!' });
});

// Routes
app.use('/auth', authRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
