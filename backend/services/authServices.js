const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios'); 
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const Dentist = require('../models/Dentist');
const { sendWelcomeEmail } = require('../emailService');

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
        console.log('1. Starting registration with userData:', userData);

        // Generate a temporary password
        const temporaryPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

        // Generate a unique patient_id
        const lastPatient = await Patient.findOne().sort({ patient_id: -1 });
        const newPatientId = lastPatient ? lastPatient.patient_id + 1 : 1;

        // Create new user with temporary password
        const newUser = new Patient({
            patient_id: newPatientId,
            name: userData.name,
            email: userData.email,
            password: hashedPassword, // Add the hashed temporary password
            isGoogleUser: false,
            
        });

        await newUser.save();
        console.log('2. User saved successfully');

        // Send welcome email with temporary password
        await sendWelcomeEmail({
            email: userData.email,
            name: userData.name,
            temporaryPassword: temporaryPassword // Send the unhashed temporary password
        });
        console.log('3. Welcome email sent');

        return {
            success: true,
            message: 'Registration successful. Please check your email for login credentials.'
        };
    } catch (error) {
        console.error('Service error:', error);
        throw error;
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

        // Create new patient
        const newPatient = new Patient({
            patient_id: newPatientId,
            name: name,
            email: email,
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

        // Find user in any collection
        const admin = await Admin.findOne({ email });
        const dentist = await Dentist.findOne({ email });
        const patient = await Patient.findOne({ email });
       

        // Get the user and their role
        let user = admin || dentist || patient;
        let role = admin ? (admin.role || 'admin') : dentist ? 'dentist' : patient ? 'patient' : null;

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
                email: user.email,
                role: role
            }, 
            secretKey, 
            { expiresIn: '24h' }
        );

        // Return appropriate user data based on role
        if (role === 'admin') {
            return {
                token,
                user: {
                    _id: admin._id.toString(),
                    admin_id: admin.admin_id,
                    email: admin.email,
                    fullname: admin.fullname,
                    role: admin.role || 'admin',
                    isProfileComplete: admin.isProfileComplete || false,
                    hasChangedPassword: true,
                    profilePicture: admin.profilePicture || ''
                }
            };
        }

        return { 
            token, 
            user: { 
                id: user._id,
                email: user.email,  // Include email in response
                name: user instanceof Patient ? user.name : user.fullname,
                role,
                profilePicture: user.profilePicture || '',  // Include profile picture
                isProfileComplete: user.isProfileComplete || false,
                hasChangedPassword: user.hasChangedPassword || false
            } 
        };
    } catch (error) {
        console.error("Normal login error:", error.message);
        throw error;
    }
}

async function loginWithGoogle(payload, recaptchaToken) {
    try {
        console.log('Received Google login payload:', payload);
        
        if (!payload || !payload.email) {
            throw new Error('Invalid Google authentication payload');
        }

        const { email, name, sub: googleId, picture } = payload;
        console.log('Attempting Google login for email:', email);
        
        // Check for admin account first
        const admin = await Admin.findOne({ email });
        console.log('Found admin:', admin ? 'Yes' : 'No');
        
        if (admin) {
            // Update Google ID and ensure Google login is enabled
            await Admin.findByIdAndUpdate(admin._id, {
                $set: {
                    googleId: googleId,
                    isGoogleUser: true,
                    isVerified: true,
                    profilePicture: picture || admin.profilePicture
                }
            });

            const token = jwt.sign(
                { 
                    id: admin._id,
                    email: admin.email,
                    role: 'admin',
                    permissions: admin.permissions
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '24h' }
            );

            return {
                token,
                user: {
                    id: admin._id,
                    admin_id: admin.admin_id,
                    email: admin.email,
                    fullname: admin.fullname,
                    role: 'admin',
                    permissions: admin.permissions,
                    profilePicture: picture || admin.profilePicture
                }
            };
        }

        // Check for dentist account
        const dentist = await Dentist.findOne({ email });
        if (dentist && dentist.isGoogleUser) {
            const token = jwt.sign(
                { 
                    id: dentist._id,
                    email: dentist.email,
                    role: 'dentist'
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '24h' }
            );

            return {
                token,
                user: {
                    id: dentist._id,
                    dentist_id: dentist.dentist_id,
                    email: dentist.email,
                    name: dentist.name,
                    role: 'dentist',
                    profilePicture: picture || dentist.profilePicture,
                    isGoogleUser: true
                }
            };
        }

        // Check for patient account
        const patient = await Patient.findOne({ email });
        if (patient) {
            // Update Google ID and ensure Google login is enabled
            await Patient.findByIdAndUpdate(patient._id, {
                $set: {
                    googleId: googleId,
                    isGoogleUser: true,
                    profilePicture: picture || patient.profilePicture
                }
            });

            const token = jwt.sign(
                { 
                    id: patient._id,
                    email: patient.email,
                    role: 'patient'
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '24h' }
            );

            return {
                token,
                user: {
                    id: patient.patient_id,
                    email: patient.email,
                    name: patient.name,
                    role: 'patient',
                    profilePicture: picture || patient.profilePicture,
                    isGoogleUser: true
                }
            };
        }

        throw new Error('No authorized account found for this email.');
    } catch (error) {
        console.error('Google login error:', error);
        throw error;
    }
}

module.exports = { normalLogin, loginWithGoogle, registerUser, registerWithGoogle };
