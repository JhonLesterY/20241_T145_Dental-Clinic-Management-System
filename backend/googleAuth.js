const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

// Define scopes needed for Gmail API and Google Drive
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata'
];

// Set credentials immediately
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// Function to get a fresh access token
const getAccessToken = async () => {
    try {
        const { token } = await oauth2Client.getAccessToken();
        oauth2Client.setCredentials({
            access_token: token,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });
        return token;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
};

const getDriveService = async () => {
    try {
        // Get a fresh access token
        const accessToken = await getAccessToken();
        
        return google.drive({ 
            version: 'v3',
            auth: oauth2Client
        });
    } catch (error) {
        console.error('Error getting drive service:', error);
        throw error;
    }
};

const getGmailService = async () => {
    try {
        // Get a fresh access token
        const accessToken = await getAccessToken();
        
        return google.gmail({ 
            version: 'v1',
            auth: oauth2Client
        });
    } catch (error) {
        console.error('Error getting gmail service:', error);
        throw error;
    }
};

const verifySetup = async () => {
    try {
        // Verify required environment variables
        const requiredVars = [
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'GOOGLE_REFRESH_TOKEN',
            'GOOGLE_DRIVE_FOLDER_ID'
        ];
        
        for (const varName of requiredVars) {
            if (!process.env[varName]) {
                throw new Error(`Missing required environment variable: ${varName}`);
            }
        }

        // Test token refresh
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('Failed to get access token');
        }

        console.log('OAuth2 setup verified successfully');
        return true;
    } catch (error) {
        console.error('OAuth2 setup verification failed:', error);
        throw error;
    }
};

module.exports = {
    oauth2Client,
    getAccessToken,
    getDriveService,
    getGmailService,
    verifySetup,
    SCOPES
};