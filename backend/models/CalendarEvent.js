const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
    googleEventId: String,
    summary: String,
    description: String,
    start: {
        dateTime: Date,
        timeZone: String
    },
    end: {
        dateTime: Date,
        timeZone: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema); 