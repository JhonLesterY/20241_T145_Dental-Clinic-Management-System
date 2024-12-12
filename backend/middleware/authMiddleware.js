// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Dentist = require('../models/Dentist');

const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        req.user = {
            id: admin._id,
            _id: admin._id,
            email: admin.email,
            role: 'admin'
        };

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Not authorized' });
    }
};

const authenticatePatient = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
       

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

const authenticateDentist = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        if (decoded.role !== 'dentist') {
            return res.status(403).json({ message: 'Access denied: Not a dentist' });
        }

        const dentist = await Dentist.findById(decoded.id);
        if (!dentist) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        req.user = {
            id: dentist._id,
            email: dentist.email,
            role: 'dentist'
        };

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Not authorized' });
    }
};

const checkPermission = async (req, res, next) => {
    try {
        const { user } = req;
        const requiredPermission = req.permission;

        if (!user.permissions || !user.permissions[requiredPermission]) {
            return res.status(403).json({
                message: 'You do not have permission to perform this action'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { authenticateAdmin, authenticatePatient, authenticateDentist, checkPermission };
