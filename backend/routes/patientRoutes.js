const express = require('express');
const P_route = express.Router();
const multer = require('multer');
const path = require('path');
const Patient = require('../models/Patient');
const bcrypt = require('bcrypt');
const patientService = require('../services/patientServices');
const { authenticatePatient } = require('../middleware/authMiddleware');
const { checkProfileCompletion } = require('../middleware/profileCheckMiddleware');
const mongoose = require('mongoose');
//const { sendWelcomeEmail, generatePassword } = require('../emailService');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile-pictures')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

//const upload = multer({ dest: 'uploads/profile-pictures' });
const upload = multer({ storage: storage });

// Book Appointment
P_route.post('/:patient_id/appointments', authenticatePatient, checkProfileCompletion, async (req, res) => {
    try {
        const patientId = req.params.patient_id; 
        const result = await patientService.bookAppointment(patientId, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get All Appointments
P_route.get('/:patient_id/appointments', authenticatePatient, checkProfileCompletion, async (req, res) => {
    try {
        const result = await patientService.getAppointments(req.params.patient_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update Appointment
P_route.put('/:patient_id/appointments/:appointment_id', authenticatePatient, checkProfileCompletion, async (req, res) => {
    try {
        const result = await patientService.updateAppointment(req.params.patient_id, req.params.appointment_id, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Consultation History
P_route.get('/:patient_id/consultation-history', authenticatePatient, checkProfileCompletion, async (req, res) => {
    try {
        const result = await patientService.getConsultationHistory(req.params.patient_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Submit Feedback
P_route.post('/:patient_id/feedback', authenticatePatient, checkProfileCompletion, async (req, res) => {
    try {
        const result = await patientService.submitFeedback(req.params.patient_id, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

P_route.get('/', (req, res) => {
    try {
        res.status(200).json(mockPatients);  // Return all mock patients
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve patients' });
    }
});

P_route.get('/:patient_id/profile', authenticatePatient, async (req, res) => {
    try {
        const patientId = req.params.patient_id;
        
        // Validate MongoDB ObjectID
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            console.log('Invalid MongoDB ObjectID:', patientId);
            return res.status(400).json({ message: 'Invalid patient ID format' });
        }

        console.log('Attempting to fetch profile for patient:', patientId);
        
        const patient = await patientService.getPatientProfile(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        console.error('Error in get profile route:', error);
        res.status(500).json({ message: error.message });
    }
});
  
  // Update patient profile
  P_route.put('/:patient_id/profile', authenticatePatient, upload.single('profilePicture'), async (req, res) => {
    try {
        console.log('Received profile update request for patient:', req.params.patient_id);
        console.log('Update data:', req.body);
        console.log('File:', req.file);

        let updateData = req.body;

        // If a file was uploaded, add the path
        if (req.file) {
            updateData.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
        }

        const updatedPatient = await patientService.updatePatientProfile(
            req.params.patient_id,
            updateData
        );

        console.log('Profile updated successfully:', updatedPatient);
        res.json(updatedPatient);
    } catch (error) {
        console.error('Error in update profile route:', error);
        res.status(400).json({ message: error.message });
    }
});

// Add route to serve profile pictures
P_route.get('/uploads/profile-pictures/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, '../uploads/profile-pictures', req.params.filename));
});

// Update the change password route
P_route.put('/:patient_id/change-password', authenticatePatient, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const patientId = req.params.patient_id;
        
        console.log('Received password change request for patient:', patientId);

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, patient.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update both password flags and the password itself
        const updatedPatient = await Patient.findByIdAndUpdate(
            patientId,
            {
                $set: {
                    password: hashedPassword,
                    hasChangedPassword: true,
                    hasLocalPassword: true,
                    updatedAt: Date.now()
                }
            },
            { new: true }
        );

        if (!updatedPatient) {
            throw new Error('Failed to update patient');
        }

        console.log('Updated patient status:', {
            hasChangedPassword: updatedPatient.hasChangedPassword,
            hasLocalPassword: updatedPatient.hasLocalPassword
        });

        res.json({
            message: 'Password updated successfully',
            hasChangedPassword: true,
            hasLocalPassword: true,
            patient: {
                hasChangedPassword: updatedPatient.hasChangedPassword,
                hasLocalPassword: updatedPatient.hasLocalPassword,
                isGoogleUser: updatedPatient.isGoogleUser
            }
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(400).json({ message: error.message || 'Failed to change password' });
    }
});

// Submit feedback
P_route.post('/feedback', authenticatePatient, async (req, res) => {
    try {
        const feedback = new Feedback({
            patient: req.body.patient,
            overallExperience: req.body.overallExperience,
            staffProfessionalism: req.body.staffProfessionalism,
            treatmentSatisfaction: req.body.treatmentSatisfaction,
            clinicCleanliness: req.body.clinicCleanliness,
            waitingTime: req.body.waitingTime,
            recommendations: req.body.recommendations,
            additionalComments: req.body.additionalComments
        });

        await feedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Failed to submit feedback' });
    }
});

module.exports = P_route;
