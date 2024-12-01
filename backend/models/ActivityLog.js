const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['Admin', 'Dentist', 'Patient']
    },
    userRole: {
        type: String,
        required: true,
        enum: ['admin', 'dentist', 'patient']
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