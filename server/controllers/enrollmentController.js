const Enrollment = require('../models/Enrollment');
const Batch = require('../models/Batch');
const Streak = require('../models/Streak');

// @desc    Get user enrollments
// @route   GET /api/enrollments/my
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id, status: 'active' })
      .populate('batchId')
      .sort({ enrolledAt: -1 });

    // Update currentDay dynamically for each active enrollment
    const updatedEnrollments = await Promise.all(enrollments.map(async (e) => {
      if (e.batchId) {
        const totalDays = e.batchId.durationType === 'weeks' ? e.batchId.duration * 7 : e.batchId.durationType === 'months' ? e.batchId.duration * 30 : e.batchId.duration;
        const now = new Date(); now.setHours(0,0,0,0);
        const start = new Date(e.enrolledAt); start.setHours(0,0,0,0);
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        e.currentDay = Math.min(diffDays, totalDays);
        await e.save();
      }
      return e;
    }));

    res.json({ success: true, enrollments: updatedEnrollments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('batchId');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create enrollment after payment
// @route   POST /api/enrollments
const createEnrollment = async (req, res) => {
  try {
    const { batchId, paymentId } = req.body;

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      userId: req.user._id,
      batchId,
    });

    if (existing) {
      return res.status(400).json({ message: 'Already enrolled in this batch' });
    }

    // Check batch capacity
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const enrollmentCount = await Enrollment.countDocuments({ batchId });
    if (enrollmentCount >= batch.maxParticipants) {
      return res.status(400).json({ message: 'Batch is full' });
    }

    const enrollment = await Enrollment.create({
      userId: req.user._id,
      batchId,
      paymentId,
      status: 'active',
    });

    // Initialize streak for this batch
    await Streak.create({
      userId: req.user._id,
      batchId,
    });

    // Send Welcome Email & Admin Notification
    const { sendWelcomeEmail, sendAdminEnrollmentNotification } = require('../utils/email');
    sendWelcomeEmail(req.user).catch(err => console.error('Welcome email error (Manual API):', err));
    sendAdminEnrollmentNotification('anmolsrivastava678@gmail.com', req.user, batch.title, 'Direct API Enrollment')
      .catch(err => console.error('Admin notification error (Manual API):', err));

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check enrollment status
// @route   GET /api/enrollments/check/:batchId
const checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      batchId: req.params.batchId,
      status: 'active',
    });

    res.json({ success: true, isEnrolled: !!enrollment, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const initializeEnrollment = async (req, res) => {
  try {
    const { batchId } = req.body;
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Admins cannot enroll in programs' });

    let enrollment = await Enrollment.findOne({ userId: req.user._id, batchId });
    if (enrollment) {
      if (enrollment.status === 'active') return res.status(400).json({ message: 'Already enrolled' });
      return res.json({ success: true, enrollment });
    }

    enrollment = await Enrollment.create({ userId: req.user._id, batchId, status: 'pending' });
    res.status(201).json({ success: true, enrollment });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getMyEnrollments, getEnrollmentById, createEnrollment, checkEnrollment, initializeEnrollment };
