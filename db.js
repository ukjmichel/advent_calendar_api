const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost', // Replace with your database host
  user: 'osadmin', // Replace with your MySQL username
  password: 'adminADMINcreate69400.', // Replace with your MySQL password
  database: 'oseznoeldb', // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export the pool
module.exports = pool.promise();
