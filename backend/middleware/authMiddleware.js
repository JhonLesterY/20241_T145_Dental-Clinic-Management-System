// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authenticateAdmin = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    console.log('Token received:', token); // Debugging line

    if (!token) {
        
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Use JWT_SECRET from .env
        req.user = decoded; // Attach the decoded token data (like user ID) to the request object
        console.log('Decoded User:', req.user); 
        next(); // Move to the next middleware or route handler
    } catch (error) {
        console.error('Error verifying token:', error); // Debugging line
        return res.status(401).json({ message: 'Access Denied: Invalid Token!' });
    }
};

const authenticatePatient = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Authenticating patient with token:', token);

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log('Decoded token:', decoded);

        if (decoded.role !== 'patient') {
            return res.status(403).json({ message: 'Access denied: Not a patient' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { authenticateAdmin, authenticatePatient };
