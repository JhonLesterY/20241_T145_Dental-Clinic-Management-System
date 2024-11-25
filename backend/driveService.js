const { google } = require('googleapis');
const { getDriveService } = require('./googleAuth');
const fs = require('fs');

const uploadToDrive = async (filePath, fileName, mimeType) => {
    try {
        const drive = await getDriveService();
        console.log('Drive service initialized'); // Debug log
        
        const fileMetadata = {
            name: fileName,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
        };
        console.log('File metadata:', fileMetadata); // Debug log

        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(filePath)
        };
        console.log('Media prepared'); // Debug log

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });
        console.log('Drive API response:', response.data); // Debug log

        // Make the file viewable by anyone with the link
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        return {
            fileId: response.data.id,
            webViewLink: response.data.webViewLink
        };
    } catch (error) {
        console.error('Detailed upload error:', error); // More detailed error
        console.error('Error stack:', error.stack); // Stack trace
        throw new Error('Failed to upload file to Google Drive: ' + error.message);
    }
};

const deleteFromDrive = async (fileId) => {
    try {
        const drive = await getDriveService();
        await drive.files.delete({
            fileId: fileId
        });
        return true;
    } catch (error) {
        console.error('Error deleting from Google Drive:', error);
        throw new Error('Failed to delete file from Google Drive');
    }
};

const listFiles = async () => {
    try {
        const drive = await getDriveService();
        const response = await drive.files.list({
            pageSize: 10,
            fields: 'files(id, name, webViewLink)',
            q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`
        });
        return response.data.files;
    } catch (error) {
        console.error('Error listing files from Google Drive:', error);
        throw new Error('Failed to list files from Google Drive');
    }
};

module.exports = {
    uploadToDrive,
    deleteFromDrive,
    listFiles
};