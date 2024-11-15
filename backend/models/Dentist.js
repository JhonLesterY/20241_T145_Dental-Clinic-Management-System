const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the dentist schema
const dentistSchema = new Schema({
    dentist_id: {
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
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
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

// Add a pre-save middleware to auto-increment dentist_id
dentistSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            console.log('Running pre-save middleware for dentist:', this);
            const latestDentist = await this.constructor.findOne({}, {}, { sort: { 'dentist_id': -1 } });
            console.log('Latest dentist found:', latestDentist);
            this.dentist_id = latestDentist ? latestDentist.dentist_id + 1 : 1;
            console.log('Assigned dentist_id:', this.dentist_id);
            next();
        } catch (error) {
            console.error('Error in pre-save middleware:', error);
            next(error);
        }
    } else {
        next();
    }
});

// Create the model using the schema
const Dentist = mongoose.model('Dentist', dentistSchema);

module.exports = Dentist;