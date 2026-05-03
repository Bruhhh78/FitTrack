require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('./config/passport');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/measurements', require('./routes/measurementRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/streaks', require('./routes/streakRoutes'));

app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const cron = require('node-cron');
const Enrollment = require('./models/Enrollment');
const Batch = require('./models/Batch');

// Auto-delete chat history for completed batches (Daily at midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Running auto-delete chat history task...');
  try {
    const activeEnrollments = await Enrollment.find({ status: 'active' }).populate('batchId');
    
    for (const e of activeEnrollments) {
      if (!e.batchId) continue;
      
      const totalDays = e.batchId.durationType === 'weeks' ? e.batchId.duration * 7 : e.batchId.durationType === 'months' ? e.batchId.duration * 30 : e.batchId.duration;
      const start = new Date(e.enrolledAt);
      const now = new Date();
      const diffDays = Math.ceil(Math.abs(now - start) / (1000 * 60 * 60 * 24));

      if (diffDays >= totalDays) {
        console.log(`Batch ${e.batchId.title} completed for user ${e.userId}. Deleting chat...`);
        await Message.deleteMany({ batchId: e.batchId._id, $or: [{ senderId: e.userId }, { receiverId: e.userId }] });
        // Optional: mark enrollment as completed
        e.status = 'completed';
        await e.save();
      }
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, batchId, text } = data;
      const newMessage = await Message.create({ senderId, receiverId, batchId, text });
      
      const roomId = [senderId, receiverId, batchId].sort().join('_');
      io.to(roomId).emit('receive_message', newMessage);

      // Create notification for receiver
      const { createNotification } = require('./controllers/notificationController');
      const User = require('./models/User');
      const receiver = await User.findById(receiverId);

      const notification = await createNotification({
        recipient: receiverId,
        sender: senderId,
        type: 'message',
        title: 'New Message',
        message: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        link: receiver.role === 'admin' ? '/admin?tab=messages' : '/messenger'
      });

      // Emit notification to receiver's private room
      io.to(receiverId.toString()).emit('new_notification', notification);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('join_private_room', (userId) => {
    socket.join(userId);
    console.log(`User joined private room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
