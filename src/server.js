require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { app } = require('./app');

const PORT = 5000;
const MONGODB_URI = 'mongodb+srv://Vercel-Admin-learnify:xDq2LZlEZJ1bw2tl@learnify.kxk8990.mongodb.net/?retryWrites=true&w=majority'

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    const server = http.createServer(app);

    const { Server } = require('socket.io');
    const io = new Server(server, { cors: { origin: '*' } });
    const { ChatMessage } = require('./models/ChatMessage');
    
    io.on('connection', (socket) => {
      socket.on('join-course', (courseId) => {
        socket.join(`course-${courseId}`);
      });

      socket.on('send-message', async (data) => {
        try {
          const { courseId, senderId, message } = data;
          const chatMsg = await ChatMessage.create({ course: courseId, sender: senderId, message });
          const populated = await ChatMessage.findById(chatMsg._id).populate('sender', 'name email');
          io.to(`course-${courseId}`).emit('new-message', populated);
        } catch (err) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });
    });

    // Export io for use in routes if needed
    app.locals.io = io;

    server.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Learnify LMS Server Started');
      console.log('='.repeat(60));
      console.log(`📡 API Server: http://localhost:${PORT}`);
      console.log(`🗄️  Database: Connected to MongoDB`);
      console.log(`🔐 JWT Auth: Enabled`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();