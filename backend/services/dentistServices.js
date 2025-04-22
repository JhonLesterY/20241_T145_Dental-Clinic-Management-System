const Dentist = require('../models/Dentist');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Feedback = require('../models/Feedback');
const { logActivity } = require('./activitylogServices');

// Get dentist profile
const getDentistProfile = async (dentistId) => {
    try {
        const dentist = await Dentist.findById(dentistId)
            .select('-password');
        
        if (!dentist) {
            throw new Error('Dentist not found');
        }

        return dentist;
    } catch (error) {
        console.error('Error in getDentistProfile:', error);
        throw error;
    }
};

// Update dentist profile
const updateDentistProfile = async (dentistId, updateData) => {
    try {
        console.log('Updating dentist profile:', { dentistId, updateData });
        
        // Validate the dentist exists
        const dentist = await Dentist.findById(dentistId);
        if (!dentist) {
            throw new Error('Dentist not found');
        }

        // Prepare update data
        const updateFields = {
            fullname: updateData.fullname,
            email: updateData.email,
            phoneNumber: updateData.phoneNumber,
            sex: updateData.sex,
            birthday: new Date(updateData.birthday),
            updatedAt: new Date()
        };

        // Add profile picture if provided
        if (updateData.profilePicture) {
            updateFields.profilePicture = updateData.profilePicture;
        }

        console.log('Update fields:', updateFields);

        // Update the dentist profile
        const updatedDentist = await Dentist.findByIdAndUpdate(
            dentistId,
            updateFields,
            { 
                new: true, 
                runValidators: true,
                context: 'query'
            }
        ).select('-password');

        if (!updatedDentist) {
            throw new Error('Failed to update dentist profile');
        }

        console.log('Successfully updated dentist profile:', updatedDentist);

        await logActivity(
            dentistId,
            'dentist',
            'updateProfile',
            { 
                dentistId,
                timestamp: new Date()
            }
        );

        return updatedDentist;
    } catch (error) {
        console.error('Error updating dentist profile:', error);
        throw error;
    }
};

// Get appointments for dentist
const getAppointments = async (dentistId) => {
    try {
        // First, find the dentist to get their _id
        const dentist = await Dentist.findById(dentistId);
        if (!dentist) {
            throw new Error('Dentist not found');
        }

        // Debug logs for dentist
        console.log('Found dentist:', {
            _id: dentist._id,
            name: dentist.name,
            dentist_id: dentist.dentist_id
        });

        // Find all appointments regardless of status first
        const allAppointments = await Appointment.find({ 
            dentistId: dentist._id
        });
        
        console.log('All appointments for dentist:', allAppointments);

        // Then filter for confirmed ones
        const confirmedAppointments = await Appointment.find({ 
            dentistId: dentist._id,
            status: 'confirmed'
        })
        .sort({ appointmentDate: 1, appointmentTime: 1 })
        .select('appointmentId patientName appointmentDate appointmentTime requirements status');

        console.log('Confirmed appointments:', confirmedAppointments);

        return confirmedAppointments;
    } catch (error) {
        console.error('Error fetching dentist appointments:', error);
        throw error;
    }
};

// Get consultation history
const getConsultationHistory = async (dentistId) => {
    try {
        const consultations = await Consultation.find({ dentistId })
            .sort({ date: -1 });

        await logActivity(
            dentistId,
            'dentist',
            'viewConsultations',
            { timestamp: new Date() }
        );

        return consultations;
    } catch (error) {
        console.error('Error fetching consultation history:', error);
        throw error;
    }
};

// Add consultation
const addConsultation = async (dentistId, consultationData) => {
    try {
        const newConsultation = new Consultation({
            dentistId,
            ...consultationData,
            date: new Date()
        });

        await newConsultation.save();

        await logActivity(
            dentistId,
            'dentist',
            'addConsultation',
            { 
                consultationId: newConsultation._id,
                patientId: consultationData.patientId
            }
        );

        return newConsultation;
    } catch (error) {
        console.error('Error adding consultation:', error);
        throw error;
    }
};

// Get feedback
const getFeedback = async (dentistId) => {
    try {
        const feedbacks = await Feedback.find({ dentistId })
            .sort({ createdAt: -1 });

        await logActivity(
            dentistId,
            'dentist',
            'viewFeedback',
            { timestamp: new Date() }
        );

        return feedbacks;
    } catch (error) {
        console.error('Error fetching feedback:', error);
        throw error;
    }
};

// Generate report
const generateReport = async (dentistId, reportType = 'monthly') => {
    try {
      const dentist = await Dentist.findById(dentistId);
      if (!dentist) {
        throw new Error('Dentist not found');
      }
  
      // Fetch consultations with detailed population
      const consultations = await Consultation.find({ 
        dentistId: dentist._id 
      })
      .populate({
        path: 'patientId',
        select: 'firstName lastName middleName age course year'
      })
      .populate({
        path: 'prescription.medicineId',
        select: 'itemName'
      });
  
      // Transform consultations for dentist report
      const dentistReports = consultations.map(consultation => ({
        consultationId: consultation._id,
        date: consultation.consultationDate,
        toothNumber: consultation.toothNumber,
        patientName: `${consultation.patientId.firstName} ${consultation.patientId.middleName || ''} ${consultation.patientId.lastName}`.trim(),
        age: consultation.patientId.age,
        courseAndYear: `${consultation.patientId.course || ''} ${consultation.patientId.year || ''}`.trim(),
        treatment: consultation.notes,
        medicine: consultation.prescription.map(p => p.medicineId.itemName).join(', '),
        quantity: consultation.prescription.map(p => p.quantity).join(', '),
        signature: dentist.name // You might want to replace this with an actual signature mechanism
      }));
  
      return {
        dentistName: dentist.name,
        specialization: dentist.specialization,
        reports: dentistReports
      };
    } catch (error) {
      console.error('Error generating dentist report:', error);
      throw error;
    }
  };

module.exports = {
    getDentistProfile,
    updateDentistProfile,
    getAppointments,
    getConsultationHistory,
    addConsultation,
    getFeedback,
    generateReport
};
