const Patient = require('../models/Patient');  // Patient model
const Appointment = require('../models/Appointment');  // Appointment model
const Feedback = require('../models/Feedback');  // Feedback model
const bcrypt = require('bcrypt');
const { logActivity, ACTIONS } = require('./activitylogServices');  // Add this import


// Book a new appointment for a patient
async function bookAppointment(patient_id, appointmentData) {
    try {
        console.log('Starting bookAppointment:', { patient_id, appointmentData });
        
        const appointment = new Appointment({
            ...appointmentData,
            patient_id,
        });

        const savedAppointment = await appointment.save();
        console.log('Appointment saved:', savedAppointment);
        
        // Log the activity with standardized action
        await logActivity(
            patient_id,
            'patient',
            ACTIONS.APPOINTMENT_CREATE,
            {
                appointmentId: savedAppointment.appointmentId,
                appointmentDate: savedAppointment.appointmentDate,
                appointmentTime: savedAppointment.appointmentTime,
                status: 'Successful',
                patientName: savedAppointment.patientName
            }
        );

        return savedAppointment;
    } catch (error) {
        console.error('Error in bookAppointment:', error);
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

        // Log the activity
        await logActivity(
            patient_id,
            'patient',
            ACTIONS.APPOINTMENT_UPDATE,
            {
                appointmentId: appointmentId,
                changes: updateData,
                status: 'Successful'
            }
        );

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
        // Create new feedback document
        const feedback = new Feedback({
            ...feedbackData,
            patient_id,  // Associate the feedback with the patient
        });

        // Save feedback to database
        const savedFeedback = await feedback.save();
        
        // Log the activity
        await logActivity(
            patient_id,
            'patient',
            ACTIONS.FEEDBACK_SUBMIT, // Changed from PATIENT_UPDATE to FEEDBACK_SUBMIT
            {
                feedbackId: savedFeedback._id,
                rating: feedbackData.rating,
                status: 'Successful'
            }
        );

        return savedFeedback;
    } catch (error) {
        console.error('Error in submitFeedback:', error);
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

        console.log('Found patient status:', {
            hasChangedPassword: patient.hasChangedPassword,
            hasLocalPassword: patient.hasLocalPassword
        });
        
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
            profilePicture: patient.profilePicture || '',
            isGoogleUser: patient.isGoogleUser || false,
            hasChangedPassword: patient.hasChangedPassword || false,
            hasLocalPassword: patient.hasLocalPassword || false
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

        // Log the activity
        await logActivity(
            patient_id,
            'patient',
            ACTIONS.PATIENT_UPDATE,
            {
                updatedFields: Object.keys(updateData),
                status: 'Successful'
            }
        );

        return updatedPatient;
    } catch (error) {
        throw new Error(error.message);
    }
}


async function changePassword(patient_id, currentPassword, newPassword) {
    try {
        console.log('Attempting to change password for patient:', patient_id);
        
        const patient = await Patient.findById(patient_id);
        
        if (!patient) {
            console.log('Patient not found');
            throw new Error('Patient not found');
        }

        // If the patient has a local password, verify it
        if (patient.hasLocalPassword) {
            const isMatch = await bcrypt.compare(currentPassword, patient.password);
            if (!isMatch) {
                throw new Error('Current password is incorrect');
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update both password and flags
        const updatedPatient = await Patient.findByIdAndUpdate(
            patient_id,
            { 
                $set: {
                    password: hashedPassword,
                    hasLocalPassword: true,
                    hasChangedPassword: true
                }
            },
            { new: true }
        );

        console.log('Password update status:', {
            hasChangedPassword: updatedPatient.hasChangedPassword,
            hasLocalPassword: updatedPatient.hasLocalPassword
        });
        
        return true;
    } catch (error) {
        console.error('Error in changePassword:', error);
        throw error;
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
    changePassword,
};
