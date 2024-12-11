const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the admin schema
const adminSchema = new Schema({
    admin_id: {
        type: Number,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
    },
    isGoogleUser: {
        type: Boolean,
        default: true
    },
    verificationToken: String,
    verificationExpiry: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    phoneNumber: {
        type: String
    },
    sex: {
        type: String,
        enum: ['Male', 'Female']
    },
    birthday: {
        type: Date
    },
    profilePicture: {
        type: String
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    hasChangedPassword: {
        type: Boolean,
        default: true
    },
    hasLocalPassword: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    permissionLevel: {
        type: String,
        enum: ['STANDARD', 'HIGH'],
        default: 'STANDARD'
    },
    canManagePermissions: {
        type: Boolean,
        default: false
    },
    permissions: {
        manageUsers: { type: Boolean, default: false },
        manageAppointments: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false },
        managePermissions: { type: Boolean, default: false },
        manageInventory: { type: Boolean, default: false },
        manageCalendar: { type: Boolean, default: false }
    },
    role: { type: String, default: 'admin' }
}, { timestamps: true });

// Middleware to set the `admin_id` before saving a new admin
adminSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Find the last admin's `admin_id` and increment it
        const lastAdmin = await this.constructor.findOne().sort({ admin_id: -1 });
        const newAdminId = lastAdmin ? lastAdmin.admin_id + 1 : 1; // Start at 1 if no admins exist
        this.admin_id = newAdminId;
    }
    next();
});

// Create the model using the schema
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
