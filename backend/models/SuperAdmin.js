const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    permissions: {
        type: Map,
        of: {
            roles: {
                type: Map,
                of: [{
                    name: String,
                    enabled: Boolean
                }]
            }
        }
    },
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SuperAdmin', superAdminSchema); 