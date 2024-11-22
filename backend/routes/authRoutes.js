// authRoutes.js
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { normalLogin, loginWithGoogle, registerUser, registerWithGoogle } = require('../services/authServices');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const { sendPasswordResetEmail } = require('../emailService');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const base64url = require('base64url');

const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.JWT_SECRET_KEY,
    redirectUri: 'http://localhost:5173' 
  });

  router.post('/register', async (req, res) => {
    try {
        // Debug log to see what we're receiving
        console.log('Received request body:', req.body);
        
        // Validate request body
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                error: 'Invalid request body'
            });
        }

        const { name, email } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({
                error: 'Name and email are required'
            });
        }

        // Validate email format
        if (!email.endsWith('@student.buksu.edu.ph') && !email.endsWith('@buksu.edu.ph')) {
            return res.status(400).json({
                error: 'Invalid email format. Please use your BukSU email'
            });
        }

        // If validation passes, proceed with registration
        const result = await registerUser({ name, email });
        res.status(200).json(result);

    } catch (error) {
        console.error('Registration route error:', error);
        res.status(400).json({
            error: error.message || 'Registration failed'
        });
    }
});
router.post('/google-signup', async (req, res) => {
  try {
      console.log('Received Google signup request:', req.body);
      const { access_token } = req.body;
      
      // Get user info from Google
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` }
      });
      
      const payload = await response.json();
      console.log('Google payload:', payload);

      // Verify email domain
      if (!payload.email.endsWith('@student.buksu.edu.ph') && !payload.email.endsWith('@buksu.edu.ph')) {
          return res.status(400).json({ 
              error: 'Please use your BukSU institutional email (@student.buksu.edu.ph or @buksu.edu.ph)' 
          });
      }

      // Register with Google
      const result = await registerWithGoogle(payload);
      
      res.status(200).json(result);
  } catch (error) {
      console.error('Google signup route error:', error);
      res.status(400).json({ 
          error: error.message || 'Failed to process signup' 
      });
  }
});

// Login endpoint for normal email/password login
router.post('/login', async (req, res) => {
  try {
      const { email, password, recaptchaToken } = req.body;
      
      console.log('Login request received for:', email); // Debug log
      console.log('reCAPTCHA token present:', !!recaptchaToken); // Debug log

      if (!recaptchaToken) {
          return res.status(400).json({ 
              message: 'reCAPTCHA token is required' 
          });
      }

      const result = await normalLogin({ 
          email, 
          password, 
          recaptchaToken 
      });

      res.json(result);
  } catch (error) {
      console.error('Login route error:', error);
      
      // Send appropriate error response
      if (error.message.includes('reCAPTCHA')) {
          res.status(400).json({ 
              message: 'reCAPTCHA verification failed' 
          });
      } else {
          res.status(500).json({ 
              message: 'An error occurred during login',
              details: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
      }
  }
});


// Login endpoint for Google OAuth login
router.post('/google-login', async (req, res) => {
  try {
    const { access_token, recaptchaToken } = req.body;
    
    if (!recaptchaToken) {
      return res.status(400).json({ 
        error: 'reCAPTCHA token is required' 
      });
    }

    // Get user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    const payload = await response.json();
    console.log('Payload:', payload);

    // Pass both payload and recaptchaToken to loginWithGoogle
    const result = await loginWithGoogle(payload, recaptchaToken);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to process login' 
    });
  }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('1. Received forgot password request for:', email);

        // Validate email
        if (!email) {
            console.log('Error: Email is required');
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user
        console.log('2. Looking for user with email:', email);
        const user = await Patient.findOne({ email });
        
        if (!user) {
            console.log('Error: No user found with email:', email);
            return res.status(404).json({ 
                error: 'No account found with this email address' 
            });
        }
        console.log('3. User found:', user._id);

        // Generate token
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );
        console.log('4. Reset token generated');

        // Save token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        console.log('5. Token saved to user document');

        // Create reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log('6. Reset link created:', resetLink);

        try {
            console.log('7. Attempting to send reset email');
            await sendPasswordResetEmail({
                email: user.email,
                name: user.name,
                resetLink
            });
            
            return res.json({
                message: 'Password reset instructions have been sent to your email'
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            
            // Revert changes if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            
            throw new Error(`Failed to send reset email: ${emailError.message}`);
        }
    } catch (error) {
        console.error('Forgot password detailed error:', error);
        res.status(500).json({
            error: 'Failed to process password reset request',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Test OAuth route
router.post('/test-oauth', async (req, res) => {
    try {
        console.log('Testing OAuth setup...');
        
        // Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );

        // Log configuration (sanitized for security)
        console.log('OAuth2 Configuration:', {
            clientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
            clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length,
            refreshTokenLength: process.env.GOOGLE_REFRESH_TOKEN?.length,
            emailFrom: process.env.EMAIL_FROM
        });

        // Set credentials
        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        // Try to get access token
        console.log('Attempting to get access token...');
        const tokenResponse = await oauth2Client.getAccessToken();
        console.log('Token Response received');

        res.json({
            success: true,
            message: 'OAuth test successful',
            tokenInfo: {
                hasToken: !!tokenResponse.token,
                tokenLength: tokenResponse.token?.length
            }
        });
    } catch (error) {
        console.error('OAuth test failed:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        
        res.status(500).json({
            success: false,
            error: 'OAuth test failed',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Test email route
router.post('/test-email', async (req, res) => {
    try {
        console.log('1. Starting email test...');
        
        // Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );

        // Set credentials
        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        // Create Gmail API client
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Prepare email
        const emailContent = [
            'From: "UniCare Dental" <' + process.env.EMAIL_FROM + '>',
            'To: ' + process.env.EMAIL_FROM,
            'Subject: Test Email',
            '',
            'This is a test email sent using Gmail API.'
        ].join('\n');
        const encodedEmail = base64url.encode(emailContent)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    // Send email using Gmail API
    const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedEmail
        }
    });

    console.log('Email sent successfully:', result.data);

    res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.data.id
    });
} catch (error) {
    console.error('Test email failed:', {
        message: error.message,
        stack: error.stack
    });
    res.status(500).json({
        success: false,
        error: 'Test email failed',
        details: error.message
    });
}
});

// Add this route after your forgot-password route
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('1. Processing forgot password request for:', email);

        // Find user
        const user = await Patient.findOne({ email });
        if (!user) {
            console.log('2. No user found with email:', email);
            return res.status(404).json({ 
                error: 'No account found with this email address' 
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );
        console.log('3. Reset token generated');

        // Save token and expiry to user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
        await user.save();
        console.log('4. Reset token saved to user document');

        // Create reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log('5. Reset link created:', resetLink);

        // Send email
        await sendPasswordResetEmail({
            email: user.email,
            name: user.name,
            resetLink
        });
        console.log('6. Reset email sent successfully');

        res.json({ 
            success: true,
            message: 'Password reset link has been sent to your email' 
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            error: 'Failed to send reset email',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
// Add this route if it's not already there
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        console.log('1. Processing password reset request');

        if (!token || !newPassword) {
            return res.status(400).json({ 
                error: 'Token and new password are required' 
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            console.log('2. Token verified successfully');
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(400).json({ 
                error: 'Invalid or expired reset token' 
            });
        }

        // Find user with valid token
        const user = await Patient.findOne({
            _id: decoded.id,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('3. No user found with valid reset token');
            return res.status(400).json({ 
                error: 'Invalid or expired reset token' 
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        console.log('4. New password hashed');

        // Update user's password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        console.log('5. Password updated successfully');

        res.json({ 
            success: true,
            message: 'Password has been reset successfully' 
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            error: 'Failed to reset password',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
