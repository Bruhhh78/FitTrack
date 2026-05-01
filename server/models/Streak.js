const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema(
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
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastLogDate: {
      type: Date,
    },
    completedDays: [
      {
        date: { type: Date, required: true },
        completedExercise: { type: Boolean, default: false },
        completedDiet: { type: Boolean, default: false },
        completedMeasurement: { type: Boolean, default: false },
        completedMealLog: { type: Boolean, default: false },
      },
    ],
    totalPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
streakSchema.index({ userId: 1, batchId: 1 });

module.exports = mongoose.model('Streak', streakSchema);
