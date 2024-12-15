const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const InventoryItem = require('../models/Inventory');
const Appointment = require('../models/Appointment');

// Create a new consultation
router.post('/', async (req, res) => {
  try {
    const { 
      appointmentId, 
      consultationDate, 
      consultationDetails, 
      prescription 
    } = req.body;

    // Find the appointment to get patient and dentist IDs
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Validate medicine availability
    for (let item of prescription) {
      const inventoryItem = await InventoryItem.findById(item.medicineId);
      
      if (!inventoryItem) {
        return res.status(400).json({ 
          message: `Medicine with ID ${item.medicineId} not found` 
        });
      }

      if (inventoryItem.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${inventoryItem.itemName}` 
        });
      }
    }

    // Deduct medicines from inventory
    for (let item of prescription) {
      await InventoryItem.findByIdAndUpdate(
        item.medicineId, 
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Create consultation
    const consultation = new Consultation({
      appointmentId,
      patientId: appointment.patientId,
      dentistId: appointment.dentistId,
      consultationDate,
      notes: consultationDetails,
      treatment: consultationDetails,
      prescription
    });

    await consultation.save();
    res.status(201).json(consultation);
  } catch (error) {
    console.error("Consultation creation error:", error);
    res.status(500).json({ message: "Error creating consultation", error: error.message });
  }
});

module.exports = router;