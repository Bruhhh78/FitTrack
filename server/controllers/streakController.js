const Streak = require('../models/Streak');
const Measurement = require('../models/Measurement');
const MealLog = require('../models/MealLog');
const Enrollment = require('../models/Enrollment');

const getStreak = async (req, res) => {
  try {
    const { batchId } = req.params;
    let streak = await Streak.findOne({ userId: req.user._id, batchId }).populate('batchId');
    if (!streak) {
      streak = await Streak.create({ userId: req.user._id, batchId });
      await streak.populate('batchId');
    }
    
    const enrollment = await Enrollment.findOne({ userId: req.user._id, batchId, status: 'active' });
    
    res.json({ success: true, streak, enrollment });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const logDay = async (req, res) => {
  try {
    const { batchId, completedExercise, completedDiet } = req.body;
    let streak = await Streak.findOne({ userId: req.user._id, batchId });
    if (!streak) streak = await Streak.create({ userId: req.user._id, batchId });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const alreadyLogged = streak.completedDays.find(d => new Date(d.date).toDateString() === today.toDateString());
    if (alreadyLogged) {
      alreadyLogged.completedExercise = completedExercise || alreadyLogged.completedExercise;
      alreadyLogged.completedDiet = completedDiet || alreadyLogged.completedDiet;
    } else {
      // Check measurement
      const startD = new Date(today); const endD = new Date(today); endD.setHours(23,59,59,999);
      const hasMeasurement = await Measurement.findOne({ userId: req.user._id, batchId, date: { $gte: startD, $lte: endD } });
      const hasMealLog = await MealLog.findOne({ userId: req.user._id, batchId, date: { $gte: startD, $lte: endD } });
      streak.completedDays.push({ date: today, completedExercise: completedExercise || false, completedDiet: completedDiet || false, completedMeasurement: !!hasMeasurement, completedMealLog: !!hasMealLog });
    }

    // Calculate streak
    const sortedDays = streak.completedDays.sort((a, b) => new Date(b.date) - new Date(a.date));
    let currentStreak = 0;
    const checkDate = new Date(today);
    for (const day of sortedDays) {
      if (new Date(day.date).toDateString() === checkDate.toDateString()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }

    streak.currentStreak = currentStreak;
    streak.longestStreak = Math.max(streak.longestStreak, currentStreak);
    streak.lastLogDate = today;
    streak.totalPoints = streak.completedDays.length * 10;
    await streak.save();

    // Update enrollment progress and currentDay
    const enrollment = await Enrollment.findOne({ userId: req.user._id, batchId, status: 'active' }).populate('batchId');
    if (enrollment && enrollment.batchId) {
      const batch = enrollment.batchId;
      const totalDays = batch.durationType === 'weeks' ? batch.duration * 7 : batch.durationType === 'months' ? batch.duration * 30 : batch.duration;
      
      // Calculate current day in program
      const diffTime = Math.abs(today - new Date(enrollment.enrolledAt).setHours(0,0,0,0));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      enrollment.currentDay = Math.min(diffDays, totalDays);
      enrollment.progress = Math.min(Math.round((streak.completedDays.length / totalDays) * 100), 100);
      await enrollment.save();
    }

    res.json({ success: true, streak });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getStreakHistory = async (req, res) => {
  try {
    const streak = await Streak.findOne({ userId: req.user._id, batchId: req.params.batchId });
    res.json({ success: true, completedDays: streak?.completedDays || [], currentStreak: streak?.currentStreak || 0, longestStreak: streak?.longestStreak || 0 });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getStreak, logDay, getStreakHistory };
