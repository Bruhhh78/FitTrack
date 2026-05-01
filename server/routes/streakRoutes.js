const express = require('express');
const router = express.Router();
const { getStreak, logDay, getStreakHistory } = require('../controllers/streakController');
const { protect } = require('../middleware/auth');

router.get('/:batchId', protect, getStreak);
router.post('/log', protect, logDay);
router.get('/history/:batchId', protect, getStreakHistory);

module.exports = router;
