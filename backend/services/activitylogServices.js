const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');

// Define all possible actions as constants
const ACTIONS = {
    // Admin actions
    ADMIN_CREATE: 'createAdmin',
    ADMIN_DELETE: 'deleteAdmin',
    ADMIN_UPDATE: 'updateAdmin',
    
    // Dentist actions
    DENTIST_ADD: 'addDentist',
    DENTIST_DELETE: 'deleteDentist',
    DENTIST_UPDATE: 'updateDentist',
    
    // Patient actions
    PATIENT_DELETE: 'deletePatient',
    PATIENT_UPDATE: 'updateProfile',
    
    // Appointment actions
    APPOINTMENT_CREATE: 'createAppointment',
    APPOINTMENT_UPDATE: 'updateAppointment',
    APPOINTMENT_DELETE: 'deleteAppointment',
    
    // Inventory actions
    INVENTORY_UPDATE: 'updateInventory',
    INVENTORY_DELETE: 'deleteInventoryItem',
    INVENTORY_ADD: 'addInventoryItem',
    
    // Auth actions
    USER_LOGIN: 'login',
    USER_LOGOUT: 'logout',
    PASSWORD_CHANGE: 'changePassword',
    
    // Additional actions
    APPOINTMENT_VIEW: 'viewAppointments',
    FEEDBACK_SUBMIT: 'submitFeedback',
    FEEDBACK_VIEW: 'viewFeedback',
    PROFILE_VIEW: 'viewProfile',
    REQUIREMENTS_UPDATE: 'updateRequirements',
    CALENDAR_UPDATE: 'updateCalendar',
    SETTINGS_UPDATE: 'updateSettings',
    
    // System actions
    SYSTEM_ERROR: 'systemError',
    SYSTEM_MAINTENANCE: 'systemMaintenance'
};

const IMPORTANT_ACTIONS = Object.values(ACTIONS);

const getUserModel = (userRole) => {
    switch (userRole.toLowerCase()) {
        case 'admin':
            return 'Admin';
        case 'dentist':
            return 'Dentist';
        case 'patient':
            return 'Patient';
        default:
            return 'Admin';
    }
};

const logActivity = async (userId, userRole, action, details = {}) => {
    try {
        console.log('\n--- Activity Logging Start ---');
        console.log('Input parameters:', { userId, userRole, action, details });

        if (!userId || !userRole || !action) {
            console.error('Missing required parameters:', { userId, userRole, action });
            return;
        }

        if (IMPORTANT_ACTIONS.includes(action)) {
            const userIdObj = mongoose.Types.ObjectId.isValid(userId) 
                ? new mongoose.Types.ObjectId(userId) 
                : userId;

            const logData = {
                userId: userIdObj,
                userModel: getUserModel(userRole),
                userRole: userRole.toLowerCase(),
                action,
                details: {
                    ...details,
                    status: details.status || 'Successful'
                },
                timestamp: new Date()
            };

            console.log('Creating log with data:', logData);
            const log = new ActivityLog(logData);
            const savedLog = await log.save();
            console.log('Log saved successfully:', savedLog);
        } else {
            console.warn('Action not recognized:', action);
            console.log('Available actions:', IMPORTANT_ACTIONS);
        }
        
        console.log('--- Activity Logging End ---\n');
    } catch (error) {
        console.error('Failed to log activity:', error);
        console.error('Error stack:', error.stack);
    }
};

module.exports = { 
    logActivity,
    ACTIONS  // Export actions for use in other files
};