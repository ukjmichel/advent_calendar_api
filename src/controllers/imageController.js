// src/controllers/imageController.js

// Adjust the import path if your image helpers are located elsewhere
const {
  getImages,
  getImageFilePath,
  getUploadImageFilePath,
} = require('../services/imageServices');

/**
 * Fetch the list of images.
 */
const getImagesController = (req, res) => {
  try {
    const images = getImages();
    return res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return res.status(500).json({ error: 'Failed to fetch images.' });
  }
};

/**
 * Serve a specific image file.
 *
 * Expects a query parameter: ?filePath=...
 */
const serveImageFile = (req, res) => {
  const { filePath } = req.query;
  if (!filePath) {
    return res
      .status(400)
      .json({ error: 'filePath query parameter is required' });
  }

  const absolutePath = getImageFilePath(filePath);
  res.sendFile(absolutePath, (err) => {
    if (err) {
      console.error('Error sending image file:', err);
      return res.status(404).json({ error: 'Image file not found' });
    }
  });
};

/**
 * Serve a specific uploaded image file.
 *
 * Expects a query parameter: ?filePath=...
 */
const serveUploadImageFile = (req, res) => {
  const { filePath } = req.query;
  if (!filePath) {
    return res
      .status(400)
      .json({ error: 'filePath query parameter is required' });
  }

  const absolutePath = getUploadImageFilePath(filePath);
  res.sendFile(absolutePath, (err) => {
    if (err) {
      console.error('Error sending uploaded image file:', err);
      return res.status(404).json({ error: 'Image file not found' });
    }
  });
};

module.exports = {
  getImagesController,
  serveImageFile,
  serveUploadImageFile,
};
