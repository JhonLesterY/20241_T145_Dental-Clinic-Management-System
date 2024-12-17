const express = require('express');
const D_route = express.Router();
const dentistService = require('../services/dentistServices');
const { authenticateDentist } = require('../middleware/authMiddleware');

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
