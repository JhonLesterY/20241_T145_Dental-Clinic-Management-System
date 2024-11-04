const { OAuth2Client } = require('google-auth-library'); 
const Patient = require('../models/Patient');  // Patient model
const Appointment = require('../models/Appointment');  // Appointment model
const Feedback = require('../models/Feedback');  // Feedback model
const bcrypt = require('bcryptjs');  // For password encryption
const jwt = require('jsonwebtoken');  // For generating tokens

// Secret key for JWT
const secretKey = process.env.JWT_SECRET_KEY;; // Store securely in environment variable
const googleClientId = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(googleClientId);

// Register a new patient
async function registerPatient(patientData) {
    try {
        // Check if patient already exists
        const existingPatient = await Patient.findOne({ email: patientData.email });
        if (existingPatient) {
            throw new Error('Patient with this email already exists.');
        }

        // Generate an incrementing patient_id
        const latestPatient = await Patient.findOne().sort({ patient_id: -1 }); // Get the patient with the highest patient_id
        const newpatient_id = latestPatient ? latestPatient.patient_id + 1 : 1;  // If no patients, start at 1

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(patientData.password, 10);
        const newPatient = new Patient({
            patient_id: newpatient_id,
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

async function registerWithGoogle(idToken) {
    try {
        // Verify Google ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: googleClientId,
        });
        const payload = ticket.getPayload();

        if (!payload) {
            throw new Error("Invalid Google ID token");
        }

        // Extract user info from Google token
        const { email, name } = payload;

        // Check if patient already exists
        let patient = await Patient.findOne({ email });

        if (!patient) {
            // If no patient exists, create new
            const latestPatient = await Patient.findOne().sort({ patient_id: -1 });
            const newpatient_id = latestPatient ? latestPatient.patient_id + 1 : 1;

            patient = new Patient({
                patient_id: newpatient_id,
                name,
                email,
                password: null, // No password needed for Google-authenticated users
            });

            await patient.save();
        }

        // Generate JWT token
        const token = jwt.sign({ patientId: patient._id }, secretKey, { expiresIn: '1h' });
        return { patient, token };
    } catch (error) {
        throw new Error(error.message);
    }
}

// Book a new appointment for a patient
async function bookAppointment(patien_id, appointmentData) {
    try {
        const appointment = new Appointment({
            ...appointmentData,
            patient_id,  // Associate the appointment with the patient
        });

        const savedAppointment = await appointment.save(); // Save the appointment to the database
        return savedAppointment;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Get all appointments for a specific patient
async function getAppointments(patient_id) {
    try {
        const appointments = await Appointment.find({ patient_id });
        return appointments;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Update a patient's appointment
async function updateAppointment(patient_id, appointmentId, updateData) {
    try {
        const updatedAppointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, patient_id },
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
async function getConsultationHistory(patient_id) {
    try {
        const consultations = await Appointment.find({ 
            patient_id, 
            consultation: { $exists: true } 
        });
        return consultations;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Submit feedback from a patient
async function submitFeedback(patient_id, feedbackData) {
    try {
        const feedback = new Feedback({
            ...feedbackData,
            patient_id,  // Associate the feedback with the patient
        });

        const savedFeedback = await feedback.save(); // Save feedback to the database
        return savedFeedback;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    registerPatient,
    registerWithGoogle,
    bookAppointment,
    getAppointments,
    updateAppointment,
    getConsultationHistory,
    submitFeedback,
};
