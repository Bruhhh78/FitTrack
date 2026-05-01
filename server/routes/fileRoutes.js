const express = require('express');
const router = express.Router();
const File = require('../models/File');

// @desc    Get file by ID from MongoDB
// @route   GET /api/files/:id
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set headers for inline viewing
    res.set({
      'Content-Type': file.contentType,
      'Content-Length': file.data.length,
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(file.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
