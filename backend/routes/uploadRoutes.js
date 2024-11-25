const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToDrive } = require('../driveService');
const fs = require('fs');
const path = require('path');

// Configure multer for file upload
const upload = multer({ 
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

router.post('/', upload.single('file'), async (req, res) => {
    console.log('Upload request received'); // Debug log
    console.log('File details:', req.file); // Debug log
    console.log('Environment variables:', {
        GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
    }); // Debug log

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create uploads directory if it doesn't exist
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }

        // Upload to Google Drive
        const result = await uploadToDrive(
            req.file.path,
            req.file.originalname,
            req.file.mimetype
        );

        console.log('Upload successful:', result); // Debug log

        // Clean up the temporary file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            fileId: result.fileId,
            webViewLink: result.webViewLink
        });
    } catch (error) {
        console.error('Upload route error:', error); // More detailed error
        console.error('Error stack:', error.stack); // Stack trace
        
        // Clean up the temporary file if it exists
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ 
            error: error.message,
            details: error.stack // Send more details in development
        });
    }
});

module.exports = router;