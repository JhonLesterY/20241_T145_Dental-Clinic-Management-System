const express = require('express');
const P_route = express.Router();
const patientService = require('../services/patientServices');

// Book Appointment
P_route.post('/:patient_id/appointments', async (req, res) => {
    try {
        const patientId = req.params.patient_id; // Should be defined
        const result = await patientService.bookAppointment(patientId, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Get All Appointments
P_route.get('/:patient_id/appointments', async (req, res) => {
    try {
        const result = await patientService.getAppointments(req.params.patient_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update Appointment
P_route.put('/:patient_id/appointments/:appointment_id', async (req, res) => {
    try {
        const result = await patientService.updateAppointment(req.params.patient_id, req.params.appointment_id, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Consultation History
P_route.get('/:patient_id/consultation-history', async (req, res) => {
    try {
        const result = await patientService.getConsultationHistory(req.params.patient_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Submit Feedback
P_route.post('/:patient_id/feedback', async (req, res) => {
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
module.exports = P_route;
