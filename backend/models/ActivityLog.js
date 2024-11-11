// models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userRole: { type: String, required: true, enum: ['admin', 'dentist', 'patient'] },
    action: { type: String, required: true },
    details: { type: Object }, // Store any additional data related to the action
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
