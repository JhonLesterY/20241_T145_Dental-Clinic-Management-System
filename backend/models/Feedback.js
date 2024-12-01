const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    overallExperience: {
        type: String,
        required: true
    },
    staffProfessionalism: {
        type: String,
        required: true
    },
    treatmentSatisfaction: {
        type: String,
        required: true
    },
    clinicCleanliness: {
        type: String,
        required: true
    },
    waitingTime: {
        type: String,
        required: true
    },
    recommendations: {
        type: String,
        required: true
    },
    additionalComments: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Check if the model exists before compiling it
module.exports = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
