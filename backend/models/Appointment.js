const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    default: () => 'APT' + Date.now().toString().slice(-6) // Creates APT + last 6 digits of timestamp
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

module.exports = mongoose.model('Appointment', appointmentSchema);