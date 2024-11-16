const Patient = require('../models/Patient');  // Patient model
const Appointment = require('../models/Appointment');  // Appointment model
const Feedback = require('../models/Feedback');  // Feedback model


// Book a new appointment for a patient
async function bookAppointment(patient_id, appointmentData) {
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
async function getPatientProfile(patient_id) {
    try {
        console.log('Looking for patient with ID:', patient_id);
        
        const patient = await Patient.findById(patient_id);
        
        if (!patient) {
            console.log('Patient not found in database');
            throw new Error('Patient not found');
        }

        console.log('Found patient:', patient);
        
        return {
            firstName: patient.firstName || '',
            middleName: patient.middleName || '',
            lastName: patient.lastName || '',
            suffix: patient.suffix || 'None',
            phoneNumber: patient.phoneNumber || '',
            email: patient.email || '',
            sex: patient.sex || 'Male',
            birthday: patient.birthday || '',
            isProfileComplete: patient.isProfileComplete || false,
            profilePicture: patient.profilePicture || '', // Add this line
            isGoogleUser: patient.isGoogleUser || false  // Add this line
        };
    } catch (error) {
        console.error('Error in getPatientProfile:', error);
        throw new Error(error.message);
    }
}

async function updatePatientProfile(patient_id, updateData) {
    try {
        // Handle profile picture URL for Google users
        if (updateData.isGoogleUser && updateData.picture) {
            updateData.profilePicture = updateData.picture;
        }

        const updatedPatient = await Patient.findByIdAndUpdate(
            patient_id,
            { 
                ...updateData,
                isProfileComplete: true,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedPatient) {
            throw new Error('Patient not found');
        }

        return updatedPatient;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    bookAppointment,
    getAppointments,
    updateAppointment,
    getConsultationHistory,
    submitFeedback,
    getPatientProfile,
    updatePatientProfile,
};
