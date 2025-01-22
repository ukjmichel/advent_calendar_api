const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

// Create a MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, // Replace with your MySQL username
  password: process.env.DB_PASSWORD, // Replace with your MySQL password
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// MongoDB Connection URL
// Replace with your MongoDB credentials and database details
const mongoURI =
  'mongodb+srv://osAdmin:osezNoelPassword69400@cluster0.sv6yc.mongodb.net/osezNoeldb?retryWrites=true&w=majority';

// MongoDB Connection
mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Export both MySQL and Mongoose connections
module.exports = { db, mongoose };
