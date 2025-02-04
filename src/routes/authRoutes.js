const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

// Route for user registration
router.post('/register', authController.register);

// Login route.
router.post('/login', authController.login);

// Define the route that uses the getAllProfiles controller
router.get('/profile-all', auth, userController.getAllProfiles);

// Protected route to get the profile data of the authenticated user.
router.get('/profile', auth, userController.getProfile);

// Route to retrieve a username by user ID.
router.get('/profile/:id/username', userController.getUsernameById);

// Protected route to get the profile data of the authenticated user.
router.get('/profile', auth, userController.getProfile);

// Protected route to delete the authenticated user's account.
router.delete('/delete-account', auth, userController.deleteAccount);

module.exports = router;
