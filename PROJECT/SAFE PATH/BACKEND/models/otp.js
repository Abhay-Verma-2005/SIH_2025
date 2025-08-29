const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true,
    },
    // This stores the SECURELY HASHED otp, not the plain text one
    otp: {
        type: String,
        required: true,
    },
    // This is a special MongoDB feature. It creates a TTL (Time To Live) index.
    // The document will be automatically deleted from the database 300 seconds (5 minutes)
    // after its creation time.
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, 
    },
});

module.exports = mongoose.model('Otp', otpSchema);