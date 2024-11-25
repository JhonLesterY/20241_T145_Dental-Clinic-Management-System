const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'  // OAuth2 playground URL
);

// Define scopes needed for Gmail API
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive',        // Full Drive access
    'https://www.googleapis.com/auth/drive.file',   // Per-file access
    'https://www.googleapis.com/auth/drive.appdata' // Application data folder
];

// Set credentials immediately
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const getDriveService = async () => {
    try {
        return google.drive({ 
            version: 'v3', 
            auth: oauth2Client 
        });
    } catch (error) {
        console.error('Error creating Drive service:', error);
        throw new Error('Failed to create Drive service: ' + error.message);
    }
};
// Function to get a fresh access token
const getAccessToken = async () => {
  try {
      const { token } = await oauth2Client.getAccessToken();
      if (!token) {
          throw new Error('No access token returned');
      }
      console.log('Successfully obtained access token');
      return token;
  } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to obtain access token: ' + error.message);
  }
};

// Function to get Gmail service
const getGmailService = async () => {
    try {
        return google.gmail({ 
            version: 'v1', 
            auth: oauth2Client 
        });
    } catch (error) {
        console.error('Error creating Gmail service:', error);
        throw new Error('Failed to create Gmail service: ' + error.message);
    }
};

// Function to verify OAuth2 setup
const verifySetup = async () => {
  try {
      // Verify all required environment variables are present
      const requiredVars = [
          'GOOGLE_CLIENT_ID',
          'GOOGLE_CLIENT_SECRET',
          'GOOGLE_REFRESH_TOKEN',
          'EMAIL_FROM'
      ];
      
      for (const varName of requiredVars) {
          if (!process.env[varName]) {
              throw new Error(`Missing required environment variable: ${varName}`);
          }
      }

      // Test getting an access token
      const token = await getAccessToken();
      console.log('OAuth2 setup verified successfully');
      return true;
  } catch (error) {
      console.error('OAuth2 setup verification failed:', error);
      return false;
  }
};

module.exports = {
    oauth2Client,
    getAccessToken,
    getGmailService,
    SCOPES,
    verifySetup,
    getDriveService
};