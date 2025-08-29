const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your credentials from the .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer to use Cloudinary for storing uploaded files
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_pictures', // A folder in Cloudinary to keep images organized
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional: auto-resize images
    },
});

const upload = multer({ storage: storage });

module.exports = upload;