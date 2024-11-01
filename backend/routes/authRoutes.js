// authRoutes.js
const express = require('express');
const router = express.Router();
const { unifiedLogin } = require('../services/authServices');

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token, user, role } = await unifiedLogin({ email, password });
        res.status(200).json({ token, user, role });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
