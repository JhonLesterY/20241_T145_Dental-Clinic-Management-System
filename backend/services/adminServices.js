const Admin = require('../models/Admin');
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const Appointment = require('../models/Appointment');
const Inventory = require('../models/Inventory');
const bcrypt = require('bcryptjs');
const { logActivity, ACTIONS } = require('../services/activitylogServices');
const { sendWelcomeEmail, sendAdminVerificationEmail } = require('../emailService'); 
const lockService = require('../services/lockService');
const crypto = require('crypto');

const secretKey = process.env.JWT_SECRET_KEY; 

async function createAdmin(req, res) {
    try {
        const existingAdmin = await Admin.findOne({ email: req.body.email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists.' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        console.log('Generated verification token:', verificationToken);

        const lastAdmin = await Admin.findOne().sort({ admin_id: -1 });
        const newAdminId = lastAdmin ? lastAdmin.admin_id + 1 : 1;

        const newAdmin = new Admin({
            admin_id: newAdminId,
            fullname: req.body.fullname,
            email: req.body.email,
            isGoogleUser: req.body.isGoogleUser || true,
            verificationToken: verificationToken,
            verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
            permissionLevel: req.body.permissionLevel,
            permissions: req.body.permissions,
            isVerified: false
        });

        const savedAdmin = await newAdmin.save();
        console.log('Saved admin:', {
            id: savedAdmin._id,
            email: savedAdmin.email,
            verificationToken: savedAdmin.verificationToken
        });

        if (req.body.sendVerificationEmail) {
            await sendAdminVerificationEmail({
                email: savedAdmin.email,
                name: savedAdmin.fullname,
                token: verificationToken,
                role: 'admin'
            });
        }

        res.status(201).json({ 
            message: 'Admin created successfully. Verification email sent.',
            admin: {
                admin_id: newAdmin.admin_id,
                email: newAdmin.email,
                fullname: newAdmin.fullname
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
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
    const lockStatus = await lockService.acquireLock('delete-patient', req.user.id);
    if (lockStatus.locked) {
        return res.status(423).json({
            message: 'Another administrator is currently deleting a patient record. Please try again in a few seconds.',
            remainingTime: lockStatus.remainingTime
        });
    }

    try {
        const { patient_id } = req.params;
        const deletedPatient = await Patient.findOneAndDelete({ patient_id: parseInt(patient_id) });
        
        if (!deletedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Log activity
        await logActivity(
            req.user.id,
            req.user.role,
            'deletePatient',
            { 
                patient_id: patient_id,
                name: deletedPatient.name
            }
        );

        res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error('Error in deletePatient:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        // Release the lock
        await lockService.releaseLock('delete-patient', req.user.id);
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
    const lockStatus = await lockService.acquireLock('delete-operation', req.user.id);
    if (lockStatus.locked) {
        return res.status(423).json({
            message: lockStatus.message || 'Another delete operation is in progress. Please try again in a few seconds.',
            remainingTime: lockStatus.remainingTime
        });
    }

    try {
        const { dentist_id } = req.params;
        const deletedDentist = await Dentist.findOneAndDelete({ dentist_id: parseInt(dentist_id) });
        
        if (!deletedDentist) {
            return res.status(404).json({ message: 'Dentist not found' });
        }

        // Log activity
        await logActivity(
            req.user.id,
            req.user.role,
            'deleteDentist',
            { 
                dentist_id: dentist_id,
                name: deletedDentist.name
            }
        );

        res.status(200).json({ message: 'Dentist deleted successfully' });
    } catch (error) {
        console.error('Error in deleteDentist:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await lockService.releaseLock('delete-operation', req.user.id);
    }
}

// Add this function
async function deleteAdmin(req, res) {
    const lockStatus = await lockService.acquireLock('delete-operation', req.user.id);
    if (lockStatus.locked) {
        return res.status(423).json({
            message: lockStatus.message || 'Another delete operation is in progress. Please try again in a few seconds.',
            remainingTime: lockStatus.remainingTime
        });
    }

    try {
        const adminId = req.params.admin_id; // This will be the _id
        console.log('Attempting to delete admin with ID:', adminId);

        // Prevent deleting the last admin
        const adminCount = await Admin.countDocuments();
        if (adminCount <= 1) {
            return res.status(400).json({ message: 'Cannot delete the last admin account' });
        }

        // Find and delete the admin using _id
        const deletedAdmin = await Admin.findByIdAndDelete(adminId);
        
        if (!deletedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Log activity
        await logActivity(
            req.user.id,
            req.user.role,
            'deleteAdmin',
            { 
                admin_id: deletedAdmin.admin_id,
                name: deletedAdmin.fullname
            }
        );

        res.status(200).json({ 
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteAdmin:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await lockService.releaseLock('delete-operation', req.user.id);
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
        const items = await Inventory.find({});
        return res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch inventory items: ' + error.message });
    }
}

async function addInventoryItem(req, res) {
    const lockKey = 'inventory-operation';
    
    try {
        // Try to acquire lock
        const lockStatus = await lockService.acquireLock(lockKey, req.user._id);
        if (lockStatus.locked) {
            return res.status(423).json({
                message: 'Another admin is currently modifying inventory. Please try again later.',
                remainingTime: lockStatus.remainingTime
            });
        }

        const inventoryData = req.body;
        const newItem = new Inventory(inventoryData);
        await newItem.save();

        // Log activity only for write operations
        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'addInventoryItem',
            details: { itemId: newItem._id, itemName: newItem.itemName }
        });

        // Release lock
        await lockService.releaseLock(lockKey, req.user._id);

        return res.status(201).json(newItem);
    } catch (error) {
        // Make sure to release lock even if there's an error
        await lockService.releaseLock(lockKey, req.user._id);
        res.status(500).json({ message: 'Failed to add inventory item: ' + error.message });
    }
}

async function updateInventoryItem(req, res) {
    const { itemId } = req.params;
    const updateData = req.body;
    const lockKey = `inventory-item-${itemId}`;

    try {
        const lockStatus = await lockService.acquireLock(lockKey, req.user._id);
        if (lockStatus.locked) {
            return res.status(423).json({
                message: 'Another admin is currently modifying this item. Please try again later.',
                remainingTime: lockStatus.remainingTime
            });
        }

        const item = await Inventory.findByIdAndUpdate(itemId, updateData, { new: true });
        if (!item) throw new Error('Item not found');

        await logActivity({
            userId: req.user._id,
            userRole: 'admin',
            action: 'updateInventoryItem',
            details: { itemId: itemId, itemName: item.itemName }
        });

        await lockService.releaseLock(lockKey, req.user._id);
        return res.status(200).json(item);
    } catch (error) {
        await lockService.releaseLock(lockKey, req.user._id);
        res.status(500).json({ message: 'Failed to update inventory item: ' + error.message });
    }
}

async function deleteInventoryItem(req, res) {
    const { itemId } = req.params;

    try {
        const item = await Inventory.findByIdAndDelete(itemId);
        if (!item) throw new Error('Item not found');

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
}

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

const updateRolePermissions = async (adminId, targetRole, permissions) => {
    try {
        const admin = await Admin.findById(adminId);
        if (!admin || !admin.canManagePermissions) {
            throw new Error('Unauthorized to manage permissions');
        }

        const validRole = ['ADMIN', 'DENTIST', 'PATIENT'].includes(targetRole.toUpperCase());
        if (!validRole) {
            throw new Error('Invalid role type');
        }

        const Model = {
            ADMIN: Admin,
            DENTIST: Dentist,
            PATIENT: Patient
        }[targetRole.toUpperCase()];

        await Model.updateMany({}, { 
            $set: { permissions: permissions }
        });

        await logActivity(
            adminId,
            'admin',
            'UPDATE_PERMISSIONS',
            { role: targetRole, permissions: permissions }
        );

        return { success: true, message: `Updated permissions for ${targetRole}` };
    } catch (error) {
        throw error;
    }
};

const promoteToHighLevelAdmin = async (adminId, targetAdminId) => {
    try {
        const admin = await Admin.findById(adminId);
        if (!admin || admin.permissionLevel !== 'HIGH') {
            throw new Error('Unauthorized to promote admins');
        }

        await Admin.findByIdAndUpdate(targetAdminId, {
            permissionLevel: 'HIGH',
            permissions: {
                manageUsers: true,
                manageAppointments: true,
                viewReports: true,
                managePermissions: true,
                manageInventory: true,
                manageCalendar: true
            }
        });

        await logActivity(
            adminId,
            'admin',
            'PROMOTE_ADMIN',
            { targetAdminId }
        );

        return { success: true };
    } catch (error) {
        throw error;
    }
};

const updateAdminPermissions = async (adminId, targetAdminId, permissions) => {
    try {
        const admin = await Admin.findById(adminId);
        if (!admin || admin.permissionLevel !== 'HIGH') {
            throw new Error('Unauthorized to manage admin permissions');
        }

        const targetAdmin = await Admin.findById(targetAdminId);
        if (!targetAdmin) {
            throw new Error('Target admin not found');
        }

        if (targetAdmin.permissionLevel === 'HIGH' && 
            targetAdmin._id.toString() !== adminId.toString()) {
            throw new Error('Cannot modify permissions of another HIGH level admin');
        }

        await Admin.findByIdAndUpdate(targetAdminId, {
            permissions: {
                ...targetAdmin.permissions,
                ...permissions
            }
        });

        await logActivity(
            adminId,
            'admin',
            'UPDATE_ADMIN_PERMISSIONS',
            { 
                targetAdminId,
                updatedPermissions: permissions 
            }
        );

        return { 
            success: true, 
            message: 'Admin permissions updated successfully' 
        };
    } catch (error) {
        throw error;
    }
};

const demoteFromHighLevelAdmin = async (adminId, targetAdminId) => {
    try {
        const admin = await Admin.findById(adminId);
        if (!admin || admin.permissionLevel !== 'HIGH') {
            throw new Error('Unauthorized to demote admins');
        }

        const targetAdmin = await Admin.findById(targetAdminId);
        if (!targetAdmin) {
            throw new Error('Target admin not found');
        }

        // Prevent self-demotion if they're the last HIGH admin
        if (targetAdmin._id.toString() === adminId.toString()) {
            const highAdminCount = await Admin.countDocuments({ permissionLevel: 'HIGH' });
            if (highAdminCount <= 1) {
                throw new Error('Cannot demote the last HIGH level admin');
            }
        }

        await Admin.findByIdAndUpdate(targetAdminId, {
            permissionLevel: 'STANDARD',
            permissions: {
                manageUsers: false,
                manageAppointments: false,
                viewReports: false,
                managePermissions: false,
                manageInventory: false,
                manageCalendar: false
            }
        });

        await logActivity(
            adminId,
            'admin',
            'DEMOTE_ADMIN',
            { targetAdminId }
        );

        return { 
            success: true,
            message: 'Admin demoted successfully'
        };
    } catch (error) {
        throw error;
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
    getAllDentists,
    getAllAdmins,
    deleteAdmin,
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword,
    updateRolePermissions,
    promoteToHighLevelAdmin,
    updateAdminPermissions,
    demoteFromHighLevelAdmin,
    
};
