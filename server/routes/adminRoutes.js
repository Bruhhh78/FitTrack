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
router.post('/cleanup-enrollments', async (req, res) => {
  try {
    const Enrollment = require('../models/Enrollment');
    const enrollments = await Enrollment.find().populate('userId');
    const orphaned = enrollments.filter(e => !e.userId);
    const orphanedIds = orphaned.map(e => e._id);
    await Enrollment.deleteMany({ _id: { $in: orphanedIds } });
    res.json({ success: true, count: orphanedIds.length });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/send-manual-email', async (req, res) => {
  try {
    const { userId, type } = req.body;
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { sendWelcomeEmail, sendDailyReminder } = require('../utils/email');
    if (type === 'welcome') await sendWelcomeEmail(user);
    else if (type === 'reminder') await sendDailyReminder(user);

    res.json({ success: true, message: `Email sent to ${user.email}` });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
