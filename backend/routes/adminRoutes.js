const express = require('express');
const A_route = express.Router();   
const adminService = require('../services/adminServices');

// Admin Login
A_route.post('/register', adminService.registerAdmin);
A_route.post('/login', adminService.loginAdmin);

// User and Appointment Management  
A_route.get('/patients', adminService.getAllPatients);
A_route.get('/dentists', adminService.getAllDentists);
A_route.delete('/patients/:patient_id', adminService.deletePatient);
A_route.delete('/dentists/:dentist_id', adminService.deleteDentist);    
A_route.get('/appointments', adminService.getAllAppointments);
A_route.post('/appointments/reminders', adminService.sendReminders);

// Calendar and Report Management
A_route.post('/calendar', adminService.updateCalendar);
A_route.get('/reports', adminService.getReports);

// Inventory Management
A_route.get('/inventory', adminService.getInventory);
A_route.post('/inventory', adminService.addInventoryItem);
A_route.put('/inventory/:item_id', adminService.updateInventoryItem);
A_route.delete('/inventory/:item_id', adminService.deleteInventoryItem);

module.exports = A_route;
