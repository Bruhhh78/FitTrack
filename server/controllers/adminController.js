const User = require('../models/User');
const Batch = require('../models/Batch');
const Enrollment = require('../models/Enrollment');
const Measurement = require('../models/Measurement');
const MealLog = require('../models/MealLog');
const Streak = require('../models/Streak');
// const Payment = require('../models/Payment');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBatches = await Batch.countDocuments();
    const activeBatches = await Batch.countDocuments({ isActive: true });
    const totalEnrollments = await Enrollment.countDocuments();
    const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
    
    // Revenue stats (Removed for now as we are using offline payment)
    const totalRevenue = 0; // payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Recent activity
    const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email avatar createdAt');
    const recentEnrollments = await Enrollment.find({ status: 'active' })
      .sort({ enrolledAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .populate('batchId', 'title');
    
    // Batch performance
    const batches = await Batch.find();
    const batchStats = await Promise.all(batches.map(async b => {
      const count = await Enrollment.countDocuments({ batchId: b._id, status: 'active' });
      return { title: b.title, count, price: b.offerPrice };
    }));

    res.json({ 
      success: true, 
      stats: { 
        totalUsers, totalBatches, activeBatches, totalEnrollments, activeEnrollments, 
        totalRevenue, recentUsers, recentEnrollments, batchStats 
      } 
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getEnrollmentsByBatch = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ batchId: req.params.batchId })
      .populate('userId', 'name email avatar phone')
      .sort({ enrolledAt: -1 });
    res.json({ success: true, enrollments });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getUserImages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { batchId } = req.query; // optional filter

    const query = { userId };
    if (batchId) query.batchId = batchId;

    const measurements = await Measurement.find(query)
      .populate('batchId', 'title')
      .sort({ date: -1 });
    const mealLogs = await MealLog.find(query)
      .populate('batchId', 'title')
      .sort({ date: -1 });

    // Group everything by day
    const dayMap = {};
    measurements.forEach(m => {
      const dayKey = new Date(m.date).toISOString().split('T')[0];
      if (!dayMap[dayKey]) dayMap[dayKey] = { date: dayKey, bodyImages: [], meals: [], steps: null, batch: m.batchId?.title || '' };
      dayMap[dayKey].bodyImages.push({
        left: m.images?.left || '',
        right: m.images?.right || '',
        center: m.images?.center || '',
        weight: m.weight,
        belly: m.belly,
        chest: m.chest,
      });
      if (m.stepsCount || m.stepsImage) {
        dayMap[dayKey].steps = { count: m.stepsCount, image: m.stepsImage };
      }
    });
    mealLogs.forEach(ml => {
      const dayKey = new Date(ml.date).toISOString().split('T')[0];
      if (!dayMap[dayKey]) dayMap[dayKey] = { date: dayKey, bodyImages: [], meals: [], steps: null, batch: ml.batchId?.title || '' };
      ml.meals.forEach(m => {
        dayMap[dayKey].meals.push({ type: m.type, description: m.description, image: m.image || '', calories: m.calories });
      });
    });

    // Sort days descending
    const dayWiseData = Object.values(dayMap).sort((a, b) => b.date.localeCompare(a.date));

    res.json({ success: true, dayWiseData, totalDays: dayWiseData.length });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getUserProgress = async (req, res) => {
  try {
    const { userId, batchId } = req.params;
    const measurements = await Measurement.find({ userId, batchId }).sort({ date: 1 });
    const streak = await Streak.findOne({ userId, batchId });
    const mealLogs = await MealLog.find({ userId, batchId }).sort({ date: -1 }).limit(7);
    res.json({ success: true, measurements, streak, recentMeals: mealLogs });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const allotBatch = async (req, res) => {
  try {
    const { userId, batchId } = req.body;
    
    // Check if already alloted
    const existing = await Enrollment.findOne({ userId, batchId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Batch already alloted to this user' });
    }

    const enrollment = await Enrollment.create({
      userId,
      batchId,
      status: 'pending'
    });

    // Create notification
    const { createNotification } = require('./notificationController');
    const batch = await Batch.findById(batchId);
    await createNotification({
      recipient: userId,
      type: 'batch_allotted',
      title: 'Program Allotted!',
      message: `You have been allotted to the program: ${batch.title}. Please check your dashboard to unlock it.`,
      link: '/batches'
    });

    res.json({ success: true, message: 'Batch alloted successfully', enrollment });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const generateToken = async (req, res) => {
  try {
    const { enrollmentId } = req.body;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 7; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { token },
      { new: true }
    );

    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    res.json({ success: true, token: enrollment.token });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { 
  getDashboardStats, 
  getAllUsers, 
  getEnrollmentsByBatch, 
  getUserImages, 
  getUserProgress,
  allotBatch,
  generateToken
};
