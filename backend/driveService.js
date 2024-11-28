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

        // Check if folder exists
        const response = await drive.files.list({
            q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents`,
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        if (response.data.files.length > 0) {
            return response.data.files[0].id;
        }

        // Create new folder
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId]
        };

        const folder = await drive.files.create({
            requestBody: folderMetadata,
            fields: 'id'
        });

        // Set folder permissions
        await drive.permissions.create({
            fileId: folder.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        return folder.data.id;
    } catch (error) {
        console.error('Error creating folder:', error);
        throw new Error(`Failed to get/create patient folder: ${error.message}`);
    }
};

const getFileContent = async (fileId) => {
    try {
        const drive = await getDriveService();
        
        // Get file metadata
        const file = await drive.files.get({
            fileId: fileId,
            fields: 'mimeType'
        });

        // Get file content
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, {
            responseType: 'stream'
        });

        return {
            content: response.data,
            mimeType: file.data.mimeType
        };
    } catch (error) {
        console.error('Error getting file from Drive:', error);
        throw new Error(`Failed to get file from Google Drive: ${error.message}`);
    }
};

module.exports = {
    uploadToDrive,
    getFileContent
};