// services/activitylogServices.js
const ActivityLog = require('../models/ActivityLog');

async function logActivity(userId, userRole, action, details = {}) {
    const logEntry = new ActivityLog({ userId, userRole, action, details });
    console.log(`Logging activity for ${userRole} with ID ${userId}, action: ${action}`);

     try {
        await logEntry.save();
        console.log(`Logged activity: ${action} by ${userRole} with ID ${userId}`);
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}


module.exports = { logActivity };
