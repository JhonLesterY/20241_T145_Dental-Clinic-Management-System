const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the appointment schema
const appointmentSchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    reason: {
        type: String
    },
    status: {
        type: String,
        enum: ['scheduled', 'canceled', 'completed'],
        default: 'scheduled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create the model using the schema
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
