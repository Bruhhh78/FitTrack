const cron = require('node-cron');
const Enrollment = require('../models/Enrollment');
const Measurement = require('../models/Measurement');
const User = require('../models/User');
const Batch = require('../models/Batch');
const Message = require('../models/Message');
const { sendDailyReminder, sendAdminAlert } = require('./email');

/**
 * Daily Morning Check-in at 6:00 AM
 * 0 6 * * *
 */
const initDailyReminders = () => {
  cron.schedule('0 6 * * *', async () => {
    console.log('Running Daily Morning Reminders...');
    try {
      // Find all active enrollments
      const activeEnrollments = await Enrollment.find({ status: 'active' }).populate('userId');
      
      for (const enrollment of activeEnrollments) {
        if (enrollment.userId && enrollment.userId.email) {
          sendDailyReminder(enrollment.userId).catch(err => 
            console.error(`Failed to send reminder to ${enrollment.userId.email}:`, err)
          );
        }
      }
    } catch (error) {
      console.error('Error in Daily Reminder Cron:', error);
    }
  }, {
    timezone: "Asia/Kolkata" // Change this to your preferred timezone
  });
};

/**
 * Nightly Admin Alert at 10:00 PM
 * 0 22 * * *
 * Checks for users who missed updates for 2+ days
 */
const initAdminAlerts = () => {
  cron.schedule('0 22 * * *', async () => {
    console.log('Running Nightly Admin Alerts...');
    try {
      const activeEnrollments = await Enrollment.find({ status: 'active' })
        .populate('userId')
        .populate('batchId');

      // Find the admin user
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) return;

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      for (const enrollment of activeEnrollments) {
        const lastUpdate = await Measurement.findOne({ 
          userId: enrollment.userId._id,
          batchId: enrollment.batchId._id 
        }).sort({ createdAt: -1 });

        // If no update ever or last update was more than 2 days ago
        if (!lastUpdate || lastUpdate.createdAt < twoDaysAgo) {
          const daysMissed = lastUpdate 
            ? Math.floor((new Date() - lastUpdate.createdAt) / (1000 * 60 * 60 * 24))
            : 'ever';
            
          sendAdminAlert(admin.email, {
            name: enrollment.userId.name,
            email: enrollment.userId.email,
            batchName: enrollment.batchId.title
          }, daysMissed).catch(err => console.error('Admin Alert Error:', err));
        }
      }
    } catch (error) {
      console.error('Error in Admin Alert Cron:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });
};

/**
 * Midnight Chat Cleanup & Batch Completion
 * 0 0 * * *
 */
const initChatCleanup = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running Midnight Chat Cleanup...');
    try {
      const activeEnrollments = await Enrollment.find({ status: 'active' }).populate('batchId');
      
      for (const e of activeEnrollments) {
        if (!e.batchId) continue;
        
        const totalDays = e.batchId.durationType === 'weeks' 
          ? e.batchId.duration * 7 
          : e.batchId.durationType === 'months' 
            ? e.batchId.duration * 30 
            : e.batchId.duration;

        const start = new Date(e.enrolledAt);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now - start) / (1000 * 60 * 60 * 24));

        if (diffDays >= totalDays) {
          console.log(`Batch ${e.batchId.title} completed for user ${e.userId}. Deleting chat...`);
          await Message.deleteMany({ 
            batchId: e.batchId._id, 
            $or: [{ senderId: e.userId }, { receiverId: e.userId }] 
          });
          e.status = 'completed';
          await e.save();
        }
      }
    } catch (error) {
      console.error('Chat Cleanup Error:', error);
    }
  });
};

const initCronJobs = () => {
  initDailyReminders();
  initAdminAlerts();
  initChatCleanup();
  console.log('Cron Jobs Initialized ✅');
};

module.exports = { initCronJobs };
