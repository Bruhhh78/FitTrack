const Measurement = require('../models/Measurement');
const { uploadToCloudinary } = require('../middleware/upload');

// @desc    Add daily measurement
// @route   POST /api/measurements
const addMeasurement = async (req, res) => {
  try {
    const { batchId, date } = req.body;
    const searchDate = date ? new Date(date) : new Date();
    
    // Set search range for the entire day (local time)
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    let measurement = await Measurement.findOne({
      userId: req.user._id,
      batchId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const updateData = {};
    const fields = ['face', 'neck', 'chest', 'armsLeft', 'armsRight', 'belly', 'hips', 'thighsLeft', 'thighsRight', 'weight', 'notes', 'stepsCount'];
    
    fields.forEach(f => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    if (req.files) {
      // Body images
      if (!updateData.images) updateData.images = measurement?.images || {};
      const imageFields = ['left', 'right', 'center'];
      for (const field of imageFields) {
        if (req.files[field] && req.files[field][0]) {
          const result = await uploadToCloudinary(req.files[field][0].buffer, 'body-progress');
          updateData.images[field] = result.secure_url;
        }
      }

      // Steps image
      if (req.files.stepsImage && req.files.stepsImage[0]) {
        const result = await uploadToCloudinary(req.files.stepsImage[0].buffer, 'steps-proof');
        updateData.stepsImage = result.secure_url;
      }
    }

    if (measurement) {
      measurement = await Measurement.findByIdAndUpdate(measurement._id, updateData, { new: true });
    } else {
      measurement = await Measurement.create({
        userId: req.user._id,
        batchId,
        date: searchDate,
        ...updateData
      });
    }

    res.status(201).json({ success: true, measurement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get measurements for a batch
// @route   GET /api/measurements/batch/:batchId
const getMeasurementsByBatch = async (req, res) => {
  try {
    const measurements = await Measurement.find({
      userId: req.user._id,
      batchId: req.params.batchId,
    }).sort({ date: -1 });

    res.json({ success: true, measurements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get latest measurement
// @route   GET /api/measurements/latest/:batchId
const getLatestMeasurement = async (req, res) => {
  try {
    const measurement = await Measurement.findOne({
      userId: req.user._id,
      batchId: req.params.batchId,
    }).sort({ date: -1 });

    res.json({ success: true, measurement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update measurement
// @route   PUT /api/measurements/:id
const updateMeasurement = async (req, res) => {
  try {
    const measurement = await Measurement.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!measurement) {
      return res.status(404).json({ message: 'Measurement not found' });
    }

    res.json({ success: true, measurement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload body images
// @route   POST /api/measurements/images
const uploadBodyImages = async (req, res) => {
  try {
    const uploadedImages = {};

    if (req.files) {
      const imageFields = ['left', 'right', 'center'];
      for (const field of imageFields) {
        if (req.files[field] && req.files[field][0]) {
          const result = await uploadToCloudinary(
            req.files[field][0].buffer,
            'body-progress'
          );
          uploadedImages[field] = result.secure_url;
        }
      }
    }

    res.json({ success: true, images: uploadedImages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addMeasurement,
  getMeasurementsByBatch,
  getLatestMeasurement,
  updateMeasurement,
  uploadBodyImages,
};
