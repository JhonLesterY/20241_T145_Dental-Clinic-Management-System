const express = require('express');
const mongoose = require('mongoose');
const A_route = express.Router();   
const adminService = require('../services/adminServices');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const bcrypt = require('bcrypt'); 
const Admin = require('../models/Admin');
const path = require('path');

const ActivityLog = require('../models/ActivityLog');
const lockService = require('../services/lockService');
const deadlockPreventionMiddleware = require('../middleware/deadlockPreventionMiddleware');
const reportService = require('../services/reportService');


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
A_route.post('/create', authenticateAdmin, adminService.createAdmin);

A_route.get('/appointments', authenticateAdmin, adminService.getAllAppointments);
A_route.post('/appointments/reminders', adminService.sendReminders);
A_route.post('/calendar', adminService.updateCalendar);
A_route.get('/reports', adminService.getReports);

// Inventory Management
A_route.get('/inventory', authenticateAdmin, adminService.getInventory);
A_route.post('/inventory', authenticateAdmin, adminService.addInventoryItem);
A_route.put('/inventory/:item_id', authenticateAdmin, adminService.updateInventoryItem);
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

module.exports = A_route;