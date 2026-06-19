const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Batch = require('../models/Batch');
const Enrollment = require('../models/Enrollment');
const Streak = require('../models/Streak');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { batchId } = req.body;
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Use offerPrice if available, otherwise regular price
    const amountToPay = batch.offerPrice || batch.originalPrice;

    const options = {
      amount: amountToPay * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `rcpt_${req.user._id.toString().slice(-8)}_${Date.now().toString().slice(-6)}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Failed to create Razorpay order' });
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, batchId, amount } = req.body;
    const userId = req.user._id;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Create payment record
    const payment = await Payment.create({
      userId,
      batchId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      status: 'captured',
    });

    // Handle Enrollment
    let enrollment = await Enrollment.findOne({ userId, batchId });

    if (enrollment) {
      if (enrollment.status === 'active') {
        return res.status(400).json({ success: false, message: 'Enrollment already active' });
      }
      // Update existing pending enrollment
      enrollment.status = 'active';
      enrollment.paymentId = payment._id;
      await enrollment.save();
    } else {
      // Create new active enrollment
      enrollment = await Enrollment.create({
        userId,
        batchId,
        paymentId: payment._id,
        status: 'active',
      });
    }

    // Initialize streak
    const streakExists = await Streak.findOne({ userId, batchId });
    if (!streakExists) {
      await Streak.create({ userId, batchId });
    }

    // Send Welcome Email
    const { sendWelcomeEmail, sendAdminEnrollmentNotification } = require('../utils/email');
    sendWelcomeEmail(req.user).catch(err => console.error('Welcome email error (Razorpay):', err));
    
    // Send Admin Notification
    Batch.findById(batchId).then(batch => {
      const batchTitle = batch ? batch.title : 'Program';
      sendAdminEnrollmentNotification('anmolsrivastava678@gmail.com', req.user, batchTitle, 'Razorpay Payment')
        .catch(err => console.error('Admin notification error (Razorpay):', err));
    }).catch(err => console.error('Error fetching batch for admin notification (Razorpay):', err));

    res.json({
      success: true,
      message: 'Payment verified and enrollment activated!',
      enrollment,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error while verifying payment' });
  }
};

module.exports = { createOrder, verifyPayment };
