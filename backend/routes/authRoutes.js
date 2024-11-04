// authRoutes.js
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { unifiedLogin } = require('../services/authServices');

const client = new OAuth2Client("259185371680-l8cf7d7soeusn0uio59bln8qiu5i1uu2.apps.googleusercontent.com");


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

router.post('/google-login', async (req, res) => {
    console.log("Google login request received", req.body);
    const { token } = req.body;
    if (!token) {
        console.error("Token missing in request body");
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        // Verify Google ID token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "259185371680-l8cf7d7soeusn0uio59bln8qiu5i1uu2.apps.googleusercontent.com",
        });
        const payload = ticket.getPayload();
        console.log("Google payload:", payload);

        const { sub, email, name, picture } = payload;

        const { token: userToken, user, role } = await unifiedLogin({
            googleId: sub,
            email,
            name,
            picture,
        });

        res.status(200).json({ token: userToken, user, role });
    } catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ message: "Invalid Google token" });
    }
});


module.exports = router;
