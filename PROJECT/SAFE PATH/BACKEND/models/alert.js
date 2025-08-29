/*const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: { // [longitude, latitude]
            type: [Number],
            required: true,
        },
    },
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active',
    },
}, {
    timestamps: true
});

AlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', AlertSchema);*/

const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    // This creates a direct link to a document in the 'User' collection
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Stores location data in MongoDB's special GeoJSON format for mapping
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: { // [longitude, latitude]
            type: [Number],
            required: true,
        },
    },
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active',
    },
}, {
    timestamps: true
});

// Index for faster map-based queries
AlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', AlertSchema);