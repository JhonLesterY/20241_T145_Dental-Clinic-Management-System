const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');

const checkProfileCompletion = async (req, res, next) => {
    try {
        const numericPatientId = parseInt(req.params.patient_id);
        const patient = await Patient.findOne({ patient_id: numericPatientId });
        
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Allow access to profile and password change routes even if profile is incomplete
        if (req.path.includes('/profile') || req.path.includes('/change-password')) {
            return next();
        }

        // Only check password change for non-Google users
        const needsPasswordChange = !patient.isGoogleUser && !patient.hasChangedPassword;

        // For Google users, only check profile completion
        if (patient.isGoogleUser) {
            if (!patient.isProfileComplete) {
                return res.status(403).json({ 
                    message: 'Please complete your profile',
                    requiresProfileCompletion: true,
                    requiresPasswordChange: false
                });
            }
        } else {
            // For non-Google users, check both profile and password
            if (!patient.isProfileComplete || needsPasswordChange) {
                return res.status(403).json({ 
                    message: 'Please complete your profile and change your password',
                    requiresProfileCompletion: !patient.isProfileComplete,
                    requiresPasswordChange: needsPasswordChange
                });
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const checkAdminProfileCompletion = async (req, res, next) => {
    try {
        const adminId = req.user?.id || req.params.id;
        console.log('Checking admin profile completion for:', adminId);
        
        let admin;
        if (mongoose.Types.ObjectId.isValid(adminId)) {
            admin = await Admin.findById(adminId);
        }
        
        if (!admin && req.params.id) {
            admin = await Admin.findOne({ admin_id: req.params.id });
        }
        
        if (!admin) {
            console.log('Admin not found in database');
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Allow access to profile and password change routes
        if (req.path.includes('/profile') || req.path.includes('/change-password')) {
            return next();
        }

        if (!admin.isProfileComplete || !admin.hasChangedPassword) {
            return res.status(403).json({ 
                message: 'Please complete your profile and change your password',
                requiresProfileCompletion: !admin.isProfileComplete,
                requiresPasswordChange: !admin.hasChangedPassword
            });
        }

        next();
    } catch (error) {
        console.error('Error in checkAdminProfileCompletion:', error);
        res.status(500).json({ error: error.message });
    }
};
module.exports = { checkProfileCompletion, checkAdminProfileCompletion };