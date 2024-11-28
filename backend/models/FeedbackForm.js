const mongoose = require('mongoose');

const feedbackFormSchema = new mongoose.Schema({
    formId: {
        type: String,
        required: true,
        unique: true
    },
    formUrl: {
        type: String,
        required: true
    },
    emailFieldId: {
        type: String,
        required: true,
        default: '1234567890' // Default email field ID from Google Form
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('FeedbackForm', feedbackFormSchema);
