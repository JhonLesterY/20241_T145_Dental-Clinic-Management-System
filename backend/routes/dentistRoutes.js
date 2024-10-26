const express = require('express');
const D_route = express.Router();
const dentistService = require('../services/dentistServices');

// Dentist Login
D_route.post('/login', dentistService.loginDentist);

// Appointment and Consultation Management
D_route.get('/:dentist_id/appointments', dentistService.getAppointments);
D_route.get('/:dentist_id/consultation-history', dentistService.getConsultationHistory);
D_route.post('/:dentist_id/consultation-history', dentistService.addConsultation);
D_route.get('/:dentist_id/feedback', dentistService.getFeedback);

// Report Generation
D_route.get('/:dentist_id/reports', dentistService.generateReport);

module.exports = D_route;
