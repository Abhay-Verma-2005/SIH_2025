const { Server } = require("socket.io");
const User = require('../models/user.js');
const Alert = require('../models/alert.js');

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*", // In production, restrict this to your frontend's URL
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('✅ New client connected:', socket.id);

        // Join a room based on userId
        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room`);
        });

        // Listen for location updates from the client
        socket.on('updateLocation', async ({ userId, location }) => {
            if (!userId || !location) return;

            console.log(`📍 Location update for ${userId}:`, location);
            try {
                await User.findByIdAndUpdate(userId, {
                    currentLocation: {
                        type: 'Point',
                        coordinates: [location.longitude, location.latitude]
                    }
                });
            } catch (error) {
                console.error('Error updating location:', error);
            }
        });

        // Listen for an SOS alert from the client
        socket.on('sosAlert', async ({ userId, location }) => {
            if (!userId || !location) return;
            
            console.log(`🆘 SOS Alert from ${userId}! Location:`, location);
            try {
                const user = await User.findById(userId);
                if (!user) return;

                const alert = new Alert({
                    user: userId,
                    location: {
                        type: 'Point',
                        coordinates: [location.longitude, location.latitude]
                    }
                });
                await alert.save();
                
                // Notify trusted contacts (e.g., by emitting a socket event to them if they are connected)
                // In a real app, you would integrate an SMS service like Twilio here.
                console.log('Notifying trusted contacts:', user.trustedContacts);

                // Broadcast the new alert to a general 'alerts' room for dashboards, etc.
                io.emit('newAlert', { alert, user });

            } catch (error) {
                console.error('Error processing SOS alert:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id);
        });
    });

    return io;
}

module.exports = initializeSocket;