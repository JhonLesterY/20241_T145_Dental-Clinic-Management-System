const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios'); 
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const Dentist = require('../models/Dentist');
const { sendWelcomeEmail, generatePassword } = require('./emailService');

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
        // Validate input
        if (!userData.name || !userData.email) {
            throw new Error('Name and email are required');
        }

        // Generate a secure password
        const plainPassword = 'Pass' + Math.random().toString(36).slice(-8) + '!';
        console.log('Generated password:', plainPassword); // For debugging

        // Hash the password properly
        const saltRounds = 10;
        let hashedPassword;
        
        try {
            // Generate salt and hash password
            const salt = await bcrypt.genSalt(saltRounds);
            hashedPassword = await bcrypt.hash(plainPassword, salt);
            
            if (!hashedPassword) {
                throw new Error('Password hashing failed');
            }
        } catch (hashError) {
            console.error('Password hashing error:', hashError);
            throw new Error('Failed to secure password');
        }

        // Create new patient
        const newUser = new Patient({
            patient_id: newPatientId,
            name: userData.name,
            email: userData.email,
            password: hashedPassword, // Store the hashed password
            phoneNumber: userData.phoneNumber || '',
            role: 'patient'
        });

        // Save user and send email
        await newUser.save();
        await sendWelcomeEmail(userData.email, plainPassword); // Send the plain password

        return {
            success: true,
            message: 'Registration successful! Please check your email for login credentials.',
            user: {
                id: newUser.patient_id,
                name: newUser.name,
                email: newUser.email
            }
        };

    } catch (error) {
        console.error('Registration error:', error);
        throw new Error(error.message || 'Registration failed');
    }
}

async function registerWithGoogle(payload) {
    try {
        console.log('Starting Google registration with payload:', payload);

        const { email, name, sub: googleId, picture } = payload;
        
        // Check if user exists
        const existingAdmin = await Admin.findOne({ email });
        const existingDentist = await Dentist.findOne({ email });
        const existingPatient = await Patient.findOne({ email });

        if (existingAdmin || existingDentist || existingPatient) {
            // If user exists and is a Google user, return the user
            if (existingPatient && existingPatient.isGoogleUser) {
                const token = jwt.sign(
                    { id: existingPatient._id, role: 'patient' },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: '24h' }
                );

                return {
                    token,
                    user: {
                        id: existingPatient.patient_id,
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

        // Get new patient ID
        const latestPatient = await Patient.findOne().sort({ patient_id: -1 });
        const newPatientId = latestPatient ? latestPatient.patient_id + 1 : 1;

        // Create random password for Google users
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Create new patient
        const newPatient = new Patient({
            patient_id: newPatientId,
            name: name,
            email: email,
            password: hashedPassword,
            googleId: googleId,
            profilePicture: picture,
            isGoogleUser: true,
            phoneNumber: '',
            role: 'patient'
        });

        await newPatient.save();
        console.log('New Google patient saved:', newPatient);

        const token = jwt.sign(
            { id: newPatient._id, role: 'patient' },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: newPatient.patient_id,
                email: newPatient.email,
                name: newPatient.name,
                role: 'patient',
                profilePicture: picture,
                isGoogleUser: true
            }
        };
    } catch (error) {
        console.error('Google registration error:', error);
        throw new Error(error.message || 'Failed to register with Google');
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
