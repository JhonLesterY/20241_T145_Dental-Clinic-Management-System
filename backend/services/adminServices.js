const Admin = require('../models/Admin');
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const Appointment = require('../models/Appointment');
const Inventory = require('../models/Inventory');
const bcrypt = require('bcryptjs');
const { logActivity, ACTIONS } = require('../services/activitylogServices');
const { sendWelcomeEmail } = require('../emailService'); 

const secretKey = process.env.JWT_SECRET_KEY; 

async function createAdmin(req, res) {
    try {
        const existingAdmin = await Admin.findOne({ email: req.body.email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists.' });
        }

        // Generate a random password
        const generatedPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const lastAdmin = await Admin.findOne().sort({ admin_id: -1 });
        const newAdminId = lastAdmin ? lastAdmin.admin_id + 1 : 1;

        const newAdmin = new Admin({
            admin_id: newAdminId,
            fullname: req.body.fullname,
            email: req.body.email,
            password: hashedPassword,
            role: 'admin',
        });

        await newAdmin.save();

        // Send welcome email with generated password
        await sendWelcomeEmail({
            email: req.body.email,
            name: req.body.fullname,
            temporaryPassword: generatedPassword
        });

        // Log activity
        await logActivity(req.user.id, req.user.role, 'createAdmin', { adminId: newAdmin._id });

        res.status(201).json({ 
            message: 'Admin created successfully. Login credentials have been sent to their email.',
            admin: { ...newAdmin.toObject(), password: undefined }
        });
    } catch (error) {
        console.error('Failed to create admin:', error);
        res.status(500).json({ message: 'Failed to create admin: ' + error.message });
    }
}

// Get all admins
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}).select('-password');
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Failed to fetch admins' });
    }
};
//Get all dentists
async function getAllDentists(req, res) {
    try {
        const dentists = await Dentist.find({}).select('-password'); // Exclude password from the response
        
        // Log activity
        await logActivity(
            req.user.id,
            req.user.role,
            'getAllDentists',
            { count: dentists.length }
        );

        res.status(200).json(dentists);
    } catch (error) {
        console.error('Error in getAllDentists:', error);
        res.status(500).json({ message: 'Failed to retrieve dentists: ' + error.message });
    }
};
const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find().select('-password');
        res.status(200).json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Failed to fetch patients' });
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

        // First find and delete the patient
        const deletedPatient = await Patient.findOneAndDelete({ patient_id: numericId });
        if (!deletedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Get all patients with ID greater than the deleted one
        const patientsToUpdate = await Patient.find({ 
            patient_id: { $gt: numericId }
        }).sort({ patient_id: 1 });

        // Update each patient's ID to decrement by 1
        for (const patient of patientsToUpdate) {
            await Patient.findByIdAndUpdate(
                patient._id,
                { $set: { patient_id: patient.patient_id - 1 } }
            );
        }

        // Log activity with the decoded user data
        await logActivity(
            req.user.id,      
            req.user.role,    
            'deletePatient',  
            {                 
                patient_id: numericId,
                name: deletedPatient.name || deletedPatient.fullname,
                affected_ids: patientsToUpdate.length
            }
        );

        res.status(200).json({ 
            message: 'Patient deleted successfully',
            reorderedCount: patientsToUpdate.length
        });
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

        // Get the last dentist to determine the next dentist_id
        const lastDentist = await Dentist.findOne().sort({ dentist_id: -1 });
        const nextDentistId = lastDentist ? lastDentist.dentist_id + 1 : 1;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newDentist = new Dentist({
            dentist_id: nextDentistId, // Add this line
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
            details: { dentist_id: newDentist.dentist_id, name: newDentist.name, email: newDentist.email }
        });

        res.status(201).json({ message: 'Dentist added successfully', dentist: newDentist });
    } catch (error) {
        console.error('Error adding dentist:', error); // Add this for better debugging
        res.status(500).json({ message: 'Failed to add dentist: ' + error.message });
    }
}

async function deleteDentist(req, res) {
    try {
        const { dentist_id } = req.params;
        console.log('Attempting to delete dentist with ID:', dentist_id);

        // First find and delete the dentist
        const deletedDentist = await Dentist.findOneAndDelete({ dentist_id: parseInt(dentist_id) });
        
        if (!deletedDentist) {
            return res.status(404).json({ message: 'Dentist not found' });
        }

        // Get all dentists with ID greater than the deleted one
        const dentistsToUpdate = await Dentist.find({ 
            dentist_id: { $gt: parseInt(dentist_id) }
        }).sort({ dentist_id: 1 });

        // Update each dentist's ID to decrement by 1
        for (const dentist of dentistsToUpdate) {
            await Dentist.findByIdAndUpdate(
                dentist._id,
                { $set: { dentist_id: dentist.dentist_id - 1 } }
            );
        }

        // Log activity
        await logActivity(
            req.user.id,
            req.user.role,
            'deleteDentist',
            { 
                dentist_id: dentist_id, 
                name: deletedDentist.name,
                affected_ids: dentistsToUpdate.length
            }
        );

        res.status(200).json({ 
            message: 'Dentist deleted successfully',
            reorderedCount: dentistsToUpdate.length
        });
    } catch (error) {
        console.error('Error deleting dentist:', error);
        res.status(500).json({ message: 'Failed to delete dentist: ' + error.message });
    }
}

// Add this function
async function deleteAdmin(req, res) {
    try {
        const { admin_id } = req.params;
        console.log('Attempting to delete admin with ID:', admin_id);

        // Prevent deleting the last admin
        const adminCount = await Admin.countDocuments();
        if (adminCount <= 1) {
            return res.status(400).json({ message: 'Cannot delete the last admin account' });
        }

        // First find and delete the admin
        const deletedAdmin = await Admin.findOneAndDelete({ admin_id: parseInt(admin_id) });
        
        if (!deletedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Get all admins with ID greater than the deleted one
        const adminsToUpdate = await Admin.find({ 
            admin_id: { $gt: parseInt(admin_id) }
        }).sort({ admin_id: 1 });

        // Update each admin's ID to decrement by 1
        for (const admin of adminsToUpdate) {
            await Admin.findByIdAndUpdate(
                admin._id,
                { $set: { admin_id: admin.admin_id - 1 } }
            );
        }

        // Log activity
        await logActivity(
            req.user.id,
            req.user.role,
            'deleteAdmin',
            { 
                admin_id: admin_id, 
                name: deletedAdmin.fullname,
                affected_ids: adminsToUpdate.length
            }
        );

        res.status(200).json({ 
            message: 'Admin deleted successfully',
            reorderedCount: adminsToUpdate.length
        });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ message: 'Failed to delete admin: ' + error.message });
    }
}

async function getAllAppointments(req, res) {
    try {
        // Verify admin is authenticated
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const appointments = await Appointment.find({})
            .sort({ appointmentDate: -1, appointmentTime: 1 })
            .select('appointmentId patientName appointmentTime appointmentDate status userId requirements');

        // Log activity with proper user data
        await logActivity(
            req.user.id,
            'admin',
            ACTIONS.APPOINTMENT_VIEW,
            { 
                count: appointments.length,
                status: 'Successful'
            }
        );

        console.log(`Admin fetched ${appointments.length} appointments`);
        return res.status(200).json(appointments);
    } catch (error) {
        console.error('Error in getAllAppointments:', error);
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

// Add these functions to your adminServices.js
async function getAdminProfile(admin_id) {
    try {
        console.log('Looking for admin with ID:', admin_id);
        
        const admin = await Admin.findOne({ admin_id });
        
        if (!admin) {
            console.log('Admin not found in database');
            throw new Error('Admin not found');
        }

        console.log('Found admin status:', {
            isProfileComplete: admin.isProfileComplete,
            hasChangedPassword: admin.hasChangedPassword
        });
        
        return {
            fullname: admin.fullname || '',
            email: admin.email,  // Don't provide default for email since it's required
            phoneNumber: admin.phoneNumber || '',
            sex: admin.sex || 'Male',
            birthday: admin.birthday || '',
            isProfileComplete: admin.isProfileComplete || false,
            hasChangedPassword: admin.hasChangedPassword || false,
            profilePicture: admin.profilePicture || ''
        };
    } catch (error) {
        console.error('Error in getAdminProfile:', error);
        throw error;
    }
}

async function updateAdminProfile(admin_id, updateData) {
    try {
        const updatedAdmin = await Admin.findOneAndUpdate(
            { admin_id },
            { 
                ...updateData,
                isProfileComplete: true,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedAdmin) {
            throw new Error('Admin not found');
        }

        return updatedAdmin;
    } catch (error) {
        throw new Error(error.message);
    }
}

async function changeAdminPassword(adminId, currentPassword, newPassword) {
    try {
        const admin = await Admin.findById(adminId);
        
        if (!admin) {
            throw new Error('Admin not found');
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { 
                $set: {
                    password: hashedPassword,
                    hasChangedPassword: true,
                    updatedAt: Date.now()
                }
            },
            { new: true }
        );

        return {
            message: 'Password updated successfully',
            hasChangedPassword: true
        };
    } catch (error) {
        console.error('Error in changeAdminPassword:', error);
        throw error;
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
    createAdmin,
    getActivityLogs,
    getAllDentists,
    getAllAdmins,
    deleteAdmin,
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword,
};
