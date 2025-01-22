// src/routes/imageRoutes.js
const express = require('express');
const {
  getImages,
  getImageFilePath,
  getUploadImageFilePath,
} = require('./image');
const router = express.Router();

// Route to fetch the list of images
router.get('/images', (req, res) => {
  const images = getImages();
  res.json(images);
});

// Route to serve a specific image file
router.get('/image-file', (req, res) => {
  const { filePath } = req.query; // Expecting filePath query parameter
  if (!filePath) {
    return res
      .status(400)
      .json({ error: 'filePath query parameter is required' });
  }

  const absolutePath = getImageFilePath(filePath);
  res.sendFile(absolutePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Image file not found' });
    }
  });
});

// Route to serve a specific image file
router.get('/image-upload', (req, res) => {
  const { filePath } = req.query; // Expecting filePath query parameter
  if (!filePath) {
    return res
      .status(400)
      .json({ error: 'filePath query parameter is required' });
  }

  const absolutePath = getUploadImageFilePath(filePath);
  res.sendFile(absolutePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Image file not found' });
    }
  });
});

// Route to serve a specific image file
router.get('/image-file', (req, res) => {
  const { filePath } = req.query; // Expecting filePath query parameter
  if (!filePath) {
    return res
      .status(400)
      .json({ error: 'filePath query parameter is required' });
  }

  const absolutePath = getImageFilePath(filePath);
  res.sendFile(absolutePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Image file not found' });
    }
  });
});

module.exports = router;
