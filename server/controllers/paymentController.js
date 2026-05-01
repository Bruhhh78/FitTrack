const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Streak = require('../models/Streak');
const Batch = require('../models/Batch');

const createOrder = async (req, res) => {
  try {
    const { batchId } = req.body;
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Admins cannot enroll in programs' });
    
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const existing = await Enrollment.findOne({ userId: req.user._id, batchId });
    if (existing && existing.status === 'active') return res.status(400).json({ message: 'Already enrolled' });

    const priceToCharge = batch.offerPrice || batch.originalPrice;
    if (!priceToCharge) return res.status(400).json({ message: 'Invalid program price' });

    const options = {
      amount: Math.round(priceToCharge * 100), // Razorpay expects amount in paise
      currency: batch.currency || 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      userId: req.user._id, batchId,
      razorpayOrderId: order.id,
      amount: priceToCharge,
      currency: options.currency,
      receipt: options.receipt,
    });

    res.json({ success: true, order, payment, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, batchId } = req.body;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: 'paid' },
      { new: true }
    );

    // Update enrollment from pending to active
    let enrollment = await Enrollment.findOneAndUpdate(
      { userId: req.user._id, batchId, status: 'pending' },
      { status: 'active', paymentId: payment._id },
      { new: true }
    );

    if (!enrollment) {
      // Fallback: Check if already active or create if missing
      enrollment = await Enrollment.findOne({ userId: req.user._id, batchId });
      if (enrollment && enrollment.status === 'pending') {
         enrollment.status = 'active';
         enrollment.paymentId = payment._id;
         await enrollment.save();
      } else if (!enrollment) {
         enrollment = await Enrollment.create({ userId: req.user._id, batchId, paymentId: payment._id, status: 'active' });
      }
    }

    // Initialize streak if not already exists
    const streakExists = await Streak.findOne({ userId: req.user._id, batchId });
    if (!streakExists) {
      await Streak.create({ userId: req.user._id, batchId });
    }

    res.json({ success: true, message: 'Payment verified', enrollment });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).populate('batchId', 'title offerPrice originalPrice').sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory };
