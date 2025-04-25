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
      console.log('Generating report for dentist:', dentistId);
      
      const dentist = await Dentist.findById(dentistId);
      if (!dentist) {
        throw new Error('Dentist not found');
      }
      console.log('Found dentist:', dentist);

      // Fetch consultations with detailed population and error handling
      const consultations = await Consultation.find({ 
        dentistId: dentist._id 
      })
      .populate({
        path: 'patientId',
        select: 'firstName lastName middleName age course year',
        options: { strictPopulate: false }  // Add this option
      })
      .populate({
        path: 'prescription.medicineId',
        select: 'itemName',
        options: { strictPopulate: false }  // Add this option
      })
      .lean(); // Use lean() for better performance

      console.log('Raw consultations:', consultations);

      if (!consultations || consultations.length === 0) {
        console.log('No consultations found for dentist');
        return {
          dentistName: dentist.name || 'Unknown',
          specialization: dentist.specialization || 'Not specified',
          reports: []
        };
      }
  
      // Transform consultations for dentist report with null checks
      const dentistReports = consultations.map(consultation => {
        try {
          // Safely access nested properties
          const patientName = consultation.patientId ? 
            `${consultation.patientId.firstName || ''} ${consultation.patientId.middleName || ''} ${consultation.patientId.lastName || ''}`.trim() : 
            'Unknown Patient';

          const prescriptionInfo = Array.isArray(consultation.prescription) ?
            consultation.prescription.reduce((acc, p) => {
              if (p && p.medicineId) {
                acc.medicines.push(p.medicineId.itemName || 'Unknown Medicine');
                acc.quantities.push(p.quantity?.toString() || '0');
              }
              return acc;
            }, { medicines: [], quantities: [] }) :
            { medicines: [], quantities: [] };

          const report = {
            consultationId: consultation._id?.toString() || 'Unknown ID',
            date: consultation.consultationDate || new Date(),
            toothNumber: consultation.toothNumber || 'Not specified',
            patientName: patientName,
            age: consultation.patientId?.age || '',
            courseAndYear: consultation.patientId ? 
              `${consultation.patientId.course || ''} ${consultation.patientId.year || ''}`.trim() : 
              '',
            treatment: consultation.notes || 'No treatment notes',
            medicine: prescriptionInfo.medicines.join(', ') || 'No medicines prescribed',
            quantity: prescriptionInfo.quantities.join(', ') || 'N/A',
            signature: dentist.name || 'Unknown Dentist'
          };

          console.log('Processed report:', report);
          return report;
        } catch (err) {
          console.error('Error processing consultation:', err, consultation);
          // Return a default report object instead of failing
          return {
            consultationId: consultation._id?.toString() || 'Unknown ID',
            date: new Date(),
            toothNumber: 'Error processing',
            patientName: 'Error processing',
            age: '',
            courseAndYear: '',
            treatment: 'Error processing consultation data',
            medicine: '',
            quantity: '',
            signature: dentist.name || 'Unknown Dentist'
          };
        }
      });
  
      const result = {
        dentistName: dentist.name || 'Unknown',
        specialization: dentist.specialization || 'Not specified',
        reports: dentistReports
      };

      console.log('Final report result:', result);
      return result;
    } catch (error) {
      console.error('Error generating dentist report:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
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
