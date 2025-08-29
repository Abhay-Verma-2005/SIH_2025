/*const express = require('express');
const router = express.Router();
const { getMe, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // Import the upload middleware

// All routes here are protected by the auth middleware
router.use(authMiddleware);

// Route to get the user's own profile
// GET /api/user/me
router.get('/me', getMe);

// Route to update the user's profile (name and/or picture)
// PUT /api/user/profile
// We use upload.single('profilePicture') to specify that we are expecting
// a single file upload with the field name 'profilePicture'.
router.put('/profile', upload.single('profilePicture'), updateProfile);

module.exports = router;
*/



/*
// use in middleware
// This route is protected by ONE middleware
// The request must pass the authMiddleware checkpoint to reach getMe
router.get('/me', authMiddleware, getMe);

// This route is protected by TWO middleware
// 1. authMiddleware runs to check the token.
// 2. upload.single() runs to handle the file.
// 3. Only then does the updateProfile controller function run.
router.put('/profile', [authMiddleware, upload.single('profilePicture')], updateProfile);*/



const express = require('express');
const router = express.Router();
const { getMe, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // The file upload middleware

// Apply the authMiddleware to all routes in this file.
// This means a user must provide a valid token to access any of these routes.
router.use(authMiddleware);

// @route   GET /api/user/me
// @desc    Get the profile of the currently logged-in user
router.get('/me', getMe);

// @route   PUT /api/user/profile
// @desc    Update the user's name and/or profile picture
// The `upload.single()` middleware handles the file upload before the controller runs.
router.put('/profile', upload.single('profilePicture'), updateProfile);

module.exports = router;