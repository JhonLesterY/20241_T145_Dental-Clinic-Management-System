const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const crypto = require('crypto');
const path = require('path');

// Use the direct MongoDB URI
const MONGODB_URI = "mongodb+srv://2201103327:diomedes123@cluster0.d55og.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function updateExistingAdmins() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully');
        
        // Only update admins with Google-compatible email addresses
        const result = await Admin.updateMany(
            { 
                isGoogleUser: { $ne: true },
                $or: [
                    { email: /.*@gmail\.com$/ },
                    { email: /.*@buksu\.edu\.ph$/ },
                    { email: /.*@student\.buksu\.edu\.ph$/ }  // Add your organization's domain
                ]
            },
            { 
                $set: { 
                    isGoogleUser: true,
                    isVerified: true,
                    verificationToken: crypto.randomBytes(32).toString('hex'),
                    verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
                } 
            }
        );

        console.log(`Updated ${result.modifiedCount} admins with Google-compatible emails`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error updating admins:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

updateExistingAdmins(); 