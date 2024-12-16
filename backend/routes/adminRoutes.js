const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcrypt'); 
const path = require('path');
const A_route = express.Router();   
const adminService = require('../services/adminServices');
const lockService = require('../services/lockService');
const calendarService = require('../services/calendarServices');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { checkAdminLevel } = require('../middleware/adminLevelMiddleware');
const { checkPermission } = require('../middleware/checkPermissionMiddleware');
const { logActivity, ACTIONS } = require('../services/activitylogServices');
const { sendAdminVerificationEmail } = require('../emailService');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const deadlockPreventionMiddleware = require('../middleware/deadlockPreventionMiddleware');
const reportService = require('../services/reportService');
const BlockedDate = require('../models/BlockedDate');
const Appointment = require('../models/Appointment');
const Dentist = require('../models/Dentist');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile-pictures/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// Update the profile route to handle both MongoDB _id and admin_id
A_route.get('/:id/profile', authenticateAdmin, async (req, res) => {
    try {
        console.log('Fetching admin profile for ID:', req.params.id);
        let admin;

        // Try finding by MongoDB _id first
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            admin = await Admin.findById(req.params.id);
        }

        // If not found, try finding by admin_id
        if (!admin) {
            admin = await Admin.findOne({ admin_id: req.params.id });
        }

        if (!admin) {
            console.log('Admin not found for ID:', req.params.id);
            return res.status(404).json({ message: 'Admin not found' });
        }

        console.log('Admin found:', admin);

        const profileData = {
            _id: admin._id,
            admin_id: admin.admin_id,
            email: admin.email,
            fullname: admin.fullname,
            phoneNumber: admin.phoneNumber || '',
            sex: admin.sex || '',
            birthday: admin.birthday || '',
            isProfileComplete: admin.isProfileComplete || false,
            hasChangedPassword: admin.hasChangedPassword || false,
            profilePicture: admin.profilePicture || ''
        };
        
        res.json(profileData);
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ message: error.message });
    }
});
A_route.put('/:id/change-password', authenticateAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        let admin;

        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            admin = await Admin.findById(req.params.id);
        }

        if (!admin) {
            admin = await Admin.findOne({ admin_id: req.params.id });
        }

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and hasChangedPassword flag
        admin.password = hashedPassword;
        admin.hasChangedPassword = true;
        await admin.save();

        // Send back explicit confirmation
        res.json({ 
            message: 'Password changed successfully',
            hasChangedPassword: true 
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(400).json({ message: error.message });
    }
});
A_route.put('/:id/profile', authenticateAdmin, upload.single('profilePicture'), async (req, res) => {
    try {
        let updateData = {
            ...req.body,
            isProfileComplete: true
        };

        if (req.file) {
            updateData.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
        }

        let admin;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            admin = await Admin.findByIdAndUpdate(
                req.params.id,
                { $set: updateData },
                { new: true }
            ).select('-password'); // Exclude password from response
        }

        if (!admin) {
            admin = await Admin.findOneAndUpdate(
                { admin_id: req.params.id },
                { $set: updateData },
                { new: true }
            ).select('-password'); // Exclude password from response
        }

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Preserve the existing hasChangedPassword value
        res.json({
            ...admin.toObject(),
            isProfileComplete: true,
            hasChangedPassword: admin.hasChangedPassword || false
        });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({ message: error.message });
    }
});

A_route.get('/check-add-admin-lock', authenticateAdmin, async (req, res) => {
    const lockStatus = await adminService.checkAddUserLock('admin');
    res.json(lockStatus);
});

A_route.get('/check-add-dentist-lock', authenticateAdmin, async (req, res) => {
    const lockStatus = await adminService.checkAddUserLock('dentist');
    res.json(lockStatus);
});

A_route.get('/patients', authenticateAdmin, adminService.getAllPatients);
A_route.get('/admins', authenticateAdmin, adminService.getAllAdmins);
A_route.get('/dentists', authenticateAdmin, adminService.getAllDentists);

A_route.delete('/admins/:admin_id', authenticateAdmin, deadlockPreventionMiddleware, adminService.deleteAdmin);
A_route.delete('/patients/:patient_id', authenticateAdmin, deadlockPreventionMiddleware, adminService.deletePatient);
A_route.delete('/dentists/:dentist_id', authenticateAdmin, deadlockPreventionMiddleware, adminService.deleteDentist);    

A_route.post('/add-dentist', authenticateAdmin, adminService.addDentist);
A_route.post('/create', authenticateAdmin, checkPermission('manageAdmins'), adminService.createAdmin);

A_route.get('/appointments', authenticateAdmin, adminService.getAllAppointments);
A_route.get('/reports', adminService.getReports);

// Inventory Management
A_route.get('/inventory', authenticateAdmin, adminService.getInventory);
A_route.post('/inventory', authenticateAdmin, adminService.addInventoryItem);
A_route.put('/inventory/:itemId', authenticateAdmin, adminService.updateInventoryItem);
A_route.delete('/inventory/:item_id', authenticateAdmin, adminService.deleteInventoryItem);

A_route.get('/activity-logs', authenticateAdmin, async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .sort({ timestamp: -1 })
            .limit(500)
            .lean() // Convert to plain JavaScript objects
            .exec();

        // Format the logs without population
        const formattedLogs = logs.map(log => ({
            ...log,
            timestamp: log.timestamp,
            action: log.action,
            userRole: log.userRole,
            details: log.details || {}
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ message: 'Error fetching activity logs' });
    }
});

A_route.post('/check-user-lock', 
    authenticateAdmin, 
    deadlockPreventionMiddleware,
    async (req, res) => {
        const lockStatus = await lockService.acquireLock('add-user', req.user.id);
        res.json({
            ...lockStatus,
            currentUserId: req.user.id
        });
    }
);

A_route.post('/release-user-lock', 
    authenticateAdmin,
    async (req, res) => {
        const released = await lockService.releaseLock('add-user', req.user.id);
        res.json({ 
            message: released ? 'Lock released' : 'No lock found or not lock holder'
        });
    }
);

A_route.get('/reports/appointments', authenticateAdmin, async (req, res) => {
    try {
        const { period, year, month } = req.query;
        let startDate, endDate;

        console.log('Report request params:', { period, year, month });

        if (period === 'monthly' && year && month) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0);
        } else if (period === 'annual' && year) {
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31);
        } else {
            return res.status(400).json({ 
                message: 'Invalid period parameters',
                received: { period, year, month }
            });
        }

        console.log('Calculated date range:', { startDate, endDate });

        const report = await reportService.generateAppointmentReport(startDate, endDate);
        res.json(report);
    } catch (error) {
        console.error('Error in /reports/appointments:', error);
        res.status(500).json({ 
            message: 'Failed to generate report',
            error: error.message 
        });
    }
});

A_route.get('/inventory/check-lock/:itemId?', authenticateAdmin, async (req, res) => {
    const { itemId } = req.params;
    const lockKey = itemId ? `inventory-item-${itemId}` : 'inventory-operation';
    const lockStatus = await lockService.checkLock(lockKey);
    res.json({
        ...lockStatus,
        currentUserId: req.user._id
    });
});

A_route.post('/inventory/acquire-lock/:itemId?', authenticateAdmin, async (req, res) => {
    try {
        const { itemId } = req.params;
        const lockKey = itemId ? `inventory-item-${itemId}` : 'inventory-operation';
        const admin = await Admin.findById(req.user._id);
        const lockStatus = await lockService.acquireLock(lockKey, req.user._id);
        
        if (lockStatus.locked) {
            return res.status(423).json({
                locked: true,
                message: 'Another admin is currently modifying this item',
                currentEditor: lockStatus.currentEditor
            });
        }

        res.json({
            locked: false,
            message: 'Lock acquired successfully'
        });
    } catch (error) {
        console.error('Error acquiring lock:', error);
        res.status(500).json({ message: 'Failed to acquire lock' });
    }
});

A_route.post('/inventory/release-lock/:itemId?', authenticateAdmin, async (req, res) => {
    const { itemId } = req.params;
    const lockKey = itemId ? `inventory-item-${itemId}` : 'inventory-operation';
    const released = await lockService.releaseLock(lockKey, req.user._id);
    res.json({ 
        message: released ? 'Lock released' : 'No lock found or not lock holder'
    });
});

A_route.put('/permissions/:roleType', authenticateAdmin, async (req, res) => {
    try {
        const result = await adminService.updateRolePermissions(
            req.user.id,
            req.params.roleType,
            req.body.permissions
        );
        res.json(result);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
});

A_route.post('/promote/:adminId', authenticateAdmin, async (req, res) => {
    try {
        const result = await adminService.promoteToHighLevelAdmin(
            req.user.id,
            req.params.adminId
        );
        res.json(result);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
});

A_route.post('/promote', 
    authenticateAdmin, 
    checkAdminLevel('HIGH'), 
    adminService.promoteToHighLevelAdmin
);

A_route.post('/permissions', 
    authenticateAdmin, 
    checkAdminLevel('HIGH'), 
    adminService.updateRolePermissions
);

A_route.put('/admin-permissions/:adminId',
    authenticateAdmin,
    checkPermission('managePermissions'),
    async (req, res) => {
        try {
            const result = await adminService.updateAdminPermissions(
                req.user.id,
                req.params.adminId,
                req.body.permissions
            );
            res.json(result);
        } catch (error) {
            res.status(403).json({ message: error.message });
        }
    }
);

A_route.get('/current', authenticateAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({
            _id: admin._id,
            admin_id: admin.admin_id,
            permissionLevel: admin.permissionLevel,
            permissions: admin.permissions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

A_route.post('/register', 
    authenticateAdmin, 
    checkPermission('manageUsers'), 
    async (req, res) => {
        try {
            await adminService.createAdmin(req, res);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

A_route.post('/demote/:adminId', authenticateAdmin, async (req, res) => {
    try {
        const result = await adminService.demoteFromHighLevelAdmin(
            req.user.id,
            req.params.adminId
        );
        res.json(result);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
});

A_route.get('/reports/complete', authenticateAdmin, async (req, res) => {
    try {
        const { period, year, month } = req.query;
        
        if (!period || !year) {
            return res.status(400).json({ 
                message: 'Period and year are required parameters'
            });
        }

        const report = await reportService.generateCompleteReport(period, year, month);
        res.json(report);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to generate complete report',
            error: error.message 
        });
    }
});

A_route.get('/verify/:token', async (req, res) => {
    try {
        const admin = await Admin.findOne({
            verificationToken: req.params.token,
            verificationExpiry: { $gt: Date.now() }
        });

        if (!admin) {
            // Check if there's an already verified admin with this email
            const verifiedAdmin = await Admin.findOne({
                email: req.query.email,
                isVerified: true
            });

            if (verifiedAdmin) {
                return res.status(400).json({
                    message: 'Account has already been verified. Please proceed to login.'
                });
            }

            return res.status(400).json({
                message: 'Invalid verification token'
            });
        }

        admin.isVerified = true;
        admin.verificationToken = undefined;
        admin.verificationExpiry = undefined;
        await admin.save();

        await logActivity(admin._id, 'admin', 'VERIFY_ACCOUNT', { email: admin.email });

        res.status(200).json({ 
            message: 'Account verified successfully. You can now login with your Google account.',
            redirectUrl: `${process.env.FRONTEND_URL}/login`
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Verification failed: ' + error.message });
    }
});

A_route.get('/verify-admin/:token', async (req, res) => {
    try {
        const { token } = req.params;
        console.log('Received verification token:', token);
        
        const admin = await Admin.findOne({
            verificationToken: token
        });
        
        if (!admin) {
            // Check if there's an already verified admin
            const verifiedAdmin = await Admin.findOne({
                isVerified: true,
                verificationToken: undefined
            });

            if (verifiedAdmin) {
                return res.status(200).json({
                    message: 'Account has already been verified. Please proceed to login.',
                    status: 'already_verified'
                });
            }

            return res.status(400).json({
                message: 'The verification link is invalid or has already been used.',
                status: 'invalid_token'
            });
        }

        const currentTime = new Date();
        if (admin.verificationExpiry < currentTime) {
            return res.status(400).json({
                message: 'The verification link has expired. Please contact support for a new link.',
                status: 'expired_token'
            });
        }

        // Update admin status
        admin.isVerified = true;
        admin.verificationToken = undefined;
        admin.verificationExpiry = undefined;
        await admin.save();

        try {
            await logActivity(
                admin._id,
                'admin',
                'updateAdmin',
                { 
                    admin_id: admin.admin_id,
                    action: 'verify_account'
                }
            );
        } catch (logError) {
            console.error('Activity logging error:', logError);
        }

        res.status(200).json({
            message: 'Your account has been verified successfully! You can now login.',
            status: 'success'
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            message: 'An error occurred during verification. Please try again later.',
            status: 'error'
        });
    }
});
A_route.get('/verify-dentist/:token', async (req, res) => {
    try {
        const dentist = await Dentist.findOne({
            verificationToken: req.params.token,
            verificationExpiry: { $gt: Date.now() }
        });

        if (!dentist) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        dentist.isVerified = true;
        dentist.verificationToken = undefined;
        dentist.verificationExpiry = undefined;

        await dentist.save();

        res.status(200).json({ message: 'Dentist account verified successfully' });
    } catch (error) {
        console.error('Dentist verification error:', error);
        res.status(500).json({ message: 'Server error during dentist verification' });
    }
});

A_route.post('/calendar/events', authenticateAdmin, async (req, res) => {
    try {
        const result = await calendarService.addEvent(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error adding calendar event:', error);
        res.status(500).json({ message: error.message });
    }
});

A_route.get('/calendar/events', authenticateAdmin, async (req, res) => {
    try {
        const events = await calendarService.getEvents();
        res.json({ items: events });
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ message: error.message });
    }
});

A_route.delete('/calendar/events/:eventId', authenticateAdmin, async (req, res) => {
    try {
        await calendarService.deleteEvent(req.params.eventId);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({ message: error.message });
    }
});

A_route.put('/calendar/events/:eventId', authenticateAdmin, async (req, res) => {
    try {
        const result = await calendarService.updateEvent(req.params.eventId, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error updating calendar event:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all blocked dates
A_route.get('/calendar/blocked-dates', authenticateAdmin, async (req, res) => {
    try {
        const blockedDates = await calendarService.getBlockedDates();
        res.json(blockedDates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Block a date
A_route.post('/calendar/blocked-dates', authenticateAdmin, async (req, res) => {
    try {
        const blockedDate = await calendarService.blockDate(req.body.date);
        res.json(blockedDate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Unblock a date
A_route.delete('/calendar/blocked-dates', authenticateAdmin, async (req, res) => {
    try {
        await calendarService.unblockDate(req.body.date);
        res.json({ message: 'Date unblocked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get blocked status for specific date
A_route.get('/calendar/blocked-dates/:date', async (req, res) => {
    try {
        const inputDate = new Date(req.params.date);
        
        // Create start and end of day in local timezone
        const startOfDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
        const endOfDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate() + 1);

        const blockedDate = await BlockedDate.findOne({ 
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });
        res.json({ isBlocked: !!blockedDate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

A_route.get('/appointments/confirmed', authenticateAdmin, async (req, res) => {
    try {
        const confirmedAppointments = await Appointment.find({ status: 'confirmed' })
            .sort({ appointmentDate: 1, appointmentTime: 1 })
            .select('appointmentId patientName appointmentTime appointmentDate status dentistId requirements');

        // Log activity
        await logActivity(
            req.user.id,
            'admin',
            ACTIONS.APPOINTMENT_VIEW,
            { 
                count: confirmedAppointments.length,
                status: 'Successful',
                filter: 'confirmed'
            }
        );

        res.status(200).json(confirmedAppointments);
    } catch (error) {
        console.error('Error in getConfirmedAppointments:', error);
        res.status(500).json({ message: 'Failed to retrieve confirmed appointments: ' + error.message });
    }
});

A_route.get('/appointments/confirmed', authenticateAdmin, adminService.getConfirmedAppointments);

A_route.post('/appointments/assign', authenticateAdmin, async (req, res) => {
    try {
        const { appointmentId, dentistId } = req.body;

        // Find the appointment
        const appointment = await Appointment.findOne({ appointmentId });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Find the dentist using dentist_id instead of dentistId
        const dentist = await Dentist.findOne({ dentist_id: dentistId });
        if (!dentist) {
            console.error('Dentist not found for ID:', dentistId);
            return res.status(404).json({ 
                message: 'Dentist not found', 
                details: `No dentist with ID ${dentistId} exists` 
            });
        }

        // Assign the dentist
        appointment.dentistId = dentist._id;
        await appointment.save();

        // Log the activity
        await logActivity({
            userId: req.user._id,
            userRole: req.user.role,
            action: ACTIONS.APPOINTMENT_UPDATE,
            details: {
                appointmentId: appointment.appointmentId,
                dentistId: dentist.dentist_id,
                dentistName: dentist.name
            }
        });

        res.status(200).json({ 
            message: 'Dentist assigned successfully', 
            appointment 
        });
    } catch (error) {
        console.error('Error assigning dentist:', error);
        res.status(500).json({ 
            message: 'Failed to assign dentist', 
            error: error.message 
        });
    }
});
A_route.get('/dentists', authenticateAdmin, async (req, res) => {
    try {
        const dentists = await Dentist.find({});
        
        // Log the dentists for debugging
        console.log('Fetched Dentists:', dentists.map(d => ({
            dentist_id: d.dentist_id,
            name: d.name
        })));

        res.status(200).json(dentists);
    } catch (error) {
        console.error('Error fetching dentists:', error);
        res.status(500).json({ 
            message: 'Failed to fetch dentists', 
            error: error.message 
        });
    }
});
module.exports = A_route;