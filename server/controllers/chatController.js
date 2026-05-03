const Message = require('../models/Message');
const Enrollment = require('../models/Enrollment');

const getChatHistory = async (req, res) => {
  try {
    const { receiverId, batchId } = req.params;
    const senderId = req.user._id;

    // Check if chat is locked (user must have validated token)
    const enrollment = await Enrollment.findOne({ 
      userId: req.user.role === 'admin' ? receiverId : senderId, 
      batchId, 
      status: 'active' 
    });

    if (!enrollment && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Chat is locked until batch is activated' });
    }

    const messages = await Message.find({
      batchId,
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearChat = async (req, res) => {
  try {
    const { userId, batchId } = req.body;
    await Message.deleteMany({
      batchId,
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id }
      ]
    });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChatHistory, clearChat };
