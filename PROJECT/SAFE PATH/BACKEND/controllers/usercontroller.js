const User = require('../models/user');

/**
 * @desc    Get the logged-in user's profile
 * @route   GET /api/user/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    try {
        // The user ID comes from the auth middleware
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Update user's name and/or profile picture
 * @route   PUT /api/user/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update the name if it was provided
        if (name) {
            user.name = name;
        }

        // Update the profile picture if a new file was uploaded
        // The 'upload' middleware we created will add a 'file' object to the request
        if (req.file) {
            user.profilePictureUrl = req.file.path; // The URL from Cloudinary
        }

        const updatedUser = await user.save();

        res.json({
            msg: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};