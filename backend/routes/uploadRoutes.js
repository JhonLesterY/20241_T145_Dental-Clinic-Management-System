const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToDrive, getFileContent } = require('../driveService');
const fs = require('fs');
const path = require('path');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

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

        // First find the patient to get their MongoDB _id
        const patient = await Patient.findOne({ patient_id: parseInt(patientId) });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Find the latest pending appointment using the MongoDB _id
        const appointment = await Appointment.findOne({
            patientId: patient._id,
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
        const fileId = req.params.fileId;
        // Generate a direct Google Drive view link
        const driveViewLink = `https://drive.google.com/file/d/${fileId}/view`;
        
        // Return JSON with the direct view link
        res.json({
            viewLink: driveViewLink
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to retrieve file',
            message: error.message 
        });
    }
});

module.exports = router;