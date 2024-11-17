const nodemailer = require('nodemailer');
const { oauth2Client } = require('../config/googleAuth');

const createTransporter = async () => {
  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_FROM,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken
    }
  });
};

const generatePassword = () => {
    try {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        
        console.log('Generated password in function:', password); // Debug log
        return password;
    } catch (error) {
        console.error('Error generating password:', error);
        throw error;
    }
};

const sendWelcomeEmail = async (email, password) => {
  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to BukSU Dental Clinic',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">Welcome to BukSU Dental Clinic</h1>
          <p>Your account has been created successfully.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Your Login Credentials</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p style="color: #e74c3c;"><strong>Important:</strong> Please change your password after your first login.</p>
          <p>If you didn't create this account, please contact our support team.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  generatePassword,
  createTransporter
};