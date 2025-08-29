const Alert = require('../models/alert');
const User = require('../models/user');
const twilio = require('twilio');

// Initialize Twilio Client from .env variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = new twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_FROM_NUMBER;

/**
 * @desc    Create a new SOS alert and notify trusted contacts
 * @route   POST /api/alert/trigger
 * @access  Private
 */
exports.createAlert = async (req, res) => {
    // The user's ID is retrieved from the JWT token by the auth middleware
    const userId = req.user.id;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ msg: 'Location (latitude and longitude) is required.' });
    }

    try {
        // 1. Find the user who is triggering the alert
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // 2. Create and save the alert record in the database
        const alert = new Alert({
            user: userId,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
            },
        });
        await alert.save();

        // 3. Notify trusted contacts via Twilio SMS
        if (user.trustedContacts && user.trustedContacts.length > 0) {
            const googleMapsLink = `http://maps.google.com/maps?q=${latitude},${longitude}`;
            const alertMessage = `EMERGENCY ALERT from ${user.name || user.mobileNumber}. Last known location: ${googleMapsLink}`;

            // Send an SMS to each trusted contact
            for (const contact of user.trustedContacts) {
                await twilioClient.messages.create({
                    body: alertMessage,
                    from: twilioPhoneNumber,
                    to: contact.phone, // Assumes contact.phone includes country code
                });
            }
        }

        res.status(201).json({
            success: true,
            message: 'Alert triggered and contacts notified successfully.',
            alert,
        });
    } catch (error) {
        console.error('Error triggering alert:', error);
        res.status(500).json({ message: 'Server error while triggering alert.' });
    }
};

/**
 * @desc    Get the alert history for the logged-in user
 * @route   GET /api/alert/my-history
 * @access  Private
 */
exports.getMyAlertHistory = async (req, res) => {
    try {
        const alerts = await Alert.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};