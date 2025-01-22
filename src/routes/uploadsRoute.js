const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const auth = require('../middlewares/authMiddleware');
const path = require('path');

const router = express.Router();

// Route for uploading and resizing images
router.post('/upload', auth, upload, (req, res) => {
  if (!req.resizedFile) {
    return res.status(500).json({
      message: 'Error: Resized file not found',
    });
  }

  // Extract file name from the full path
  const fileName = path.basename(req.resizedFile);

  // Send the file name in the response
  res.status(200).json({
    message: 'Image uploaded and resized successfully!',
    resizedFile: fileName, // Only the file name is sent
  });
});

module.exports = router;
