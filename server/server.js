const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // NEW: Required for Socket.io
const { Server } = require('socket.io'); // NEW: Required for Socket.io
require('dotenv').config();

// --- 1. Import Routes ---
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

const app = express();

// --- NEW: Wrap Express in an HTTP server for the Chat Pipe ---
const server = http.createServer(app);

// --- 2. Security & Limits (MUST BE BEFORE ROUTES) ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: ["https://reelestate-beta.vercel.app", "http://localhost:5173"],
  credentials: true
}));

// --- 3. SOCKET.IO CHAT SETUP ---
const io = new Server(server, {
  cors: {
    origin: ["https://reelestate-beta.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('⚡ User connected to chat:', socket.id);

  // When a user sends a message...
  socket.on('send_message', (data) => {
    console.log("Message received on server:", data);
    // ...instantly broadcast it to everyone else!
    io.emit('receive_message', data); 
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
// Use Render's port or default to 10000
const PORT = process.env.PORT || 10000;

// 1. Open the port IMMEDIATELY with '0.0.0.0' so Render doesn't time out
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} with Live Chat!`);
});

// 2. Connect to Database independently
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });