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
const paymentRoutes = require('./routes/paymentRoutes');
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


// 🚨 1. JUST ONE MAP NEEDED NOW
const activeSockets = new Map(); // Maps socket.id -> userId

io.on('connection', (socket) => {
  console.log('⚡ User connected to chat:', socket.id);

  // 🚨 2. BULLETPROOF ONLINE DETECTION
  socket.on('iam_online', async (userId) => {
    if (!userId) return;
    const idString = String(userId);
    activeSockets.set(socket.id, idString);

    // ALWAYS update database and shout to everyone, just to be safe!
    const User = mongoose.models.User;
    if (User) await User.findByIdAndUpdate(idString, { isOnline: true });
    io.emit('user_status_change', { userId: idString, isOnline: true });
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
      await HoloMsg.updateMany(
        { room: room, senderId: { $ne: readerId } },
        { $set: { isRead: true } }
      );
      socket.to(room).emit('messages_read');
    } catch (err) {
      console.error("❌ Error marking messages as read:", err);
    }
  });
  
  // 🚨 3. BULLETPROOF OFFLINE DETECTION
  socket.on('disconnect', async () => {
    console.log('❌ User disconnected:', socket.id);
    
    const idString = activeSockets.get(socket.id);
    if (idString) {
      activeSockets.delete(socket.id); 
      
      // Look at all remaining sockets. Does this user still have another tab open?
      let stillOnline = false;
      for (const uid of activeSockets.values()) {
        if (uid === idString) {
          stillOnline = true;
          break;
        }
      }

      // If they have NO tabs left open, truly mark them offline
      if (!stillOnline) {
        const User = mongoose.models.User;
        if (User) await User.findByIdAndUpdate(idString, { isOnline: false });
        io.emit('user_status_change', { userId: idString, isOnline: false });
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
app.use('/api/payments', paymentRoutes);

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