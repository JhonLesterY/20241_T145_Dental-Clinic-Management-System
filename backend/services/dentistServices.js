const Dentist = require('../models/Dentist');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Feedback = require('../models/Feedback');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const secretKey = "your_jwt_secret_key";

// Login a dentist
module.exports = {
   
    getAppointments: async (req, res) => {
        const dentistId = req.params.dentist_id;
        try {
            // Find all appointments for the dentist
            const appointments = await Appointment.find({ dentistId });
            if (!appointments) {
                return res.status(404).send('No appointments found');
            }
            res.status(200).json(appointments);
        } catch (error) {
            res.status(500).send('Server error: ' + error.message);
        }
    },

    getConsultationHistory: async (req, res) => {
        const dentistId = req.params.dentist_id;
        try {
            // Retrieve consultation history for the dentist
            const consultations = await Consultation.find({ dentistId });
            if (!consultations) {
                return res.status(404).send('No consultation history found');
            }
            res.status(200).json(consultations);
        } catch (error) {
            res.status(500).send('Server error: ' + error.message);
        }
    },

    addConsultation: async (req, res) => {
        const dentistId = req.params.dentist_id;
        const { patientId, details } = req.body;
        try {
            // Create a new consultation
            const newConsultation = new Consultation({
                dentistId,
                patientId,
                details,
                date: new Date()
            });

            // Save consultation
            await newConsultation.save();
            res.status(201).json(newConsultation);
        } catch (error) {
            res.status(500).send('Server error: ' + error.message);
        }
    },

    getFeedback: async (req, res) => {
        const dentistId = req.params.dentist_id;
        try {
            // Retrieve feedback related to this dentist
            const feedbacks = await Feedback.find({ dentistId });
            if (!feedbacks) {
                return res.status(404).send('No feedback found');
            }
            res.status(200).json(feedbacks);
        } catch (error) {
            res.status(500).send('Server error: ' + error.message);
        }
    },

    generateReport: async (req, res) => {
        const dentistId = req.params.dentist_id;
        try {
            // Example of generating a report (you could aggregate appointments, consultations, etc.)
            const appointments = await Appointment.find({ dentistId });
            const consultations = await Consultation.find({ dentistId });

            if (!appointments && !consultations) {
                return res.status(404).send('No data available for report');
            }

            // Example of compiling a report
            const report = {
                totalAppointments: appointments.length,
                totalConsultations: consultations.length,
                reportDate: new Date(),
            };

            res.status(200).json(report);
        } catch (error) {
            res.status(500).send('Server error: ' + error.message);
        }
    },
};
