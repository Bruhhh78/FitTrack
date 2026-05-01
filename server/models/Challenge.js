const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      required: [true, 'Challenge duration in days is required'],
    },
    startDay: {
      type: Number,
      required: true,
    },
    endDay: {
      type: Number,
      required: true,
    },
    exercises: [
      {
        name: { type: String, required: true },
        sets: { type: Number },
        reps: { type: Number },
        duration: { type: String },
        instructions: { type: String },
        videoUrl: { type: String },
      },
    ],
    dietPlan: {
      breakfast: { type: String, default: '' },
      lunch: { type: String, default: '' },
      dinner: { type: String, default: '' },
      snacks: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    instructions: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Challenge', challengeSchema);
