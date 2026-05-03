const MealLog = require('../models/MealLog');
const { uploadToCloudinary } = require('../middleware/upload');

const addMealLog = async (req, res) => {
  try {
    const { batchId, date, meals, notes } = req.body;
    const searchDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(searchDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    let mealLog = await MealLog.findOne({
      userId: req.user._id, batchId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (mealLog) {
      if (meals && meals.length > 0) {
        for (const meal of meals) {
          const idx = mealLog.meals.findIndex((m) => m.type === meal.type);
          if (idx >= 0) mealLog.meals[idx] = meal;
          else mealLog.meals.push(meal);
        }
      }
      if (notes) mealLog.notes = notes;
      mealLog.totalCalories = mealLog.meals.reduce((s, m) => s + (m.calories || 0), 0);
      await mealLog.save();
    } else {
      const totalCalories = (meals || []).reduce((s, m) => s + (m.calories || 0), 0);
      mealLog = await MealLog.create({ userId: req.user._id, batchId, date: startOfDay, meals: meals || [], notes, totalCalories });
    }
    res.status(201).json({ success: true, mealLog });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMealLogsByBatch = async (req, res) => {
  try {
    const mealLogs = await MealLog.find({ userId: req.user._id, batchId: req.params.batchId }).sort({ date: -1 });
    res.json({ success: true, mealLogs });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getTodayMealLog = async (req, res) => {
  try {
    const { date } = req.query;
    const searchDate = date ? new Date(date) : new Date();
    const start = new Date(searchDate); start.setUTCHours(0,0,0,0);
    const end = new Date(searchDate); end.setUTCHours(23,59,59,999);
    const mealLog = await MealLog.findOne({ userId: req.user._id, batchId: req.params.batchId, date: { $gte: start, $lte: end } });
    res.json({ success: true, mealLog });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const uploadMealImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    const result = await uploadToCloudinary(req.file.buffer, 'meals');
    res.json({ success: true, imageUrl: result.secure_url });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteMealLog = async (req, res) => {
  try {
    const mealLog = await MealLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!mealLog) return res.status(404).json({ message: 'Meal log not found' });
    res.json({ success: true, message: 'Meal log deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { addMealLog, getMealLogsByBatch, getTodayMealLog, uploadMealImage, deleteMealLog };
