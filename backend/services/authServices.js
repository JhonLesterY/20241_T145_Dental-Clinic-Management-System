const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const Dentist = require('../models/Dentist');

const secretKey = process.env.JWT_SECRET_KEY;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function registerUser(userData) {
    try {
        // Check if email already exists in any collection (admin, dentist, or patient)
        const existingAdmin = await Admin.findOne({ email: userData.email });
        const existingDentist = await Dentist.findOne({ email: userData.email });
        const existingPatient = await Patient.findOne({ email: userData.email });

        if (existingAdmin || existingDentist || existingPatient) {
            throw new Error('A user with this email already exists.');
        }

        let newUser;

        // Determine the type of user and assign the correct auto-incrementing ID
        if (userData.role === 'admin') {
            // Generate an incrementing admin_id
            const latestAdmin = await Admin.findOne().sort({ admin_id: -1 });
            const newAdminId = latestAdmin ? latestAdmin.admin_id + 1 : 1;

            // Hash the password before saving it
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            newUser = new Admin({
                admin_id: newAdminId,
                fullname: userData.fullname,
                email: userData.email,
                password: hashedPassword,
                role: 'admin',
            });

        } else if (userData.role === 'dentist') {
            // Handle dentist registration, similar to admin registration logic
            const latestDentist = await Dentist.findOne().sort({ dentist_id: -1 });
            const newDentistId = latestDentist ? latestDentist.dentist_id + 1 : 1;

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            newUser = new Dentist({
                dentist_id: newDentistId,
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                phoneNumber: userData.phoneNumber,
            });

        } else {
            // Handle patient registration
            const latestPatient = await Patient.findOne().sort({ patient_id: -1 });
            const newPatientId = latestPatient ? latestPatient.patient_id + 1 : 1;

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            newUser = new Patient({
                patient_id: newPatientId,
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                phoneNumber: userData.phoneNumber,
            });
        }

        // Save the new user to the database
        await newUser.save();
        return newUser;  // Return the newly created user
    } catch (error) {
        throw new Error(error.message);
    }
}

async function registerWithGoogle(idToken) {
    try {
        // Verify Google ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: googleClientId,
        });
        const payload = ticket.getPayload();

        if (!payload) {
            throw new Error("Invalid Google ID token");
        }

        // Extract user info from Google token
        const { email, name } = payload;

        // Check if patient already exists
        let patient = await Patient.findOne({ email });

        if (!patient) {
            // If no patient exists, create new with incrementing patient_id
            const latestPatient = await Patient.findOne().sort({ patient_id: -1 });
            const newPatientId = latestPatient ? latestPatient.patient_id + 1 : 1;

            patient = new Patient({
                patient_id: newPatientId,
                name,
                email,
                password: null, // No password needed for Google-authenticated users
            });

            await patient.save();
        }

        // Generate JWT token
        const token = jwt.sign({ patientId: patient._id }, secretKey, { expiresIn: '24h' });
        return { patient, token };
    } catch (error) {
        throw new Error(error.message);
    }
}


// Normal Login Function
async function normalLogin({ email, password }) {
    try {
        console.log("Normal login attempt for:", email);

        // Find user in any of the roles
        const user = await Patient.findOne({ email }) || await Admin.findOne({ email }) || await Dentist.findOne({ email });
        if (!user) {
            console.error("User not found:", email);
            throw new Error('User not found');
        }

        // Determine user role
        const role = user instanceof Patient ? 'patient' : user instanceof Admin ? 'admin' : 'dentist';
        console.log("User role identified as:", role);

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error("Incorrect password for:", email);
            throw new Error('Incorrect password');
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role }, secretKey, { expiresIn: '24h' });
        return { token, user: { id: user._id, email: user.email }, role };
    } catch (error) {
        console.error("Normal login error:", error.message);
        throw new Error(error.message);
    }
}

async function googleLogin({ googleToken }) {
    try {
        console.log("Google login attempt with token:", googleToken);

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
            console.error("User not found:", email);
            throw new Error('User not found');
        }

        // Determine user role
        const role = user instanceof Patient ? 'patient' : user instanceof Admin ? 'admin' : 'dentist';
        console.log("User role identified as:", role);

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role }, secretKey, { expiresIn: '24h' });
        return { token, user: { id: user._id, email: user.email }, role };
    } catch (error) {
        console.error("Google login error:", error.message);
        throw new Error(error.message);
    }
}


module.exports = { normalLogin, googleLogin, registerUser, registerWithGoogle };
