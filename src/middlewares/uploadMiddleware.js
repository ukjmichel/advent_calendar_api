require('dotenv').config();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDirectory = path.join(
  __dirname,
  process.env.UPLOAD_DIR || '../../uploads'
);
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Multer configuration: store files in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|webp/;
    const extname = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg, .png, and .webp files are allowed!'));
    }
  },
});

// Get resize parameters from .env with sensible defaults
const IMAGE_WIDTH = parseInt(process.env.IMAGE_WIDTH, 10) || 500;
const IMAGE_HEIGHT = parseInt(process.env.IMAGE_HEIGHT, 10) || 500;
const IMAGE_BACKGROUND = {
  r: parseInt(process.env.IMAGE_BG_R, 10) || 255,
  g: parseInt(process.env.IMAGE_BG_G, 10) || 255,
  b: parseInt(process.env.IMAGE_BG_B, 10) || 255,
  alpha: parseFloat(process.env.IMAGE_BG_ALPHA) || 1,
};

// Middleware for upload and resize
const uploadAndResize = async (req, res, next) => {
  try {
    // Ensure the user is authenticated and user ID is available
    if (!req.user || !req.user.id) {
      throw new Error('User authentication required.');
    }

    // Handle file upload
    await new Promise((resolve, reject) => {
      upload.single('image')(req, res, (err) => {
        if (err) return reject(err);
        if (!req.file) return reject(new Error('No image file was uploaded.'));
        resolve();
      });
    });

    const { buffer, originalname } = req.file;
    const resizedFileName = `${req.user.id}-${Date.now()}-${originalname}`;
    const resizedFilePath = path.join(uploadDirectory, resizedFileName);

    // Resize the image while maintaining aspect ratio and adding a background
    await sharp(buffer)
      .resize(IMAGE_WIDTH, IMAGE_HEIGHT, {
        fit: 'contain',
        background: IMAGE_BACKGROUND,
      })
      .toFile(resizedFilePath);

    // Attach resized file path to the request object
    req.resizedFile = resizedFilePath;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = uploadAndResize;
