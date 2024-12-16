const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const InventoryItem = require('../models/Inventory');
const Appointment = require('../models/Appointment');

// Create a new consultation
router.get('/', async (req, res) => {
  try {
    const consultations = await Consultation.find({})
      .populate({
        path: 'patientId',
        select: 'firstName lastName middleName email phoneNumber suffix',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'appointmentId',
        select: 'patientName'
      })
      .populate({
        path: 'dentistId',
        select: 'name email',
        options: { strictPopulate: false }
      })
      .sort({ consultationDate: -1 });

    // Debug logging for problematic consultations
    const problematicConsultations = consultations.filter(consultation => 
      !consultation.patientId || !consultation.dentistId
    );

    if (problematicConsultations.length > 0) {
      console.warn('Consultations with missing patient or dentist references:', 
        problematicConsultations.map(c => ({
          consultationId: c._id,
          patientId: c.patientId,
          dentistId: c.dentistId
        }))
      );
    }

    // Transform consultations to include patient and dentist details
    const formattedConsultations = consultations.map(consultation => {
      // Construct full patient name with optional middle name and suffix
      const constructFullName = (patient, appointmentName) => {
        // First try patient details from patientId
        if (patient) {
          const nameParts = [
            patient.firstName || '',
            patient.middleName ? ` ${patient.middleName}` : '',
            patient.lastName || '',
            patient.suffix ? ` ${patient.suffix}` : ''
          ];
          
          const constructedName = nameParts.join('').trim();
          return constructedName || 'Unknown Patient';
        }
        
        // Fallback to appointment patient name
        return appointmentName || 'Unknown Patient';
      };

      return {
        _id: consultation._id,
        patientName: constructFullName(
          consultation.patientId, 
          consultation.appointmentId?.patientName
        ),
        patientFullDetails: consultation.patientId ? {
          firstName: consultation.patientId.firstName || '',
          middleName: consultation.patientId.middleName || '',
          lastName: consultation.patientId.lastName || '',
          suffix: consultation.patientId.suffix || '',
          email: consultation.patientId.email || '',
          phoneNumber: consultation.patientId.phoneNumber || ''
        } : null,
        patientEmail: consultation.patientId?.email || '',
        patientPhone: consultation.patientId?.phoneNumber || '',
        dentistName: consultation.dentistId?.name || 'Unknown Dentist',
        consultationDate: consultation.consultationDate,
        notes: consultation.notes,
        treatment: consultation.treatment,
        prescription: consultation.prescription,
        usedItems: consultation.usedItems || []
      };
    });

    // Additional logging for debugging
    console.log('Formatted Consultations:', formattedConsultations.map(c => ({
      id: c._id,
      patientName: c.patientName,
      patientFullDetails: c.patientFullDetails
    })));

    res.status(200).json(formattedConsultations);
  } catch (error) {
    console.error("Error fetching consultations:", error);
    res.status(500).json({ 
      message: "Failed to fetch consultations", 
      error: error.message 
    });
  }
});
router.get('/diagnostic', async (req, res) => {
  try {
    // Find consultations with invalid or missing references
    const problematicConsultations = await Consultation.find({
      $or: [
        { patientId: { $exists: false } },
        { patientId: null },
        { dentistId: { $exists: false } },
        { dentistId: null }
      ]
    });

    // Attempt to find matching patients and dentists
    const diagnosticResults = await Promise.all(
      problematicConsultations.map(async (consultation) => {
        // Try to find related appointment to get patient and dentist
        const appointment = await Appointment.findById(consultation.appointmentId)
          .populate('patientId')
          .populate('dentistId');

        if (appointment) {
          // Update consultation with found references
          consultation.patientId = appointment.patientId;
          consultation.dentistId = appointment.dentistId;
          
          try {
            await consultation.save();
            return {
              consultationId: consultation._id,
              status: 'FIXED',
              patientId: consultation.patientId,
              dentistId: consultation.dentistId
            };
          } catch (saveError) {
            return {
              consultationId: consultation._id,
              status: 'SAVE_ERROR',
              error: saveError.message
            };
          }
        }

        return {
          consultationId: consultation._id,
          status: 'NO_MATCHING_APPOINTMENT',
          appointmentId: consultation.appointmentId
        };
      })
    );

    res.status(200).json({
      totalProblematicConsultations: problematicConsultations.length,
      diagnosticResults
    });
  } catch (error) {
    console.error("Error in consultation diagnostic route:", error);
    res.status(500).json({ 
      message: "Failed to run consultation diagnostic", 
      error: error.message 
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { 
      appointmentId, 
      consultationDate, 
      consultationDetails, 
      prescription 
    } = req.body;

    const enrichedPrescription = await Promise.all(prescription.map(async (med) => {
      try {
        const medicineItem = await InventoryItem.findById(med.medicineId);
        return {
          medicineId: med.medicineId,
          medicineName: medicineItem ? medicineItem.itemName : med.medicineName || 'Unknown Medicine',
          quantity: med.quantity
        };
      } catch (error) {
        console.warn(`Could not find medicine for ID: ${med.medicineId}`, error);
        return {
          medicineId: med.medicineId,
          medicineName: med.medicineName || 'Unknown Medicine',
          quantity: med.quantity
        };
      }
    }));

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
      prescription: enrichedPrescription
    });

    await consultation.save();
    res.status(201).json(consultation);
  } catch (error) {
    console.error("Consultation creation error:", error);
    res.status(500).json({ message: "Error creating consultation", error: error.message });
  }
});

router.post('/:consultationId/used-items', async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { usedItems } = req.body;

    // Validate input
    if (!usedItems || !Array.isArray(usedItems) || usedItems.length === 0) {
      return res.status(400).json({ message: 'Invalid used items data' });
    }

    // Find the consultation
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Validate and prepare used items
    const validatedUsedItems = usedItems.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      quantity: item.quantity,
      dateUsed: item.dateUsed || new Date()
    }));

    // Add used items to the consultation
    consultation.usedItems = validatedUsedItems;
    await consultation.save();

    res.status(200).json({ 
      message: 'Used items added successfully', 
      consultation: consultation 
    });
  } catch (error) {
    console.error('Error adding used items:', error);
    res.status(500).json({ 
      message: 'Failed to add used items', 
      error: error.message 
    });
  }
});
module.exports = router;