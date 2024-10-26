const Patient = require('../models/Patient');  // Patient model
const Appointment = require('../models/Appointment');  // Appointment model
const Feedback = require('../models/Feedback');  // Feedback model
const bcrypt = require('bcryptjs');  // For password encryption
const jwt = require('jsonwebtoken');  // For generating tokens

// Secret key for JWT
const secretKey = "your_jwt_secret_key"; // Store securely in environment variable

// Register a new patient
async function registerPatient(patientData) {
    try {
        // Check if patient already exists
        const existingPatient = await Patient.findOne({ email: patientData.email });
        if (existingPatient) {
            throw new Error('Patient with this email already exists.');
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(patientData.password, 10);
        const newPatient = new Patient({
            name: patientData.name,
            email: patientData.email,
            password: hashedPassword,
            phoneNumber: patientData.phoneNumber,
        });

        // Save the new patient to the database
        await newPatient.save();
        return newPatient;  // Return the newly created patient
    } catch (error) {
        throw new Error(error.message);
    }
}

// Login an existing patient
async function loginPatient({ email, password }) {
    try {
        // Find patient by email
        const patient = await Patient.findOne({ email });
        if (!patient) {
            throw new Error('Patient not found.');
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            throw new Error('Incorrect password.');
        }

        // Generate a JWT token
        const token = jwt.sign({ id: patient._id }, secretKey, { expiresIn: '1h' });
        return { token, patient };
    } catch (error) {
        throw new Error(error.message);
    }
}

// Book a new appointment for a patient
async function bookAppointment(patientId, appointmentData) {
    try {
        const appointment = new Appointment({
            ...appointmentData,
            patientId,  // Associate the appointment with the patient
        });

        const savedAppointment = await appointment.save(); // Save the appointment to the database
        return savedAppointment;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Get all appointments for a specific patient
async function getAppointments(patientId) {
    try {
        const appointments = await Appointment.find({ patientId });
        return appointments;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Update a patient's appointment
async function updateAppointment(patientId, appointmentId, updateData) {
    try {
        const updatedAppointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, patientId },
            updateData,
            { new: true }  // Return the updated appointment
        );
        if (!updatedAppointment) {
            throw new Error('Appointment not found.');
        }
        return updatedAppointment;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Get consultation history for a specific patient
async function getConsultationHistory(patientId) {
    try {
        const consultations = await Appointment.find({ 
            patientId, 
            consultation: { $exists: true } 
        });
        return consultations;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Submit feedback from a patient
async function submitFeedback(patientId, feedbackData) {
    try {
        const feedback = new Feedback({
            ...feedbackData,
            patientId,  // Associate the feedback with the patient
        });

        const savedFeedback = await feedback.save(); // Save feedback to the database
        return savedFeedback;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    registerPatient,
    loginPatient,
    bookAppointment,
    getAppointments,
    updateAppointment,
    getConsultationHistory,
    submitFeedback,
};
