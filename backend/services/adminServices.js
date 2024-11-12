const Admin = require('../models/Admin');
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const Appointment = require('../models/Appointment');
const Inventory = require('../models/Inventory');
const bcrypt = require('bcryptjs');
const { logActivity } = require('../services/activitylogServices');

// Secret key for JWT
const secretKey = process.env.JWT_SECRET_KEY; // Store securely in environment variables

async function createAdmin(req, res) {
    try {
        const existingAdmin = await Admin.findOne({ email: req.body.email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this fullname already exists.' });
        }

        const lastAdmin = await Admin.findOne().sort({ admin_id: -1 });
        const newAdminId = lastAdmin ? lastAdmin.admin_id + 1 : 1;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newAdmin = new Admin({
            admin_id: newAdminId,
            fullname: req.body.fullname,
            email: req.body.email,
            password: hashedPassword,
            role: 'admin',
        });

        await newAdmin.save();

        // Log activity
        await logActivity(req.user.id, req.user.role, 'createAdmin', { adminId: newAdmin._id });

        res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
    } catch (error) {
        console.error('Failed to create admin:', error);
        res.status(500).json({ message: 'Failed to create admin: ' + error.message });
    }
}

const getAllPatients = async (req) => {
    try {
        const patients = await Patient.find();
        
        // Debug logs
        console.log('User from request:', req.user);
        console.log('User ID:', req.user.id);
        
        // Make sure we have the user info
        if (!req.user || !req.user.id) {
            throw new Error('User information not available');
        }

        // Log activity with proper parameters
        await logActivity(
            req.user.id,      // User ID from request
            'admin',          // Role
            'getAllPatients', // Action
            { count: patients.length }
        );
        
        return patients;
    } catch (error) {
        console.error('Error in getAllPatients:', error);
        throw error;
    }
};

async function deletePatient(req, res) {
    const { patient_id } = req.params;

    try {
        // Debug logs
        console.log('Delete request params:', req.params);
        console.log('User from request:', req.user);
        
        // Validate user authentication
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Convert patient_id to number and validate
        const numericId = Number(patient_id);
        if (isNaN(numericId)) {
            return res.status(400).json({ message: 'Invalid patient ID format' });
        }

        const patient = await Patient.findOneAndDelete({ patient_id: numericId });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Log activity with the decoded user data
        await logActivity(
            req.user.id,      // From the decoded JWT token
            req.user.role,    // From the decoded JWT token
            'deletePatient',  // Action
            {                 // Details
                patient_id: numericId,
                name: patient.name || patient.fullname
            }
        );

        res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete patient: ' + error.message });
    }
}

async function addDentist(req, res) {
    const { name, email, password, phoneNumber } = req.body;

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

        // Log activity
        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'addDentist',
            details: { dentist_id: newDentist._id, name: newDentist.name, email: newDentist.email }
        });

        res.status(201).json({ message: 'Dentist added successfully', dentist: newDentist });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add dentist: ' + error.message });
    }
}

async function deleteDentist(dentistId, req) {
    try {
        const dentist = await Dentist.findByIdAndDelete(dentistId);
        if (!dentist) throw new Error('Dentist not found');

        // Log activity
        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'deleteDentist',
            details: { dentist_id: dentistId, name: dentist.name }
        });

        return dentist;
    } catch (error) {
        throw new Error('Failed to delete dentist');
    }
}

async function getAllAppointments(req, res) {
    try {
        const appointments = await Appointment.find({});

        // Log activity
        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'getAllAppointments',
            details: { count: appointments.length }
        });

        return res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve appointments: ' + error.message });
    }
}

async function sendReminders(req, res) {
    try {
        const appointments = await Appointment.find({ reminderSent: false, date: { $gte: new Date() } });
        
        appointments.forEach(appointment => {
            // Implement your reminder logic here
            appointment.reminderSent = true;
            appointment.save();
        });

        // Log activity
        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'sendReminders',
            details: { sentCount: appointments.length }
        });

        return res.status(200).json({ message: 'Reminders sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reminders: ' + error.message });
    }
}

async function updateCalendar(req, res) {
    try {
        const calendarData = req.body;
        // Assuming there is a Calendar model
        const calendar = new Calendar(calendarData);
        await calendar.save();

        // Log activity
        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'updateCalendar',
            details: { calendarData }
        });

        return res.status(200).json(calendar);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update calendar: ' + error.message });
    }
}

async function getReports(req, res) {
    try {
        const reports = {}; // Example: Generate reports here
        // Log activity
        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'getReports',
            details: { reportType: 'general' } // Adjust details as necessary
        });

        return res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate reports: ' + error.message });
    }
}

async function getInventory(req, res) {
    try {
        const inventory = await Inventory.find({});

        // Log activity
        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'getInventory',
            details: { count: inventory.length }
        });

        return res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve inventory: ' + error.message });
    }
}

async function addInventoryItem(req, res) {
    try {
        const inventoryData = req.body;
        const newItem = new Inventory(inventoryData);
        await newItem.save();

        // Log activity
        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'addInventoryItem',
            details: { itemId: newItem._id, itemName: newItem.name }
        });

        return res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add inventory item: ' + error.message });
    }
}

async function updateInventoryItem(req, res) {
    const { itemId } = req.params;
    const updateData = req.body;

    try {
        const item = await Inventory.findByIdAndUpdate(itemId, updateData, { new: true });
        if (!item) throw new Error('Item not found');

        // Log activity
        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'updateInventoryItem',
            details: { itemId: itemId, itemName: item.name }
        });

        return res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update inventory item: ' + error.message });
    }
}

async function deleteInventoryItem(req, res) {
    const { itemId } = req.params;

    try {
        const item = await Inventory.findByIdAndDelete(itemId);
        if (!item) throw new Error('Item not found');

        // Log activity
        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'deleteInventoryItem',
            details: { itemId: itemId, itemName: item.name }
        });

        return res.status(200).json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete inventory item: ' + error.message });
    }
};

async function getActivityLogs(req, res) {
    const { page = 1, limit = 10 } = req.query; // Accept pagination parameters from query

    try {
        const logs = await ActivityLog.find()
            .sort({ timestamp: -1 }) // Sort logs by newest first
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalLogs = await ActivityLog.countDocuments();

        res.status(200).json({
            logs,
            totalPages: Math.ceil(totalLogs / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve activity logs: ' + error.message });
    }
};



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
    createAdmin,
    getActivityLogs,
};
