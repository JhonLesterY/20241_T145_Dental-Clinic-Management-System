const { OAuth2Client } = require('google-auth-library');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const Dentist = require('../models/Dentist');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY; // Use an environment variable for security
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function unifiedLogin({ email, password, googleToken }) {
    try {
        let user;
        let role;

        // Check if logging in with Google
        if (googleToken) {
            // Verify Google token and retrieve user data
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email; // Update email with the verified Google email
            const name = payload.name;
            const picture = payload.picture;

            // Find user in any of the roles
            user = await Patient.findOne({ email }) || await Admin.findOne({ email }) || await Dentist.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }

            // Set the role based on the type of user
            role = user instanceof Patient ? 'patient' : user instanceof Admin ? 'admin' : 'dentist';
        } else {
            // If logging in with email and password, find the user
            user = await Patient.findOne({ email }) || await Admin.findOne({ email }) || await Dentist.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }

            // Set the role based on the type of user
            role = user instanceof Patient ? 'patient' : user instanceof Admin ? 'admin' : 'dentist';

            // Verify the password for regular login
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Incorrect password');
            }
        }

        // Generate JWT token with user ID and role
        const token = jwt.sign({ id: user._id, role }, secretKey, { expiresIn: '1h' });

        return { token, user, role };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    unifiedLogin,
};
