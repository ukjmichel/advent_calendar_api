const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

// Import the upload controller
const { uploadImage } = require('../controllers/uploadController');

// Route for uploading and resizing images
router.post('/upload', auth, upload, uploadImage);

module.exports = router;
