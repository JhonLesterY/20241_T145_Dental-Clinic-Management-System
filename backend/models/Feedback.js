const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    responseId: {
        type: String,
        required: true,
        unique: true
    },
    patient: {
        type: String,
        required: true
    },
    overallExperience: {
        type: String,
        required: true,
        enum: ['Excellent', 'Good', 'Fair', 'Poor']
    },
    staffProfessionalism: {
        type: String,
        required: true,
        enum: ['Excellent', 'Good', 'Fair', 'Poor']
    },
    treatmentSatisfaction: {
        type: String,
        required: true,
        enum: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied']
    },
    clinicCleanliness: {
        type: String,
        required: true,
        enum: ['Excellent', 'Good', 'Fair', 'Poor']
    },
    waitingTime: {
        type: String,
        required: true
    },
    recommendations: {
        type: String,
        default: 'N/A'
    },
    additionalComments: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
