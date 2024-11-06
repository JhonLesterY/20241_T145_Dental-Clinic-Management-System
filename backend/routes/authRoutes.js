// authRoutes.js
const express = require('express');
const router = express.Router();
const { normalLogin, googleLogin } = require('../services/authServices');

// Login endpoint for normal email/password login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token, user, role } = await normalLogin({ email, password });
        res.status(200).json({ token, user, role });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        } else if (error.message === 'Incorrect password') {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        console.error('Login Error:', error);
        res.status(500).json({ message: 'An internal error occurred' });
    }
});

// Login endpoint for Google OAuth login
router.post('/google-login', async (req, res) => {
    const { googleToken } = req.body;

    if (!googleToken) {
        console.error("Token missing in request body");
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const { token: userToken, user, role } = await googleLogin({ googleToken });
        res.status(200).json({ token: userToken, user, role });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        }
        console.error("Google login error:", error);
        res.status(401).json({ message: 'Invalid Google token' });
    }
});

module.exports = router;
