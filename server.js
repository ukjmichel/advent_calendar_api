// server.js
const app = require('./app'); // Import the app module
require('dotenv').config();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
