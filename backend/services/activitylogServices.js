const ActivityLog = require('../models/ActivityLog');

const IMPORTANT_ACTIONS = [
    'createAdmin',
    'deleteAdmin',
    'updateAdmin',
    'addDentist',
    'deleteDentist',
    'updateDentist',
    'deletePatient',
    'updatePatient',
    'updateInventory',
    'deleteInventoryItem',
    'addInventoryItem',
    'updateAppointment',
    'deleteAppointment',
    'createAppointment',
    'login',
    'logout',
    'changePassword',
    'updateProfile'
];

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
        if (IMPORTANT_ACTIONS.includes(action)) {
            const enhancedDetails = {
                ...details,
                status: details.affected_ids > 0 ? 'Successful' : 'No changes made',
                affected_ids: undefined
            };

            const log = new ActivityLog({
                userId,
                userModel: getUserModel(userRole),
                userRole,
                action,
                details: enhancedDetails
            });

            await log.save();
            console.log('Activity logged successfully');
        }
    } catch (error) {
        console.error('Failed to log activity:', error.message);
    }
};

module.exports = { 
    logActivity,
    IMPORTANT_ACTIONS
};