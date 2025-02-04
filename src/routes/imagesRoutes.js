const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Route to fetch the list of images
router.get('/images', imageController.getImagesController);

// Route to serve a specific image file
router.get('/image-file', imageController.serveImageFile);

// Route to serve a specific uploaded image file
router.get('/image-upload', imageController.serveUploadImageFile);

module.exports = router;
