require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'a@a.com';
const ADMIN_PASSWORD = 'password123';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      // Update role to admin if user exists but isn't admin
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log(`✅ User "${ADMIN_EMAIL}" upgraded to admin!`);
      } else {
        console.log(`ℹ️  Admin "${ADMIN_EMAIL}" already exists.`);
      }
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        isVerified: true,
      });
      console.log(`✅ Admin account created!`);
    }

    console.log(`\n   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`\n⚠️  Change the password after first login!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
