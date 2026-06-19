require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('./config/passport');
const { initCronJobs } = require('./utils/cronJobs');

const app = express();

// Connect to MongoDB
connectDB();

// Initialize Cron Jobs
initCronJobs();

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

// --- EMAIL TESTING ROUTES ---
const { sendWelcomeEmail, sendDailyReminder, sendAdminAlert } = require('./utils/email');
const User = require('./models/User');

app.get('/api/test-email/:type', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    const testUser = { name: 'Test User', email: admin ? admin.email : 'srivastavaanmol091@gmail.com' };

    if (req.params.type === 'welcome') {
      await sendWelcomeEmail(testUser);
      return res.json({ message: 'Welcome email sent to ' + testUser.email });
    }
    if (req.params.type === 'reminder') {
      await sendDailyReminder(testUser);
      return res.json({ message: 'Daily reminder sent to ' + testUser.email });
    }
    if (req.params.type === 'admin-alert') {
      await sendAdminAlert(testUser.email, { name: 'Demo User', email: 'user@example.com', batchName: 'Prayas Batch' }, 2);
      return res.json({ message: 'Admin alert sent to ' + testUser.email });
    }
    res.status(400).json({ message: 'Invalid email type' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// ----------------------------

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
