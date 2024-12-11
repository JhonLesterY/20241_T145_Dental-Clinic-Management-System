const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    default: () => 'APT' + Date.now().toString().slice(-6)
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
    
  },
  patientName: {
    type: String,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'declined'],
    default: 'pending'
  },
  requirements: {
    schoolId: {
      fileId: String,
      webViewLink: String,
      fileName: String,
      uploadedAt: Date
    },
    registrationCert: {
      fileId: String,
      webViewLink: String,
      fileName: String,
      uploadedAt: Date
    },
    vaccinationCard: {
      fileId: String,
      webViewLink: String,
      fileName: String,
      uploadedAt: Date
    }
  },
  requirementsStatus: {
    type: String,
    enum: ['pending', 'incomplete', 'complete'],
    default: 'pending'
  },
  dentistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dentist',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);