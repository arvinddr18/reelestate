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

io.on('connection', (socket) => {
  console.log('⚡ User connected to chat:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined private room: ${roomId}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data); 
  });

  // 👇 1. ADD THIS NEW BLOCK RIGHT HERE 👇
  socket.on('update_message', (data) => {
    // This catches the Smart Delete / Edit and bounces it to the other person!
    socket.to(data.room).emit('message_updated', data);
  });

 // ─── NEW: TYPING INDICATOR RADAR ───
  socket.on('typing', (room) => {
    socket.to(room).emit('display_typing'); // 🚨 Changed data.room to just room
  });

  socket.on('stop_typing', (room) => {
    socket.to(room).emit('hide_typing');    // 🚨 Changed data.room to just room
  });

  // 🌟 REAL-TIME READ RECEIPTS 🌟
    socket.on('mark_as_read', async ({ room, readerId }) => {
      try {
        // 1. Find all messages in this room that were NOT sent by the reader, and are unread
        // (Assuming you are using MongoDB/Mongoose)
        await Message.updateMany(
          { room: room, senderId: { $ne: readerId }, isRead: { $ne: true } },
          { $set: { isRead: true } }
        );

        // 2. Tell everyone else in the room (the sender) to turn their ticks Cyan!
        socket.to(room).emit('messages_read');
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
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