const express = require('express');
const A_route = express.Router();   
const adminService = require('../services/adminServices');
const { authenticateAdmin } = require('../middleware/authMiddleware');
 
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

module.exports = A_route;
