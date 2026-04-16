const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();


// --- 1. Import Routes ---
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const Message = require('./models/Message'); // Adjust the path if your models folder is named differently!
const app = express();

// --- Wrap Express in an HTTP server for the Chat Pipe ---
const server = http.createServer(app);

// --- 2. Security & Limits (MUST BE BEFORE ROUTES) ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: ["https://reelestate-beta.vercel.app", "http://localhost:5173"],
  credentials: true
}));

// --- 3. SOCKET.IO PRIVATE CHAT SETUP ---
const io = new Server(server, {
  cors: {
    origin: ["https://reelestate-beta.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

// 🚨 1. SMART TRACKING MAPS
const activeSockets = new Map(); // Maps socket.id -> userId
const userConnectionCounts = new Map(); // Maps userId -> number of open tabs

io.on('connection', (socket) => {
  console.log('⚡ User connected to chat:', socket.id);

  // 🚨 2. SMART ONLINE DETECTION
  socket.on('iam_online', async (userId) => {
    activeSockets.set(socket.id, userId);
    
    // Count how many tabs this user has open
    const currentCount = userConnectionCounts.get(userId) || 0;
    userConnectionCounts.set(userId, currentCount + 1);

    // ONLY hit the database if this is their first tab opening
    if (currentCount === 0) {
      const User = mongoose.models.User;
      if (User) await User.findByIdAndUpdate(userId, { isOnline: true });
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined private room: ${roomId}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data); 
  });

  socket.on('update_message', (data) => {
    socket.to(data.room).emit('message_updated', data);
  });

  socket.on('typing', (room) => {
    socket.to(room).emit('display_typing'); 
  });

  socket.on('stop_typing', (room) => {
    socket.to(room).emit('hide_typing');    
  });

  socket.on('mark_as_read', async ({ room, readerId }) => {
    try {
      const HoloMsg = mongoose.models.HoloMessage;
      if (!HoloMsg) return;
      const result = await HoloMsg.updateMany(
        { room: room, senderId: { $ne: readerId } },
        { $set: { isRead: true } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✅ Marked ${result.modifiedCount} messages as read`);
      }
      socket.to(room).emit('messages_read');
    } catch (err) {
      console.error("❌ Error marking messages as read:", err);
    }
  });
  
  // 🚨 3. SMART OFFLINE DETECTION
  socket.on('disconnect', async () => {
    console.log('❌ User disconnected:', socket.id);
    
    const userId = activeSockets.get(socket.id);
    if (userId) {
      activeSockets.delete(socket.id); // Remove this specific tab
      
      const currentCount = userConnectionCounts.get(userId) || 0;

      if (currentCount <= 1) {
        // This was their LAST tab. They are truly offline now.
        userConnectionCounts.delete(userId);
        const User = mongoose.models.User;
        if (User) await User.findByIdAndUpdate(userId, { isOnline: false });
      } else {
        // They just closed a tab, or refreshed, but still have the app open! Stay online!
        userConnectionCounts.set(userId, currentCount - 1);
      }
    }
  });
});
// --- 4. Route Connections ---
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// --- 5. Database Connection & Server Start ---
const PORT = process.env.PORT || 10000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} with Private Live Chat!`);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });