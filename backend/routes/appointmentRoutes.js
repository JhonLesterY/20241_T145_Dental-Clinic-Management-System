const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const { logActivity, ACTIONS } = require('../services/activitylogServices');

// Define time slots (same as frontend)
const TIME_SLOTS = [
  { time: "8:00 - 10:00 AM", id: 1, maxSlots: 3 },
  { time: "10:30 - 12:30 NN", id: 2, maxSlots: 3 },
  { time: "1:00 - 3:00 PM", id: 3, maxSlots: 3 },
  { time: "3:00 - 5:00 PM", id: 4, maxSlots: 3 }
];

const verifyAndDecodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('Decoded token:', decoded); // Add this debug log
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
};

router.use((req, res, next) => {
  console.log(`Appointment Route accessed: ${req.method} ${req.url}`);
  next();
});

router.get('/latest', async (req, res) => {
  try {
    // Get the token from the request headers
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Decode the token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

        const updatedAppointment = await adminService.updateAppointmentStatus(
            adminId,
            id,
            status
        );

    // Get the user's latest appointment with strict userId matching
    const appointment = await Appointment.findOne({ 
      userId: userId  // Ensure exact match with the logged-in user's ID
    })
    .sort({ createdAt: -1 }) // Sort by creation date, newest first
    .select('appointmentId patientName appointmentTime appointmentDate status');
    
    console.log('Found appointment:', appointment);

    if (!appointment) {
      return res.status(404).json({ error: 'No appointments found' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching latest appointment:', error);
    res.status(500).json({ error: 'Failed to fetch latest appointment' });
  }
});

// GET /appointments/available
router.get('/available', async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    // Get appointments only for the specific date
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: startDate,
        $lt: endDate
      },
      // Only count appointments that aren't declined
      status: { $ne: 'declined' }
    });

    // Count bookings for each time slot for this specific date
    const slotCounts = {};
    appointments.forEach(appointment => {
      TIME_SLOTS.forEach(slot => {
        if (appointment.appointmentTime === slot.time) {
          slotCounts[slot.id] = (slotCounts[slot.id] || 0) + 1;
        }
      });
    });

    // Create availability data with booked counts
    const availabilityData = TIME_SLOTS.map(slot => {
      const bookedCount = slotCounts[slot.id] || 0;
      return {
        id: slot.id,
        bookedCount: bookedCount,
        available: bookedCount < slot.maxSlots
      };
    });

    console.log('Availability data for', date, ':', availabilityData); // Debug log
    res.json(availabilityData);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// Update your POST route error handling
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    const selectedSlot = TIME_SLOTS.find(slot => slot.id === parseInt(req.body.timeSlot));
    if (!selectedSlot) {
      return res.status(400).json({ error: 'Invalid time slot selected' });
    }

    // Check if slot is available
    const appointmentDate = new Date(req.body.appointmentDate);
    appointmentDate.setHours(0, 0, 0, 0);
    const endDate = new Date(appointmentDate);
    endDate.setDate(endDate.getDate() + 1);

    const existingAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: appointmentDate,
        $lt: endDate
      },
      appointmentTime: selectedSlot.time
    });

    if (existingAppointments >= selectedSlot.maxSlots) {
      return res.status(400).json({ error: 'This time slot is fully booked' });
    }

    const appointment = new Appointment({
      userId: userId,
      patientName: req.body.studentName,
      appointmentTime: selectedSlot.time,
      appointmentDate: appointmentDate,
      status: 'pending'
    });

    const savedAppointment = await appointment.save();
    console.log('Saved appointment:', savedAppointment);

    // Add activity logging
    try {
        await logActivity(
            userId,
            'patient',
            ACTIONS.APPOINTMENT_CREATE,
            {
                appointmentId: savedAppointment.appointmentId,
                appointmentDate: savedAppointment.appointmentDate,
                appointmentTime: savedAppointment.appointmentTime,
                status: 'Successful',
                patientName: savedAppointment.patientName
            }
        );
    } catch (logError) {
        console.error('Activity logging failed:', logError);
        // Don't throw error, continue with appointment creation
    }

    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

router.get('/', async (req, res) => {
  try {
    // Get user ID from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    const appointments = await Appointment.find({ userId }) // Add userId filter
      .select('appointmentId patientName appointmentTime appointmentDate status')
      .sort({ appointmentDate: 1, appointmentTime: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    const appointment = await Appointment.findOneAndUpdate(
      { appointmentId: id },
      { status },
      { new: true }
    );

    if (appointment) {
      // Add activity logging
      try {
        await logActivity(
          userId,
          decoded.role || 'admin', // Use role from token or default to admin
          ACTIONS.APPOINTMENT_UPDATE,
          {
            appointmentId: id,
            newStatus: status,
            status: 'Successful'
          }
        );
      } catch (logError) {
        console.error('Activity logging failed:', logError);
        // Don't throw error, continue with appointment update
      }
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

router.options('/:id/status', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.sendStatus(200);
});
module.exports = router;