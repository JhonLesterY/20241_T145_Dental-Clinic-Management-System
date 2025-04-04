const express = require('express');
const D_route = express.Router();
const dentistService = require('../services/dentistServices');
const { authenticateDentist } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/profiles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'dentist-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Profile endpoint
D_route.get('/:dentist_id/profile', authenticateDentist, async (req, res) => {
    try {
        const dentistId = req.params.dentist_id;
        const dentist = await dentistService.getDentistProfile(dentistId);
        res.status(200).json(dentist);
    } catch (error) {
        console.error('Error fetching dentist profile:', error);
        res.status(500).json({ message: 'Failed to fetch dentist profile' });
    }
});

// Update profile endpoint
D_route.put('/:dentist_id/profile', authenticateDentist, upload.single('profilePicture'), async (req, res) => {
    try {
        const dentistId = req.params.dentist_id;
        const updateData = { ...req.body };
        
        // Add profile picture path if uploaded
        if (req.file) {
            const serverUrl = `${req.protocol}://${req.get('host')}`;
            updateData.profilePicture = `${serverUrl}/uploads/profiles/${req.file.filename}`;
        }
        
        const updatedDentist = await dentistService.updateDentistProfile(dentistId, updateData);
        res.status(200).json(updatedDentist);
    } catch (error) {
        console.error('Error updating dentist profile:', error);
        res.status(500).json({ message: 'Failed to update dentist profile' });
    }
});

// Appointment and Consultation Management
D_route.get('/:dentist_id/appointments', authenticateDentist, async (req, res) => {
    try {
        const dentistId = req.params.dentist_id;
        const appointments = await dentistService.getAppointments(dentistId);
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error in dentist appointments route:', error);
        res.status(500).json({ message: 'Failed to fetch appointments' });
    }
});

D_route.get('/:dentist_id/consultation-history', authenticateDentist, async (req, res) => {
    try {
        const dentistId = req.params.dentist_id;
        const consultations = await dentistService.getConsultationHistory(dentistId);
        res.status(200).json(consultations);
    } catch (error) {
        console.error('Error in consultation history route:', error);
        res.status(500).json({ message: 'Failed to fetch consultation history' });
    }
});

D_route.post('/:dentist_id/consultation-history', authenticateDentist, async (req, res) => {
    try {
        const dentistId = req.params.dentist_id;
        const consultation = await dentistService.addConsultation(dentistId, req.body);
        res.status(201).json(consultation);
    } catch (error) {
        console.error('Error adding consultation:', error);
        res.status(500).json({ message: 'Failed to add consultation' });
    }
});

D_route.get('/:dentist_id/feedback', authenticateDentist, async (req, res) => {
    try {
        const dentistId = req.params.dentist_id;
        const feedback = await dentistService.getFeedback(dentistId);
        res.status(200).json(feedback);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Failed to fetch feedback' });
    }
});

// Report Generation
D_route.get('/:dentist_id/generate-report', authenticateDentist, async (req, res) => {
    try {
      const dentistId = req.params.dentist_id;
      const { reportType } = req.query;
  
      const report = await dentistService.generateReport(dentistId, reportType);
      
      res.status(200).json(report);
    } catch (error) {
      console.error('Error in report generation route:', error);
      res.status(500).json({ 
        message: 'Failed to generate report', 
        error: error.message 
      });
    }
  });

module.exports = D_route;
