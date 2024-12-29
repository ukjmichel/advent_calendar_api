// routes/image.js
const path = require('path');

// Example image table with image file paths
const images = [
  { name: 'alley', path: 'images/alley.png' },
  { name: 'morning-light', path: 'images/morning-light.jpg' },
  { name: 'venise', path: 'images/venise.webp' },
];

// Function to get the list of images
function getImages() {
  return images;
}

// Function to resolve an image file path
function getImageFilePath(relativePath) {
  return path.resolve(__dirname, '../../public', relativePath);
}

module.exports = { getImages, getImageFilePath };
