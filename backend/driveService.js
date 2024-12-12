const fs = require('fs');
const { getDriveService } = require('./googleAuth');

const uploadToDrive = async (file, patientDetails) => {
    try {
        const drive = await getDriveService();
        console.log('Drive service initialized');
        
        // Get or create patient folder
        const patientFolderId = await getOrCreatePatientFolder(drive, patientDetails);
        console.log('Patient folder ID:', patientFolderId);

        // Upload file to Drive
        const fileMetadata = {
            name: file.originalname,
            parents: [patientFolderId]
        };

        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path)
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });

        // Make the file viewable by anyone with the link
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        // Clean up temporary file
        fs.unlinkSync(file.path);

        return {
            fileId: response.data.id,
            webViewLink: response.data.webViewLink
        };
    } catch (error) {
        console.error('Upload error details:', error);
        // Clean up temporary file if it exists
        if (file && file.path) {
            try {
                fs.unlinkSync(file.path);
            } catch (unlinkError) {
                console.error('Error cleaning up temporary file:', unlinkError);
            }
        }
        throw new Error(`Failed to upload file to Google Drive: ${error.message}`);
    }
};

const getOrCreatePatientFolder = async (drive, patientDetails) => {
    try {
        const folderName = `Patient_${patientDetails.patientId}_${patientDetails.patientName}`;
        const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        console.log('Attempting to create/find folder:', folderName);
        console.log('Parent folder ID:', parentFolderId);

        if (!parentFolderId) {
            throw new Error('GOOGLE_DRIVE_FOLDER_ID not configured');
        }

        // First verify parent folder exists and is accessible with retries
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                await drive.files.get({
                    fileId: parentFolderId,
                    fields: 'id, name, capabilities',
                    supportsAllDrives: true
                });
                break; // Success, exit loop
            } catch (parentError) {
                console.error(`Parent folder access attempt ${retryCount + 1} failed:`, parentError);
                retryCount++;
                
                if (retryCount === maxRetries) {
                    throw new Error('Cannot access parent folder after multiple attempts. Please verify folder ID and permissions.');
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }

        // Rest of your existing folder creation/search code
        const searchQuery = {
            q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        };

        const existingFolder = await drive.files.list(searchQuery);
        
        if (existingFolder.data.files.length > 0) {
            return existingFolder.data.files[0].id;
        }

        // Create new folder with explicit permissions
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId],
            // Add explicit permission settings
            permissionIds: ['anyoneWithLink'],
            writersCanShare: true
        };

        const newFolder = await drive.files.create({
            requestBody: folderMetadata,
            fields: 'id',
            supportsAllDrives: true
        });

        // Set folder permissions immediately
        await drive.permissions.create({
            fileId: newFolder.data.id,
            requestBody: {
                role: 'writer',
                type: 'anyone'
            },
            supportsAllDrives: true,
            sendNotificationEmail: false
        });

        return newFolder.data.id;
    } catch (error) {
        console.error('Detailed folder error:', {
            message: error.message,
            stack: error.stack,
            details: error.response?.data
        });
        throw new Error(`Folder operation failed: ${error.message}`);
    }
};

const getFileContent = async (fileId) => {
    try {
        const drive = await getDriveService();
        
        // Get file metadata first
        const metadata = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, mimeType',
            supportsAllDrives: true
        });

        if (!metadata.data) {
            throw new Error('File not found');
        }

        // Get file content
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media',
            supportsAllDrives: true
        }, {
            responseType: 'arraybuffer'
        });

        // Ensure we have valid buffer data
        let buffer;
        if (response.data instanceof ArrayBuffer) {
            buffer = Buffer.from(new Uint8Array(response.data));
        } else if (typeof response.data === 'string') {
            buffer = Buffer.from(response.data);
        } else if (Buffer.isBuffer(response.data)) {
            buffer = response.data;
        } else {
            throw new Error('Unexpected response data type');
        }

        return {
            content: buffer,
            mimeType: metadata.data.mimeType,
            fileName: metadata.data.name
        };
    } catch (error) {
        console.error('Error getting file from Drive:', {
            error: error.message,
            stack: error.stack,
            responseType: typeof response?.data
        });
        throw new Error(`Failed to get file from Google Drive: ${error.message}`);
    }
};

module.exports = {
    uploadToDrive,
    getFileContent
};