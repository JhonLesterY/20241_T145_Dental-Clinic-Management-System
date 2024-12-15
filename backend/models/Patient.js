const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new Schema({
    patient_id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    // Optional fields for profile completion
    firstName: String,
    middleName: String,
    lastName: String,
    suffix: String,
    phoneNumber: String,
    sex: {
        type: String,
        enum: ['Male', 'Female']
    },
    birthday: Date,
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        sparse: true // Allows null/undefined values
    },
    profilePicture: {
        type: String,
        default: ''
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    hasLocalPassword: {
        type: Boolean,
        default: false
    },
    hasChangedPassword: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;