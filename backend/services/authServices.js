const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const Dentist = require('../models/Dentist');

const secretKey = process.env.JWT_SECRET_KEY;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Normal Login Function
async function normalLogin({ email, password }) {
    try {
        // Find user in any of the roles
        const user = await Patient.findOne({ email }) || await Admin.findOne({ email }) || await Dentist.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        // Determine user role
        const role = user instanceof Patient ? 'patient' : user instanceof Admin ? 'admin' : 'dentist';

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Incorrect password');
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role }, secretKey, { expiresIn: '1h' });
        return { token, user, role };
    } catch (error) {
        throw new Error(error.message);
    }
}

// Google Login Function
async function googleLogin({ googleToken }) {
    try {
        // Verify Google token and retrieve user data
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;

        // Find user in any of the roles
        const user = await Patient.findOne({ email }) || await Admin.findOne({ email }) || await Dentist.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        // Determine user role
        const role = user instanceof Patient ? 'patient' : user instanceof Admin ? 'admin' : 'dentist';

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role }, secretKey, { expiresIn: '1h' });
        return { token, user, role };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = { normalLogin, googleLogin };
