const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const createTransporter = async () => {
    try {
        console.log('Creating transporter...');
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL_FROM,
                pass: process.env.EMAIL_APP_PASSWORD // Add this to your .env
            }
        });

        console.log('Verifying transporter...');
        await transporter.verify();
        console.log('Transporter verified successfully');
        
        return transporter;
    } catch (error) {
        console.error('Error creating transporter:', error);
        throw error;
    }
};

// Update sendPasswordResetEmail with better error handling
const sendPasswordResetEmail = async ({ email, name, resetLink }) => {
    try {
        console.log('Starting password reset email process...');
        const transporter = await createTransporter();
        console.log('Transporter created successfully');

        const mailOptions = {
            from: {
                name: 'UniCare Dental',
                address: process.env.EMAIL_FROM
            },
            to: email,
            subject: 'Password Reset Request - UniCare Dental',
            html: `
                <h1>Hello ${name},</h1>
                <p>You requested to reset your password.</p>
                <p>Please click the link below to reset your password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>UniCare Dental Team</p>
            `
        };

        console.log('Attempting to send email...');
        const result = await transporter.sendMail(mailOptions);
        console.log('Reset email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Error in sendPasswordResetEmail:', error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
    }
};

const sendWelcomeEmail = async ({ email, name, temporaryPassword }) => {
    try {
        const transporter = await createTransporter();
        
        const mailOptions = {
            from: {
                name: 'UniCare Dental',
                address: process.env.EMAIL_FROM
            },
            to: email,
            subject: 'Welcome to UniCare Dental',
            html: `
                <h1>Welcome to UniCare Dental!</h1>
                <p>Hello ${name},</p>
                <p>Your account has been successfully created.</p>
                <p>Here are your temporary login credentials:</p>
                <p>Email: ${email}</p>
                <p>Temporary Password: ${temporaryPassword}</p>
                <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
                <br>
                <p>Best regards,<br>UniCare Dental Team</p>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
};

const sendAdminVerificationEmail = async ({ email, name, token, role }) => {
    try {
        const transporter = await createTransporter();
        
        const verificationLink = `${process.env.FRONTEND_URL}/verify-admin/${token}`;
        
        const mailOptions = {
            from: {
                name: 'UniCare Dental',
                address: process.env.EMAIL_FROM
            },
            to: email,
            subject: 'Verify Your Admin Account - UniCare Dental Clinic',
            html: `
                <h1>Welcome to UniCare Dental Clinic</h1>
                <p>Hello ${name},</p>
                <p>You have been registered as an administrator. Please verify your account by clicking the link below:</p>
                <a href="${verificationLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                    Verify Account
                </a>
                <p>After verification, you can log in using your Google account.</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you did not request this registration, please ignore this email.</p>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', email);
        return result;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

const sendDentistVerificationEmail = async ({ email, name, token }) => {
    try {
        console.log('Starting dentist verification email process...');
        const transporter = await createTransporter();
        console.log('Transporter created successfully');

        const mailOptions = {
            from: {
                name: 'UniCare Dental',
                address: process.env.EMAIL_FROM
            },
            to: email,
            subject: 'Verify Your Dentist Account - UniCare Dental',
            html: `
                <h1>Hello Dr. ${name},</h1>
                <p>Welcome to UniCare Dental! Your account is almost ready.</p>
                <p>Please click the link below to verify your dentist account:</p>
                <a href="${process.env.FRONTEND_URL}/verify-dentist/${token}">Verify Account</a>
                <p>This verification link will expire in 24 hours.</p>
                <p>If you did not request this, please contact our admin team.</p>
                <p>Best regards,<br>UniCare Dental Team</p>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Dentist verification email sent successfully');
        return result;
    } catch (error) {
        console.error('Error sending dentist verification email:', error);
        throw error;
    }
};
module.exports = {
    createTransporter,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendAdminVerificationEmail,
    sendDentistVerificationEmail
};