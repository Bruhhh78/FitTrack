const mongoose = require('mongoose');

const mealLogSchema = new mongoose.Schema(
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
    meals: [
      {
        type: {
          type: String,
          enum: ['breakfast', 'lunch', 'dinner'],
          required: true,
        },
        description: {
          type: String,
          default: '',
        },
        image: {
          type: String,
          default: '',
        },
        calories: {
          type: Number,
          default: 0,
        },
        time: {
          type: String,
          default: '',
        },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    totalCalories: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
mealLogSchema.index({ userId: 1, batchId: 1, date: -1 });

module.exports = mongoose.model('MealLog', mealLogSchema);
