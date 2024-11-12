const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'  // Reference to your User model
    },
    userRole: {
        type: String,
        required: true,
        enum: ['admin', 'patient', 'dentist']  // Add any other roles you have
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: Object,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);