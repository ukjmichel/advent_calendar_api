const mysql = require('mysql2/promise');
const mongoose = require('mongoose');

// Create a MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'osadmin', // Replace with your MySQL username
  password: 'adminADMIN69400', // Replace with your MySQL password
  database: 'oseznoeldb',
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
