const mongoose = require('mongoose');
const { google } = require('googleapis');
const { oauth2Client } = require('../googleAuth');
const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.events.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
];

// Initialize with service account
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

async function ensureAuthenticated() {
    try {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
            throw new Error('Missing required Google credentials');
        }

        if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
            oauth2Client.setCredentials({
                refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
                scope: SCOPES.join(' ')
            });
            
            // Force token refresh
            const { credentials } = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(credentials);
        }
        
        return true;
    } catch (error) {
        console.error('Authentication error:', error);
        throw new Error('Failed to authenticate with Google Calendar: ' + error.message);
    }
}

// Create calendar service after ensuring authentication
const getCalendarService = async () => {
    await ensureAuthenticated();
    return google.calendar({ 
        version: 'v3', 
        auth: oauth2Client,
        timeout: 15000
    });
};

// Modify getEvents to use the authenticated calendar service
async function getEvents(timeMin, timeMax) {
    try {
        await ensureAuthenticated();
        const calendar = await getCalendarService();
        
        console.log('Fetching events with credentials:', {
            hasAuth: !!oauth2Client.credentials,
            hasAccessToken: !!oauth2Client.credentials?.access_token,
            calendarId: CALENDAR_ID
        });

        const response = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: timeMin || new Date().toISOString(),
            timeMax: timeMax,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 100
        });

        return response.data.items || [];
    } catch (error) {
        console.error('Error getting events:', error);
        if (error.message.includes('insufficient')) {
            throw new Error('Calendar access not authorized. Please check permissions.');
        }
        throw error;
    }
}

const CalendarEvent = require('../models/CalendarEvent');

async function addEvent(eventData) {
    try {
        await ensureAuthenticated();
        const calendar = await getCalendarService();
        
        console.log('Adding event with data:', eventData);

        const event = {
            summary: eventData.summary,
            description: eventData.description,
            start: {
                dateTime: new Date(eventData.start).toISOString(),
                timeZone: 'Asia/Manila',
            },
            end: {
                dateTime: new Date(eventData.end).toISOString(),
                timeZone: 'Asia/Manila',
            },
        };

        console.log('Formatted event:', event);
        console.log('Auth status:', !!oauth2Client.credentials);

        // Add to Google Calendar
        const googleResponse = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: event,
        });

        // Save to MongoDB
        try {
            if (mongoose.connection.readyState !== 1) {
                throw new Error('MongoDB not connected');
            }
            const dbEvent = new CalendarEvent({
                googleEventId: googleResponse.data.id,
                summary: event.summary,
                description: event.description,
                start: {
                    dateTime: new Date(event.start.dateTime),
                    timeZone: event.start.timeZone
                },
                end: {
                    dateTime: new Date(event.end.dateTime),
                    timeZone: event.end.timeZone
                }
            });

            console.log('Attempting to save to MongoDB:', dbEvent);
            const savedEvent = await dbEvent.save();
            console.log('Successfully saved to MongoDB:', savedEvent);
            return {
                ...googleResponse.data,
                _id: savedEvent._id
            };
        } catch (mongoError) {
            console.error('MongoDB save error:', mongoError);
            // Delete the Google Calendar event since MongoDB save failed
            try {
                await calendar.events.delete({
                    calendarId: CALENDAR_ID,
                    eventId: googleResponse.data.id
                });
            } catch (deleteError) {
                console.error('Error deleting Google Calendar event after MongoDB save failed:', deleteError);
            }
            throw new Error(`Failed to save event to database: ${mongoError.message}`);
        }
    } catch (error) {
        console.error('Detailed error in addEvent:', error);
        throw new Error(`Calendar service error: ${error.message}`);
    }
}

async function deleteEvent(eventId) {
    try {
        await ensureAuthenticated();
        const calendar = await getCalendarService();
        
        // Delete from Google Calendar
        await calendar.events.delete({
            calendarId: CALENDAR_ID,
            eventId: eventId,
        });

        // Delete from MongoDB
        await CalendarEvent.findOneAndDelete({ googleEventId: eventId });
        
        return true;
    } catch (error) {
        console.error('Error deleting event:', error);
        throw new Error(`Error deleting event: ${error.message}`);
    }
}
async function updateEvent(eventId, eventData) {
    try {
        await ensureAuthenticated();
        const calendar = await getCalendarService();
        
        const event = {
            summary: eventData.summary,
            description: eventData.description,
            start: {
                dateTime: new Date(eventData.start).toISOString(),
                timeZone: 'Asia/Manila',
            },
            end: {
                dateTime: new Date(eventData.end).toISOString(),
                timeZone: 'Asia/Manila',
            },
        };

        // Update in Google Calendar
        const response = await calendar.events.update({
            calendarId: CALENDAR_ID,
            eventId: eventId,
            resource: event,
        });

        // Update in MongoDB
        await CalendarEvent.findOneAndUpdate(
            { googleEventId: eventId },
            {
                summary: eventData.summary,
                description: eventData.description,
                start: {
                    dateTime: new Date(eventData.start),
                    timeZone: 'Asia/Manila'
                },
                end: {
                    dateTime: new Date(eventData.end),
                    timeZone: 'Asia/Manila'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error updating event:', error);
        throw new Error(`Error updating event: ${error.message}`);
    }
}

async function getEventsForDate(date) {
    try {
        await ensureAuthenticated();
        const calendar = await getCalendarService();
        
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
            calendarId: CALENDAR_ID,
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

const BlockedDate = require('../models/BlockedDate');

async function getBlockedDates() {
    try {
        const blockedDates = await BlockedDate.find().sort({ date: 1 });
        return blockedDates.map(bd => bd.date.toISOString().split('T')[0]);
    } catch (error) {
        throw new Error(`Failed to fetch blocked dates: ${error.message}`);
    }
}

async function blockDate(date) {
    try {
        // First check if the date is already blocked
        const existingBlock = await BlockedDate.findOne({ 
            date: new Date(date) 
        });
        
        if (existingBlock) {
            throw new Error('Date is already blocked');
        }
        
        const blockedDate = new BlockedDate({ date: new Date(date) });
        await blockedDate.save();
        return await getBlockedDates();
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Date is already blocked');
        }
        throw new Error(`Failed to block date: ${error.message}`);
    }
}

async function unblockDate(date) {
    try {
        await BlockedDate.findOneAndDelete({ 
            date: new Date(date) 
        });
        return await getBlockedDates();
    } catch (error) {
        throw new Error(`Failed to unblock date: ${error.message}`);
    }
}

module.exports = {  
    addEvent,
    getEvents,
    deleteEvent,
    updateEvent,
    ensureAuthenticated,
    getEventsForDate,
    getBlockedDates,
    blockDate,
    unblockDate
};