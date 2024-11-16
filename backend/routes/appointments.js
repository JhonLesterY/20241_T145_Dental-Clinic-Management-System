const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

// Create appointment
router.post('/', auth, async (req, res) => {
    try {
        const {
            studentName,
            studentId,
            serviceType,
            date,
            time,
            notes,
            googleCalendarEventId
        } = req.body;

        const appointment = new Appointment({
            studentName,
            studentId,
            serviceType,
            date,
            time,
            notes,
            googleCalendarEventId
        });

        await appointment.save();
        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Error creating appointment', error: error.message });
    }
});

// Get all appointments
router.get('/', auth, async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ date: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments' });
    }
});

module.exports = router; 