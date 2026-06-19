const express = require('express');
const passport = require('passport');
const router = express.Router();
const { register, login, getMe, updateProfile, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Google OAuth route
router.post('/google', googleLogin);

module.exports = router;
