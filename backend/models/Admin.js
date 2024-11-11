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
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
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
