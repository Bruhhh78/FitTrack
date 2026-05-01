const express = require('express');
const router = express.Router();
const { getMyEnrollments, getEnrollmentById, createEnrollment, checkEnrollment, initializeEnrollment } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, getMyEnrollments);
router.get('/check/:batchId', protect, checkEnrollment);
router.get('/:id', protect, getEnrollmentById);
router.post('/', protect, createEnrollment);
router.post('/initialize', protect, initializeEnrollment);

module.exports = router;
