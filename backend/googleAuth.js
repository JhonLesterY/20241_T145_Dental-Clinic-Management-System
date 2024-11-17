const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/userinfo.email'
];

const getGmailService = async () => {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
  return google.gmail({ version: 'v1', auth: oauth2Client });
};

module.exports = {
  oauth2Client,
  getGmailService,
  SCOPES
};