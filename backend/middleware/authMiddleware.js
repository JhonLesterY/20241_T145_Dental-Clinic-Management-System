// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

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

module.exports = { authenticateAdmin };
