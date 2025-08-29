const express = require("express");
const router = express.Router();
const authController = require("../controllers/authcontroller");

// Request OTP
router.post("/request-otp", authController.requestOtp);

// Verify OTP
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;
