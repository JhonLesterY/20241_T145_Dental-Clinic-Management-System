const Patient = require('../models/Patient');

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

module.exports = { checkProfileCompletion };