// authRoutes.js
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { normalLogin, loginWithGoogle, registerUser, registerWithGoogle } = require('../services/authServices');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.JWT_SECRET_KEY,
    redirectUri: 'http://localhost:5173' // or your frontend URL
  });

router.post('/register', async (req, res) => {
    try {
        const result = await registerUser(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(400).json({ error: error.message });
    }
});

router.post('/google-signup', async (req, res) => {
  try {
      const { access_token } = req.body;
      
      // Get user info from Google
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` }
      });
      
      const payload = await response.json();
      console.log('Payload:', payload);

      // Verify email domain
      const emailDomain = payload.email.split('@')[1];
      if (!emailDomain.endsWith('buksu.edu.ph')) {
          return res.status(400).json({ 
              error: 'Please use your BukSU institutional email' 
          });
      }

      // Use the authService to handle registration
      const result = await registerWithGoogle(payload);
      
      res.status(200).json({ 
          message: 'Signup successful',
          ...result
      });

  } catch (error) {
      console.error('Google signup error:', error);
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

module.exports = router;
