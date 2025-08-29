const jwt = require('jsonwebtoken');

/**
 * This middleware function verifies the JSON Web Token (JWT) sent with a request.
 * If the token is valid, it attaches the user's ID to the request object (`req.user`)
 * and passes the request to the next function in the chain (the controller).
 */
module.exports = function (req, res, next) {
    // 1. Get the token from the request header
    // The convention is to name it 'x-auth-token'
    const token = req.header('x-auth-token');

    // 2. Check if a token was provided
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Verify the token
    try {
        // Decode the token using your JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user payload (which contains the user's ID) to the request object
        req.user = decoded.user;

        // Call next() to proceed to the controller function
        next();
    } catch (err) {
        // If the token is not valid (e.g., expired or incorrect), send an error
        res.status(401).json({ msg: 'Token is not valid' });
    }
};   