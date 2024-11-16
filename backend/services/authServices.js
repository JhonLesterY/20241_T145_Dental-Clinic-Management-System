const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios'); 
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const Dentist = require('../models/Dentist');

const secretKey = process.env.JWT_SECRET_KEY;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyRecaptcha = async (token) => {
    try {
        console.log('Starting reCAPTCHA verification...'); // Debug log

        if (!process.env.RECAPTCHA_SECRET_KEY) {
            console.error('RECAPTCHA_SECRET_KEY is missing');
            return false;
        }

        if (!token) {
            console.error('No reCAPTCHA token provided');
            return false;
        }

        const response = await axios({
            method: 'post',
            url: 'https://www.google.com/recaptcha/api/siteverify',
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: token
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('reCAPTCHA verification response:', response.data); // Debug log

        return response.data.success;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error.message);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        return false;
    }
};

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

async function registerWithGoogle(payload) {
    try {
        const { email, name, sub: googleId, picture } = payload;
        
        // Check if user exists in any role
        const existingAdmin = await Admin.findOne({ email });
        const existingDentist = await Dentist.findOne({ email });
        const existingPatient = await Patient.findOne({ email });

        if (existingAdmin || existingDentist || existingPatient) {
            // If user exists and is a Google user, just return the user
            if (existingPatient && existingPatient.isGoogleUser) {
                const token = jwt.sign(
                    { id: existingPatient._id, role: 'patient' },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: '24h' }
                );

                return {
                    token,
                    user: {
                        id: existingPatient._id,
                        email: existingPatient.email,
                        name: existingPatient.name,
                        role: 'patient',
                        profilePicture: picture,
                        isGoogleUser: true
                    }
                };
            }
            throw new Error('A user with this email already exists.');
        }

        // Create new patient account
        const latestPatient = await Patient.findOne().sort({ patient_id: -1 });
        const newPatientId = latestPatient ? parseInt(latestPatient.patient_id) + 1 : 1;

        const newPatient = new Patient({
            patient_id: newPatientId,
            name: name,
            email: email,
            googleId: googleId,
            profilePicture: picture,
            isGoogleUser: true,
            phoneNumber: '', // This can be updated later
            role: 'patient'
        });
        await newPatient.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newPatient._id, role: 'patient' },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: newPatient._id,
                email: newPatient.email,
                name: newPatient.name,
                role: 'patient',
                profilePicture: picture,
                isGoogleUser: true
            }
        };
    } catch (error) {
        console.error('Google registration error:', error);
        throw new Error(error.message);
    }
}

// Normal Login Function
async function normalLogin({ email, password, recaptchaToken }) {
    try {
        console.log('Starting normal login process...'); // Debug log
        
        // Verify reCAPTCHA first
        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        console.log('reCAPTCHA validation result:', isRecaptchaValid); // Debug log
        
        if (!isRecaptchaValid) {
            throw new Error('reCAPTCHA verification failed');
        }


        // Find user in any collection without domain restrictions
        const admin = await Admin.findOne({ email });
        const dentist = await Dentist.findOne({ email });
        const patient = await Patient.findOne({ email });

        // Get the user and their role
        let user = admin || dentist || patient;
        let role = admin ? 'admin' : dentist ? 'dentist' : patient ? 'patient' : null;

        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Incorrect password');
        }

        const token = jwt.sign(
            { 
                id: user._id, 
                role 
            }, 
            secretKey, 
            { expiresIn: '24h' }
        );

        return { 
            token, 
            user: { 
                id: user._id, 
                email: user.email,
                name: user instanceof Patient ? user.name : user.fullname,
                role 
            } 
        };
    } catch (error) {
        console.error("Normal login error:", error.message);
        throw error;
    }
}
async function loginWithGoogle(payload, recaptchaToken) {
    try {
        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            throw new Error('reCAPTCHA verification failed');
        }
        
        const { email, sub: googleId, picture } = payload; // Make sure picture is destructured
        
        let patient = await Patient.findOne({ email });

        if (!patient) {
            throw new Error('User not registered. Please sign up first.');
        }

        // Update profile picture if it has changed
        if (patient.isGoogleUser && picture && patient.profilePicture !== picture) {
            patient = await Patient.findOneAndUpdate(
                { email },
                { 
                    $set: { 
                        profilePicture: picture,
                        lastUpdated: new Date()
                    }
                },
                { new: true }
            );
        }

        const token = jwt.sign(
            { id: patient._id, role: 'patient' },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: patient._id,
                email: patient.email,
                name: patient.name,
                role: 'patient',
                profilePicture: patient.profilePicture,
                isGoogleUser: true
            }
        };
    } catch (error) {
        console.error('Google login error:', error);
        throw new Error(error.message);
    }
}

module.exports = { normalLogin, loginWithGoogle, registerUser, registerWithGoogle };
