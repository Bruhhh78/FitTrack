const Challenge = require('../models/Challenge');
const Batch = require('../models/Batch');

// @desc    Get challenges for a batch
// @route   GET /api/challenges/batch/:batchId
const getChallengesByBatch = async (req, res) => {
  try {
    const challenges = await Challenge.find({ batchId: req.params.batchId }).sort({ order: 1 });
    res.json({ success: true, challenges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single challenge
// @route   GET /api/challenges/:id
const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate('batchId', 'title');
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create challenge (Admin)
// @route   POST /api/challenges
const createChallenge = async (req, res) => {
  try {
    const batch = await Batch.findById(req.body.batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Auto-set order
    const existingCount = await Challenge.countDocuments({ batchId: req.body.batchId });
    req.body.order = existingCount;

    const challenge = await Challenge.create(req.body);
    res.status(201).json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update challenge (Admin)
// @route   PUT /api/challenges/:id
const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete challenge (Admin)
// @route   DELETE /api/challenges/:id
const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChallengesByBatch,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
};
