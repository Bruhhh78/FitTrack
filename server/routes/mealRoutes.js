const express = require('express');
const router = express.Router();
const { addMealLog, getMealLogsByBatch, getTodayMealLog, uploadMealImage, deleteMealLog } = require('../controllers/mealLogController');
const { protect } = require('../middleware/auth');
const { uploadToMemory } = require('../middleware/upload');

router.post('/', protect, addMealLog);
router.get('/batch/:batchId', protect, getMealLogsByBatch);
router.get('/today/:batchId', protect, getTodayMealLog);
router.post('/upload-image', protect, uploadToMemory.single('image'), uploadMealImage);
router.delete('/:id', protect, deleteMealLog);

module.exports = router;
