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
    curriculum: [
      {
        title: { type: String, required: true },
        order: { type: Number, default: 0 },
        items: [
          {
            type: {
              type: String,
              enum: ['text', 'image', 'video', 'pdf'],
              required: true,
            },
            title: { type: String, required: true },
            content: { type: String }, // Text content or URL
            order: { type: Number, default: 0 },
          },
        ],
      },
    ],
    dietRoutine: [
      {
        day: { type: Number, required: true },
        week: { type: Number, required: true },
        type: { type: String, enum: ['regular', 'cleanse', 'fasting'], default: 'regular' },
        rule: { type: String, default: '' },
        veg: {
          breakfast: { type: String, default: '' },
          lunch: { type: String, default: '' },
          dinner: { type: String, default: '' },
        },
        nonveg: {
          breakfast: { type: String, default: '' },
          lunch: { type: String, default: '' },
          dinner: { type: String, default: '' },
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Batch', batchSchema);
