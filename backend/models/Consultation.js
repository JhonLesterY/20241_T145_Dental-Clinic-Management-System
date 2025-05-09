const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the consultation schema
const consultationSchema = new Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    dentistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dentist',
        required: true
    },
    consultationDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    notes: {
        type: String,
        required: true
    },
    toothNumber: {
        type: String,
        required: true
    },
    prescription: [{
        medicineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InventoryItem',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    usedItems: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InventoryItem',
            required: true
        },
        itemName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        dateUsed: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create the model using the schema
const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;
