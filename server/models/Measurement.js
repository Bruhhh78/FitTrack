const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // Body measurements in cm
    face: { type: Number, default: 0 },
    neck: { type: Number, default: 0 },
    chest: { type: Number, default: 0 },
    armsLeft: { type: Number, default: 0 },
    armsRight: { type: Number, default: 0 },
    belly: { type: Number, default: 0 },
    hips: { type: Number, default: 0 },
    thighsLeft: { type: Number, default: 0 },
    thighsRight: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    // Body images uploaded to Cloudinary
    images: {
      left: { type: String, default: '' },
      right: { type: String, default: '' },
      center: { type: String, default: '' },
    },
    stepsCount: {
      type: Number,
      default: 0,
    },
    stepsImage: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for efficient queries
measurementSchema.index({ userId: 1, batchId: 1, date: -1 });

module.exports = mongoose.model('Measurement', measurementSchema);
