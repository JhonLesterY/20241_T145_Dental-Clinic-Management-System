const PERMISSIONS = {
    ADMIN: {
        MANAGE_ADMINS: 'manage_admins',
        MANAGE_DENTISTS: 'manage_dentists',
        MANAGE_PATIENTS: 'manage_patients',
        VIEW_APPOINTMENTS: 'view_appointments',
        MANAGE_CALENDAR: 'manage_calendar',
        VIEW_REPORTS: 'view_reports',
        SEND_NOTIFICATIONS: 'send_notifications',
        MANAGE_PERMISSIONS: 'manage_permissions',
        MANAGE_ADMIN_ROLES: 'manage_admin_roles'
    },
    DENTIST: {
        MANAGE_APPOINTMENTS: 'manage_appointments',
        VIEW_PATIENTS: 'view_patients',
        MANAGE_SCHEDULE: 'manage_schedule',
        VIEW_MEDICAL_RECORDS: 'view_medical_records'
    },
    PATIENT: {
        BOOK_APPOINTMENTS: 'book_appointments',
        VIEW_HISTORY: 'view_history',
        SUBMIT_FEEDBACK: 'submit_feedback',
        MANAGE_PROFILE: 'manage_profile'
    }
};

module.exports = PERMISSIONS; 