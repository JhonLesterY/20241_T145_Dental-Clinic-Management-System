const Patient = require('../models/Patient');
const Admin = require('../models/Admin');

const checkProfileCompletion = async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ patient_id: req.params.patient_id });
        
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        if (!patient.isProfileComplete) {
            return res.status(403).json({ 
                message: 'Please complete your profile first',
                requiresProfileCompletion: true 
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const checkAdminProfileCompletion = async (req, res, next) => {
    try {
        const admin = await Admin.findOne({ admin_id: req.user.id });
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (!admin.isProfileComplete) {
            // Allow access only to profile routes if profile is incomplete
            if (req.path.includes('/profile')) {
                return next();
            }
            return res.status(403).json({ 
                message: 'Please complete your profile first',
                requiresProfileCompletion: true
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { checkProfileCompletion, checkAdminProfileCompletion };