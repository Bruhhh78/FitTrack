const Enrollment = require('../models/Enrollment');
const Streak = require('../models/Streak');

const validateToken = async (req, res) => {
  try {
    const { batchId, token } = req.body;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ userId, batchId, token });

    if (!enrollment) {
      return res.status(400).json({ success: false, message: 'Invalid token for this batch' });
    }

    if (enrollment.status === 'active') {
      return res.status(400).json({ success: false, message: 'Enrollment already active' });
    }

    enrollment.status = 'active';
    await enrollment.save();

    // Initialize streak if not already exists
    const streakExists = await Streak.findOne({ userId, batchId });
    if (!streakExists) {
      await Streak.create({ userId, batchId });
    }

    // Send Welcome Email
    const { sendWelcomeEmail, sendAdminEnrollmentNotification } = require('../utils/email');
    sendWelcomeEmail(req.user).catch(err => console.error('Welcome email error (Token):', err));

    // Send Admin Notification
    const Batch = require('../models/Batch');
    Batch.findById(batchId).then(batch => {
      const batchTitle = batch ? batch.title : 'Program';
      sendAdminEnrollmentNotification('anmolsrivastava678@gmail.com', req.user, batchTitle, 'Access Token')
        .catch(err => console.error('Admin notification error (Token):', err));
    }).catch(err => console.error('Error fetching batch for admin notification (Token):', err));

    res.json({ success: true, message: 'Access granted successfully!', enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { validateToken };
