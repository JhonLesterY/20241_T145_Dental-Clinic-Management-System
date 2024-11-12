const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, userRole, action, details = {}) => {
    try {
        // Debug logs
        console.log('Logging activity with:', {
            userId,
            userRole,
            action,
            details
        });

        const log = new ActivityLog({
            userId,
            userRole,
            action,
            details
        });

        await log.save();
        console.log('Activity logged successfully');
    } catch (error) {
        console.error('Failed to log activity:', error.message);
        // Don't throw the error - just log it
    }
};

module.exports = { logActivity };