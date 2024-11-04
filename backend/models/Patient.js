const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the patient schema
const patientSchema = new Schema({
    patient_id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    phoneNumber: {
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
const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
