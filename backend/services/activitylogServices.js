const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const Admin = require('../models/Admin');
const Dentist = require('../models/Dentist');
const Patient = require('../models/Patient');

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
    APPOINTMENT_VIEW: 'viewAppointments',
    
    // Inventory actions
    INVENTORY_UPDATE: 'updateInventory',
    INVENTORY_DELETE: 'deleteInventoryItem',
    INVENTORY_ADD: 'addInventoryItem',
    
    // Auth actions
    USER_LOGIN: 'login',
    USER_LOGOUT: 'logout',
    PASSWORD_CHANGE: 'changePassword',
    
    // Additional actions
    FEEDBACK_SUBMIT: 'submitFeedback',
    REQUIREMENTS_UPDATE: 'updateRequirements',
    CALENDAR_UPDATE: 'updateCalendar',
    SETTINGS_UPDATE: 'updateSettings',
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

const logActivity = async (params) => {
    try {
        // Handle both object parameter and individual parameters
        const { userId, userRole, action } = typeof params === 'object' && !Array.isArray(params) 
            ? params 
            : { userId: arguments[0], userRole: arguments[1], action: arguments[2] };
            
        let details = typeof params === 'object' && !Array.isArray(params)
            ? { ...params.details }
            : { ...arguments[3] } || {};

        if (!userId || !userRole || !action) {
            console.error('Missing required parameters:', { userId, userRole, action });
            return;
        }

        // Convert string ID to ObjectId if needed
        const userIdObj = mongoose.Types.ObjectId.isValid(userId) 
            ? new mongoose.Types.ObjectId(userId) 
            : userId;

        // Get user details based on role
        let userDetails;
        try {
            console.log('Looking up user with ID:', userIdObj);
            
            switch (userRole.toLowerCase()) {
                case 'admin':
                    userDetails = await Admin.findOne({ _id: userIdObj });
                    break;
                case 'dentist':
                    userDetails = await Dentist.findOne({ _id: userIdObj });
                    break;
                case 'patient':
                    userDetails = await Patient.findOne({ _id: userIdObj });
                    break;
            }
            
            console.log('Found user details:', userDetails);
        } catch (error) {
            console.error('Error finding user details:', error);
        }

        // For viewAppointments action - now modifying a non-const details
        if (action === ACTIONS.APPOINTMENT_VIEW) {
            details = {
                ...details,
                count: details.count || 0,
                description: `Viewed ${details.count} appointments`,
                timestamp: new Date().toISOString()
            };
        }

        // Create and save the log with the modified details
        if (IMPORTANT_ACTIONS.includes(action)) {
            const logData = {
                userId: userIdObj,
                userModel: getUserModel(userRole),
                userRole: userRole.toLowerCase(),
                action,
                details,
                timestamp: new Date()
            };

            console.log('Creating log with data:', logData);
            const log = new ActivityLog(logData);
            await log.save();
        }
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = { 
    logActivity,
    ACTIONS  // Export actions for use in other files
};