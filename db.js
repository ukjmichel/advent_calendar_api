const mysql = require('mysql2/promise');

// Create a connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'osadmin', // Replace with your MySQL username
  password: 'adminADMIN69400', // Replace with your MySQL password
  database: 'oseznoeldb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export the pool
module.exports = db;
