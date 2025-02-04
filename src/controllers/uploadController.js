const path = require('path');

/**
 * Controller to handle image upload and resizing.
 *
 * Expects that a middleware (e.g., uploadMiddleware) has processed the file
 * and attached the resized file path to req.resizedFile.
 */
const uploadImage = (req, res) => {
  if (!req.resizedFile) {
    return res.status(500).json({
      message: 'Error: Resized file not found',
    });
  }

  // Extract only the file name from the full path
  const fileName = path.basename(req.resizedFile);

  // Respond with the file name and a success message
  return res.status(200).json({
    message: 'Image uploaded and resized successfully!',
    resizedFile: fileName,
  });
};

module.exports = {
  uploadImage,
};
