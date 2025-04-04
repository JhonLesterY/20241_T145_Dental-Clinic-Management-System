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

// Add some pre-save middleware for debugging
activityLogSchema.pre('save', function(next) {
    console.log('Saving activity log:', this);
    next();
});

// Add error handling for validation
activityLogSchema.post('save', function(error, doc, next) {
    if (error) {
        console.error('Error saving activity log:', error);
    }
    next();
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);