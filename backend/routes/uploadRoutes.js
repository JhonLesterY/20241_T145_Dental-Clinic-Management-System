const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToDrive, getFileContent } = require('../driveService');
const fs = require('fs');
const path = require('path');
const Appointment = require('../models/Appointment');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

router.post('/', upload.single('file'), async (req, res) => {
    console.log('Upload request received');
    console.log('File details:', req.file);
    console.log('Patient details:', req.body);

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!req.body.patientId || !req.body.patientName || !req.body.fileType) {
            return res.status(400).json({ error: 'Patient information and file type are required' });
        }

        const { patientId, patientName, fileType } = req.body;

        // Find the latest pending appointment for this patient
        const appointment = await Appointment.findOne({
            userId: patientId,
            status: 'pending'
        }).sort({ createdAt: -1 });

        if (!appointment) {
            return res.status(404).json({ error: 'No pending appointment found' });
        }

        // Upload to Google Drive with the new service implementation
        const result = await uploadToDrive(req.file, {
            patientId,
            patientName,
            fileType
        });

        // Update appointment with file information
        const updateData = {
            [`requirements.${fileType}`]: {
                fileId: result.fileId,
                webViewLink: result.webViewLink,
                fileName: req.file.originalname,
                uploadedAt: new Date()
            }
        };

        await Appointment.findByIdAndUpdate(
            appointment._id,
            updateData,
            { new: true }
        );

        res.json({
            success: true,
            fileId: result.fileId,
            webViewLink: result.webViewLink,
            fileName: req.file.originalname
        });
    } catch (error) {
        console.error('Upload error:', error);
        
        // Clean up the temporary file if it exists
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error cleaning up temporary file:', unlinkError);
            }
        }
        
        res.status(500).json({ 
            error: error.message || 'Upload failed',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Add route to get file content
router.get('/file/:fileId', async (req, res) => {
    try {
        console.log('Fetching file with ID:', req.params.fileId);
        const result = await getFileContent(req.params.fileId);
        console.log('File mime type:', result.mimeType);
        
        // Set content type header
        res.setHeader('Content-Type', result.mimeType);
        
        // Pipe the stream directly to response
        result.content.pipe(res);
        
        // Handle errors in the stream
        result.content.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error streaming file' });
            }
        });
    } catch (error) {
        console.error('Error getting file:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to get file' });
        }
    }
});

module.exports = router;