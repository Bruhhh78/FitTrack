const express = require('express');
const router = express.Router();
const { uploadToMemory, uploadToCloudinary } = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');
const File = require('../models/File');

// @desc    Upload a file (Images to Cloudinary, PDFs to MongoDB)
// @route   POST /api/upload
router.post('/', protect, adminOnly, uploadToMemory.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isPdf = req.file.mimetype === 'application/pdf';
    
    // Check PDF size limit (5MB)
    if (isPdf && req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'PDF file size should not exceed 5MB' });
    }

    if (isPdf) {
      // Save to MongoDB
      const newFile = new File({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        data: req.file.buffer,
        size: req.file.size
      });
      const savedFile = await newFile.save();
      
      // Use local server URL
      const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/files/${savedFile._id}`;
      
      return res.json({
        success: true,
        url: fileUrl,
        mongoId: savedFile._id
      });
    } else {
      // Save images to Cloudinary as usual
      const result = await uploadToCloudinary(
        req.file.buffer, 
        'curriculum', 
        'auto',
        req.file.originalname
      );

      res.json({
        success: true,
        url: result.secure_url,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
