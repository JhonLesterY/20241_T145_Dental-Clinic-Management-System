const express = require('express');
const router = express.Router();
const formServices = require('../services/formServices');
const { authenticateAdmin, authenticatePatient } = require('../middleware/authMiddleware');

// Get active form URL for patients
router.get('/active-form-url', authenticatePatient, async (req, res) => {
    try {
        const patientId = req.user.id;
        
        if (!patientId) {
            return res.status(400).json({ error: 'Patient ID not found' });
        }

        const form = await formServices.getForm(patientId);
        res.json({ formUrl: form.formUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get form URL' });
    }
});

// Get form responses (admin only)
router.get('/responses', authenticateAdmin, async (req, res) => {
    try {
        const responses = await formServices.getFormResponses();
        res.json(responses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get form responses' });
    }
});

router.post('/form-webhook', async (req, res) => {
    try {
        const formResponse = req.body;
        await storeFormResponse(formResponse);
        res.status(200).json({ message: 'Response stored successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Initialize feedback form
router.post('/initialize-form', authenticateAdmin, async (req, res) => {
    try {
        const form = await createFeedbackForm();
        res.status(201).json({
            message: 'Feedback form initialized successfully',
            form
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initialize feedback form' });
    }
});

module.exports = router;
