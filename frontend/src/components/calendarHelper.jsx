import { gapi } from 'gapi-script';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly';

let gapiInited = false;

export const initClient = async (accessToken) => {
    if (!accessToken) {
        throw new Error('No access token provided');
    }

    try {
        if (!gapiInited) {
            await new Promise((resolve, reject) => {
                gapi.load('client', { callback: resolve, onerror: reject });
            });

            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            });

            gapiInited = true;
        }

        gapi.client.setToken({ access_token: accessToken });
        return true;
    } catch (error) {
        console.error('Error initializing Google Calendar:', error);
        gapiInited = false;
        throw error;
    }
};

export const getEvents = async (accessToken) => {
    if (!accessToken) {
        throw new Error('No access token provided');
    }

    try {
        await initClient(accessToken);

        const response = await gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime'
        });

        return response.result.items;
    } catch (error) {
        console.error('Error getting events:', error);
        throw error;
    }
};

export const addEventToGoogleCalendar = async (eventDetails, accessToken) => {
    if (!accessToken) {
        throw new Error('No access token available');
    }

    try {
        await initClient(accessToken);

        const event = {
            'summary': eventDetails.summary,
            'description': eventDetails.description,
            'start': {
                'dateTime': eventDetails.start,
                'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            'end': {
                'dateTime': eventDetails.end,
                'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        };

        const response = await gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': event
        });

        return response.result;
    } catch (error) {
        console.error('Error adding event to Google Calendar:', error);
        throw error;
    }
};