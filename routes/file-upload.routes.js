// ============================================
// FILE UPLOAD ROUTE FOR MESSAGING
// Author: itqatarfoam-hub
// Date: 2025-11-27 12:35:00 UTC
// ============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'messages');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp_originalname
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

// File filter to allow only certain types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
    }
};

// Configure upload limits
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Upload single file
router.post('/upload-file', requireAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // File info
        const fileUrl = `/uploads/messages/${req.file.filename}`;
        const fileInfo = {
            url: fileUrl,
            name: req.file.originalname,
            size: req.file.size,
            type: req.file.mimetype,
            uploadedBy: req.session.user.id,
            uploadedAt: new Date().toISOString()
        };

        logger.info('File uploaded successfully', {
            filename: req.file.filename,
            user: req.session.user.username
        });

        res.json({
            success: true,
            file: fileInfo
        });
    } catch (error) {
        logger.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Download file (optional - for tracking downloads)
router.get('/download/:filename', requireAuth, (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Set headers for download
        res.download(filePath);
    } catch (error) {
        logger.error('Error downloading file:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

module.exports = router;
