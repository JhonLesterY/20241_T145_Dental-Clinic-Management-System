const Admin = require('../models/Admin'); // Assuming you have an Admin model
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const Appointment = require('../models/Appointment');
const Inventory = require('../models/Inventory');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const secretKey = "your_jwt_secret_key"; // Store securely in environment variables


// Register Admin
async function registerAdmin(req, res) {
    const { username, email, password } = req.body;
    
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin
        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword
        });

        // Save to database
        await newAdmin.save();

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// Admin Login
async function loginAdmin(req, res) {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({ id: admin._id }, secretKey, { expiresIn: '1h' });

        return res.status(200).json({ token, admin });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// Get all patients
async function getAllPatients() {
    try {
        const patients = await Patient.find({});
        return patients;
    } catch (error) {
        throw new Error('Failed to retrieve patients');
    }
}

// Get all dentists
async function getAllDentists() {
    try {
        const dentists = await Dentist.find({});
        return dentists;
    } catch (error) {
        throw new Error('Failed to retrieve dentists');
    }
}

// Delete a patient
async function deletePatient(patientId) {
    try {
        const patient = await Patient.findByIdAndDelete(patientId);
        if (!patient) throw new Error('Patient not found');
        return patient;
    } catch (error) {
        throw new Error('Failed to delete patient');
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
async function getAllAppointments() {
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
    loginAdmin,
    getAllPatients,
    getAllDentists,
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
    registerAdmin,
};
