const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getAllUsers, 
  getEnrollmentsByBatch, 
  getUserImages, 
  getUserProgress,
  allotBatch,
  generateToken,
  getDailyMonitor
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/enrollments/:batchId', getEnrollmentsByBatch);
router.get('/user-images/:userId', getUserImages);
router.get('/user-progress/:userId/:batchId', getUserProgress);
router.post('/allot-batch', allotBatch);
router.post('/generate-token', generateToken);
router.get('/daily-monitor/:batchId', getDailyMonitor);

module.exports = router;
