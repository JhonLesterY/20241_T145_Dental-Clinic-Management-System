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
  
      // Fetch relevant data
      const appointments = await Appointment.find({ 
        dentistId: dentist._id, 
        status: 'confirmed' 
      }).populate('patientId');
  
      const consultations = await Consultation.find({ 
        dentistId: dentist._id 
      });
  
      const feedback = await Feedback.find({ 
        dentistId: dentist._id 
      });
  
      // Compute summary statistics
      const summary = {
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
        completionRate: (appointments.filter(a => a.status === 'completed').length / appointments.length * 100).toFixed(2) + '%',
        
        totalConsultations: consultations.length,
        newPatients: new Set(appointments.map(a => a.patientId._id)).size,
        recurringPatients: 0 // You might want to implement a more sophisticated logic
      };
  
      return {
        dentistName: dentist.name,
        specialization: dentist.specialization,
        yearsOfExperience: dentist.yearsOfExperience,
        summary,
        appointments: appointments.map(a => ({
          date: a.date,
          patientName: a.patientId.name,
          procedure: a.procedure,
          status: a.status
        })),
        feedback: feedback.map(f => ({
          comment: f.comment,
          rating: f.rating
        }))
      };
    } catch (error) {
      console.error('Error generating dentist report:', error);
      throw error;
    }
  };

module.exports = {
    getDentistProfile,
    getAppointments,
    getConsultationHistory,
    addConsultation,
    getFeedback,
    generateReport
};
