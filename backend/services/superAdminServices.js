const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const Dentist = require('../models/Dentist');
const Patient = require('../models/Patient');
const PERMISSIONS = require('../config/permissions');
const { logActivity } = require('./activitylogServices');

async function updateRolePermissions(roleType, permissions) {
    try {
        const validRole = ['ADMIN', 'DENTIST', 'PATIENT'].includes(roleType.toUpperCase());
        if (!validRole) {
            throw new Error('Invalid role type');
        }

        // Update permissions in the database
        const Model = {
            ADMIN: Admin,
            DENTIST: Dentist,
            PATIENT: Patient
        }[roleType.toUpperCase()];

        await Model.updateMany({}, { 
            $set: { permissions: permissions }
        });

        // Log the activity
        await logActivity(
            req.user.id,
            'superadmin',
            'UPDATE_PERMISSIONS',
            { role: roleType, permissions: permissions }
        );

        return { success: true, message: `Updated permissions for ${roleType}` };
    } catch (error) {
        console.error('Error updating permissions:', error);
        throw error;
    }
}

async function getAvailablePermissions(roleType) {
    return PERMISSIONS[roleType.toUpperCase()] || {};
}

module.exports = {
    updateRolePermissions,
    getAvailablePermissions
}; 