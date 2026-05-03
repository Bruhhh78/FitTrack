const express = require('express');
const router = express.Router();
const { getChatHistory, clearChat } = require('../controllers/chatController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/history/:receiverId/:batchId', protect, getChatHistory);
router.post('/clear', protect, adminOnly, clearChat);

module.exports = router;
