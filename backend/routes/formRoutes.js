const express = require('express');
const router = express.Router();
const formServices = require('../services/formServices');
const { authenticateAdmin, authenticatePatient } = require('../middleware/authMiddleware');

// Create feedback
router.post('/feedback', authenticatePatient, async (req, res) => {
    try {
        const feedback = await formServices.createFeedback(req.body);
        res.status(201).json(feedback);
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ error: 'Failed to create feedback' });
    }
});

// Get feedback by patient
router.get('/feedback/patient/:patientId', authenticatePatient, async (req, res) => {
    try {
        const feedback = await formServices.getFeedbackByPatient(req.params.patientId);
        res.json(feedback);
    } catch (error) {
        console.error('Error getting feedback:', error);
        res.status(500).json({ error: 'Failed to get feedback' });
    }
});

// Get all feedback (admin only)
router.get('/feedback', authenticateAdmin, async (req, res) => {
    try {
        const feedback = await formServices.getAllFeedback();
        res.json(feedback);
    } catch (error) {
        console.error('Error getting all feedback:', error);
        res.status(500).json({ error: 'Failed to get all feedback' });
    }
});

// Delete feedback (admin only)
router.delete('/feedback/:id', authenticateAdmin, async (req, res) => {
    try {
        await formServices.deleteFeedback(req.params.id);
        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
});

module.exports = router;
