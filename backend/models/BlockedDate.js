const mongoose = require('mongoose');

const blockedDateSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('BlockedDate', blockedDateSchema); 