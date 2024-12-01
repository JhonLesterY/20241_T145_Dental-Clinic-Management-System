const express = require('express');
const router = express.Router();
const formServices = require('../services/formServices');
const { authenticateAdmin, authenticatePatient } = require('../middleware/authMiddleware');

// Create a new Google Form (admin only)
router.post('/create', authenticateAdmin, async (req, res) => {
    try {
        const form = await formServices.createFeedbackForm();
        if (!form) {
            return res.status(400).json({ error: 'Failed to create form' });
        }
        res.status(201).json(form);
    } catch (error) {
        console.error('Error creating form:', error);
        res.status(500).json({ error: 'Failed to create form', details: error.message });
    }
});

// Get active form URL (accessible to both admin and patients)
router.get('/active-form-url', authenticateAdmin, async (req, res) => {
    try {
        const form = await formServices.getForm();
        if (!form) {
            return res.status(404).json({ error: 'No active feedback form found' });
        }
        // Check both possible URL fields from Google Forms API
        const formUrl = form.responderUri || form.formUrl;
        if (!formUrl) {
            return res.status(404).json({ error: 'Form URL not found' });
        }
        res.json({ formUrl });
    } catch (error) {
        console.error('Error getting form URL:', error);
        res.status(500).json({ error: 'Failed to get form URL', details: error.message });
    }
});

// Get form responses (admin only)
router.get('/responses', authenticateAdmin, async (req, res) => {
    try {
        const responses = await formServices.getFormResponses();
        res.json(responses);
    } catch (error) {
        console.error('Error getting form responses:', error);
        res.status(500).json({ error: 'Failed to get form responses', details: error.message });
    }
});

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
