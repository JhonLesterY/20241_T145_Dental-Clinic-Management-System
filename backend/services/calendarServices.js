const { google } = require('googleapis');
const { oauth2Client } = require('../googleAuth');

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });


// Add this function to check and refresh auth
async function ensureAuthenticated() {
    if (!oauth2Client.credentials) {
        throw new Error('Google Calendar not authenticated');
    }
    return true;
}

async function addEvent(eventData) {
    try {
        await ensureAuthenticated();
        
        console.log('Adding event with data:', eventData);

        const event = {
            summary: eventData.summary,
            description: eventData.description,
            start: {
                dateTime: eventData.start,
                timeZone: 'Asia/Manila',
            },
            end: {
                dateTime: eventData.end,
                timeZone: 'Asia/Manila',
            },
        };

        console.log('Formatted event:', event);
        console.log('Auth status:', !!oauth2Client.credentials);

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        return response.data;
    } catch (error) {
        console.error('Detailed error in addEvent:', error);
        throw new Error(`Calendar service error: ${error.message}`);
    }
}
async function getEvents(timeMin, timeMax) {
    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin || new Date().toISOString(),
            timeMax: timeMax,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items;
    } catch (error) {
        console.error('Error getting events:', error);
        throw error;
    }
}

async function deleteEvent(eventId) {
    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });
        return true;
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
}
async function updateEvent(eventId, eventData) {
    try {
        const event = {
            summary: eventData.summary,
            description: eventData.description,
            start: {
                dateTime: eventData.start,
                timeZone: 'Asia/Manila',
            },
            end: {
                dateTime: eventData.end,
                timeZone: 'Asia/Manila',
            },
        };

        const response = await calendar.events.update({
            calendarId: 'primary',
            eventId: eventId,
            resource: event,
        });

        return response.data;
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
}

async function getEventsForDate(date) {
    try {
        await ensureAuthenticated();
        
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate);
        const endOfDay = new Date(targetDate);
        
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay.setHours(23, 59, 59, 999);

        console.log('Fetching calendar events with auth:', {
            hasAuth: !!oauth2Client.credentials,
            timeRange: {
                start: startOfDay.toISOString(),
                end: endOfDay.toISOString()
            }
        });
        
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        });

        return response.data.items || [];
    } catch (error) {
        console.error('Calendar service error:', error);
        throw new Error(`Calendar service error: ${error.message}`);
    }
}

module.exports = {  
    addEvent,
    getEvents,
    deleteEvent,
    updateEvent,
    ensureAuthenticated,
    getEventsForDate 
};