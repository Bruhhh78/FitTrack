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

    res.json({ success: true, message: 'Access granted successfully!', enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { validateToken };
