const express = require('express');
const router = express.Router();
const { addMeasurement, getMeasurementsByBatch, getLatestMeasurement, updateMeasurement, uploadBodyImages } = require('../controllers/measurementController');
const { protect } = require('../middleware/auth');
const { uploadToMemory } = require('../middleware/upload');

router.post('/', protect, uploadToMemory.fields([{ name: 'left', maxCount: 1 }, { name: 'right', maxCount: 1 }, { name: 'center', maxCount: 1 }, { name: 'stepsImage', maxCount: 1 }]), addMeasurement);
router.get('/batch/:batchId', protect, getMeasurementsByBatch);
router.get('/latest/:batchId', protect, getLatestMeasurement);
router.put('/:id', protect, updateMeasurement);
router.post('/images', protect, uploadToMemory.fields([{ name: 'left', maxCount: 1 }, { name: 'right', maxCount: 1 }, { name: 'center', maxCount: 1 }]), uploadBodyImages);

module.exports = router;
