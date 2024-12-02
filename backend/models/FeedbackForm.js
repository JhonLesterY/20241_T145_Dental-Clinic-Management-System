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
        required: true
    },
    fieldIds: {
        EMAIL: String,
        OVERALL_EXPERIENCE: String,
        STAFF_PROFESSIONALISM: String,
        TREATMENT_SATISFACTION: String,
        CLINIC_CLEANLINESS: String,
        DOCTOR_RATING: String,
        COMMENTS: String
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
