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
    'https://www.googleapis.com/auth/drive.metadata',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.resource',
    'https://www.googleapis.com/auth/forms.body',
    'https://www.googleapis.com/auth/forms.responses.readonly',
    'https://www.googleapis.com/auth/forms.body.readonly',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
    'https://www.googleapis.com/auth/calendar.events.owned',
    'https://www.googleapis.com/auth/calendar.events.owned.readonly',
    'https://www.googleapis.com/auth/calendar.settings.readonly'
];

// Set credentials immediately if refresh token exists
if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        scope: SCOPES.join(' ')  // Add this line
    });
}

// Function to get a fresh access token
const getAccessToken = async () => {
    try {
        const { token } = await oauth2Client.getAccessToken();
        oauth2Client.setCredentials({
            access_token: token,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
            scope: SCOPES.join(' ')
        });
        return token;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw new Error('Failed to refresh access token: ' + error.message);
    }
};

const getDriveService = async () => {
    try {
        const accessToken = await getAccessToken();
        
        const service = google.drive({ 
            version: 'v3',
            auth: oauth2Client
        });

        // Wrap all necessary methods for Drive operations
        const originalMethods = {
            create: service.files.create.bind(service.files),
            get: service.files.get.bind(service.files),
            list: service.files.list.bind(service.files),
            permissionsCreate: service.permissions.create.bind(service.permissions)
        };

        // Override methods with shared drive support
        service.files.create = async (params) => originalMethods.create({
            ...params,
            supportsAllDrives: true,
            supportsTeamDrives: true
        });

        service.files.get = async (params) => originalMethods.get({
            ...params,
            supportsAllDrives: true,
            supportsTeamDrives: true
        });

        service.files.list = async (params) => originalMethods.list({
            ...params,
            supportsAllDrives: true,
            supportsTeamDrives: true,
            includeItemsFromAllDrives: true,
            corpora: 'allDrives'
        });

        service.permissions.create = async (params) => originalMethods.permissionsCreate({
            ...params,
            supportsAllDrives: true,
            supportsTeamDrives: true
        });

        return service;
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

// Get Google Forms service
const getFormsService = async () => {
    try {
        // Ensure we have a fresh access token
        const accessToken = await getAccessToken();
        console.log('Got access token for Forms API');
        
        // Create and return the forms service
        const formsService = google.forms({
            version: 'v1',
            auth: oauth2Client
        });
        
        console.log('Forms service created successfully');
        return formsService;
    } catch (error) {
        console.error('Error creating Forms service:', error);
        throw new Error('Failed to create Forms service: ' + error.message);
    }
};

// Verify Google API setup
const verifySetup = async () => {
    try {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
            throw new Error('Missing required Google API credentials');
        }
        
        // Test Forms API access
        const forms = await getFormsService();
        console.log('Google Forms API setup verified successfully');
        return true;
    } catch (error) {
        console.error('Google API setup verification failed:', error);
        throw error;
    }
};

module.exports = {
    oauth2Client,
    getAccessToken,
    getDriveService,
    getGmailService,
    getFormsService,
    verifySetup,
    SCOPES
};