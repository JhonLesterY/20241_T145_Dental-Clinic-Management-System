const express = require('express');
const A_route = express.Router();   
const adminService = require('../services/adminServices');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const bcrypt = require('bcrypt'); 
const Admin = require('../models/Admin');
const path = require('path');
const { checkAdminProfileCompletion } = require('../middleware/profileCheckMiddleware');

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
 

A_route.get('/patients', authenticateAdmin, async (req, res) => {
    try {
        const patients = await adminService.getAllPatients(req);
        res.status(200).json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Failed to fetch patients' });
    }
});
A_route.get('/admins', authenticateAdmin, adminService.getAllAdmins);
A_route.get('/dentists', authenticateAdmin, adminService.getAllDentists);


A_route.delete('/admins/:admin_id', authenticateAdmin, adminService.deleteAdmin);
A_route.delete('/patients/:patient_id', authenticateAdmin, adminService.deletePatient);
A_route.delete('/dentists/:dentist_id', authenticateAdmin, adminService.deleteDentist);    


A_route.post('/add-dentist', authenticateAdmin, adminService.addDentist);
A_route.post('/create', authenticateAdmin, adminService.createAdmin);


A_route.get('/appointments', adminService.getAllAppointments);
A_route.post('/appointments/reminders', adminService.sendReminders);
A_route.post('/calendar', adminService.updateCalendar);
A_route.get('/reports', adminService.getReports);

// Inventory Management
A_route.get('/inventory', adminService.getInventory);
A_route.post('/inventory', adminService.addInventoryItem);
A_route.put('/inventory/:item_id', adminService.updateInventoryItem);
A_route.delete('/inventory/:item_id', adminService.deleteInventoryItem);

A_route.get('/activity-logs', adminService.getActivityLogs); // New route for activity logs

// Make sure these routes are properly defined
// Update the profile routes to use the current admin's ID from the token
A_route.get('/:admin_id/profile', authenticateAdmin, async (req, res) => {
    try {
      const admin = await adminService.getAdminProfile(req.params.admin_id);
      res.json(admin);
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      res.status(500).json({ message: error.message });
    }
});

A_route.put('/:admin_id/profile', authenticateAdmin, upload.single('profilePicture'), async (req, res) => {
    try {
      const updateData = {
        ...req.body,
        isProfileComplete: true
      };
  
      if (req.file) {
        updateData.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
      }
  
      const admin = await adminService.updateAdminProfile(req.params.admin_id, updateData);
      res.json(admin);
    } catch (error) {
      console.error('Error updating admin profile:', error);
      res.status(500).json({ message: error.message });
    }
  });

A_route.post('/:admin_id/change-password', authenticateAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        await adminService.changeAdminPassword(req.params.admin_id, currentPassword, newPassword);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(400).json({ message: error.message });
    }
});

A_route.use(checkAdminProfileCompletion);

module.exports = A_route;
