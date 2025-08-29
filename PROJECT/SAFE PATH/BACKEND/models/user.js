// In models/user.js
/*const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    profilePictureUrl: {
        type: String,
        default: '' // Default to an empty string
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);*/

const mongoose = require('mongoose');

// A sub-schema for organizing trusted contact information
const TrustedContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true }, // Should include country code
});

const userSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        trim: true,
    },
    profilePictureUrl: {
        type: String,
        default: '', // Default to an empty string for new users
    },
    trustedContacts: [TrustedContactSchema], // An array to hold trusted contacts
    
    // This field is for real-time location tracking
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
        },
    },
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create a 2dsphere index for efficient location-based queries
userSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('User', userSchema);