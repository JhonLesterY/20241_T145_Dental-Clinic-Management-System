const Admin = require('../models/Admin'); // Assuming you have an Admin model
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const Appointment = require('../models/Appointment');
const Inventory = require('../models/Inventory');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const secretKey = "your_jwt_secret_key"; // Store securely in environment variables

// Get all patients
async function getAllPatients(req, res) {
    try {   
        const patients = await Patient.find({});
        return res.status(200).json(patients); // Send the patients as a response
    } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve patients: ' + error.message });
    }
}

// Delete a patient
async function deletePatient(req, res) {
    const { patient_id } = req.params;
    try {
        const patient = await Patient.findOneAndDelete({ patient_id: Number(patient_id) });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        return res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete patient: ' + error.message });
    }
}

async function addDentist(req, res) {
    const { name, email, password, phoneNumber } = req.body; // Remove specialization

    try {
        const existingDentist = await Dentist.findOne({ email });
        if (existingDentist) {
            return res.status(400).json({ message: 'Dentist already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newDentist = new Dentist({
            name,
            email,
            password: hashedPassword,
            phoneNumber
        });

        await newDentist.save();

        res.status(201).json({ message: 'Dentist added successfully', dentist: newDentist });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add dentist: ' + error.message });
    }
}

// Delete a dentist
async function deleteDentist(dentistId) {
    try {
        const dentist = await Dentist.findByIdAndDelete(dentistId);
        if (!dentist) throw new Error('Dentist not found');
        return dentist;
    } catch (error) {
        throw new Error('Failed to delete dentist');
    }
}

// Get all appointments
async function getAllAppointments(req, res) {
    try {
        const appointments = await Appointment.find({});
        return appointments;
    } catch (error) {
        throw new Error('Failed to retrieve appointments');
    }
}

// Send reminders for appointments (you can customize this logic)
async function sendReminders() {
    try {
        const appointments = await Appointment.find({ reminderSent: false, date: { $gte: new Date() } });
        
        // Logic to send reminders, e.g., via email or SMS
        // Example: Loop through appointments and send reminder

        appointments.forEach(appointment => {
            // Implement your reminder logic here (e.g., using a third-party service)
            appointment.reminderSent = true;
            appointment.save();
        });

        return { message: 'Reminders sent successfully' };
    } catch (error) {
        throw new Error('Failed to send reminders');
    }
}

// Update the calendar (you can store calendar events in a collection, or use an existing service)
async function updateCalendar(calendarData) {
    try {
        // Assuming there is a Calendar model
        const calendar = new Calendar(calendarData);
        await calendar.save();
        return calendar;
    } catch (error) {
        throw new Error('Failed to update calendar');
    }
}

// Get reports (you can customize the report generation logic)
async function getReports() {
    try {
        const reports = {}; // Example: You can generate various reports such as revenue, appointments, etc.
        return reports;
    } catch (error) {
        throw new Error('Failed to generate reports');
    }
}

// Get all inventory items
async function getInventory() {
    try {
        const inventory = await Inventory.find({});
        return inventory;
    } catch (error) {
        throw new Error('Failed to retrieve inventory');
    }
}

// Add an inventory item
async function addInventoryItem(inventoryData) {
    try {
        const newItem = new Inventory(inventoryData);
        await newItem.save();
        return newItem;
    } catch (error) {
        throw new Error('Failed to add inventory item');
    }
}

// Update an inventory item
async function updateInventoryItem(itemId, updateData) {
    try {
        const item = await Inventory.findByIdAndUpdate(itemId, updateData, { new: true });
        if (!item) throw new Error('Item not found');
        return item;
    } catch (error) {
        throw new Error('Failed to update inventory item');
    }
}

// Delete an inventory item
async function deleteInventoryItem(itemId) {
    try {
        const item = await Inventory.findByIdAndDelete(itemId);
        if (!item) throw new Error('Item not found');
        return item;
    } catch (error) {
        throw new Error('Failed to delete inventory item');
    }
}

module.exports = {
    getAllPatients,
    deletePatient,
    deleteDentist,
    getAllAppointments,
    sendReminders,
    updateCalendar,
    getReports,
    getInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addDentist,
};
