/*const express = require('express');
const router = express.Router();
const { createAlert, getMyAlertHistory } = require('../controllers/alertController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes in this file are protected and require a user to be logged in
router.use(authMiddleware);

// Route to trigger a new SOS alert
// POST /api/alert/trigger
router.post('/trigger', createAlert);

// Route to get the user's own alert history
// GET /api/alert/my-history
router.get('/my-history', getMyAlertHistory);

module.exports = router;*/    


const express = require('express');
const router = express.Router();
const { createAlert, getMyAlertHistory } = require('../controllers/alertController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all alert-related routes
router.use(authMiddleware);

// @route   POST /api/alert/trigger
// @desc    Trigger a new SOS alert
router.post('/trigger', createAlert);

// @route   GET /api/alert/my-history
// @desc    Get the logged-in user's past alerts
router.get('/my-history', getMyAlertHistory);

module.exports = router;