const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the consultation schema
const consultationSchema = new Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',  // References the Patient model
        required: true
    },
    dentistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dentist',  // References the Dentist model
        required: true
    },
    consultationDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    notes: {
        type: String,
        required: true
    },
    treatment: {
        type: String,
        required: true
    },
    prescription: {
        type: String,
        required: false
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
const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;
