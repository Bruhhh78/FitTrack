const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getEnrollmentsByBatch, getUserImages, getUserProgress } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/enrollments/:batchId', getEnrollmentsByBatch);
router.get('/user-images/:userId', getUserImages);
router.get('/user-progress/:userId/:batchId', getUserProgress);

module.exports = router;
