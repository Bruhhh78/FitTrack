const Batch = require('../models/Batch');
const Challenge = require('../models/Challenge');
const Enrollment = require('../models/Enrollment');

// @desc    Get all active batches (public)
// @route   GET /api/batches
const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Add enrollment status if user is logged in
    const batchesWithCount = await Promise.all(
      batches.map(async (batch) => {
        const enrollmentCount = await Enrollment.countDocuments({ batchId: batch._id });
        let isEnrolled = false;
        if (req.user) {
          const enrollment = await Enrollment.findOne({ userId: req.user._id, batchId: batch._id, status: 'active' });
          isEnrolled = !!enrollment;
        }
        return { ...batch.toObject(), enrollmentCount, isEnrolled };
      })
    );

    res.json({ success: true, batches: batchesWithCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single batch with challenges
// @route   GET /api/batches/:id
const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('createdBy', 'name');
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const challenges = await Challenge.find({ batchId: batch._id }).sort({ order: 1 });
    const enrollmentCount = await Enrollment.countDocuments({ batchId: batch._id });

    // Check if current user is enrolled
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        batchId: batch._id,
        status: 'active',
      });
      isEnrolled = !!enrollment;
    }

    res.json({
      success: true,
      batch: { ...batch.toObject(), challenges, enrollmentCount, isEnrolled },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a batch (Admin)
// @route   POST /api/batches
const createBatch = async (req, res) => {
  try {
    const batchData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const batch = await Batch.create(batchData);
    res.status(201).json({ success: true, batch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a batch (Admin)
// @route   PUT /api/batches/:id
const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json({ success: true, batch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a batch (Admin)
// @route   DELETE /api/batches/:id
const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Also delete associated challenges
    await Challenge.deleteMany({ batchId: req.params.id });

    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBatches, getBatchById, createBatch, updateBatch, deleteBatch };
