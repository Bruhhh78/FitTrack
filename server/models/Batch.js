const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Batch title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Batch description is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration in days is required'],
    },
    durationType: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'days',
    },
    originalPrice: {
      type: Number,
      required: [true, 'Price is required'],
    },
    offerPrice: {
      type: Number,
      required: [true, 'Offer price is required'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    maxParticipants: {
      type: Number,
      default: 50,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    features: [
      {
        type: String,
      },
    ],
    dietPlanPdf: {
      type: String,
      default: '',
    },
    exercisePlanPdf: {
      type: String,
      default: '',
    },
    mealPlanPdf: {
      type: String,
      default: '',
    },
    guideLink: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Batch', batchSchema);
