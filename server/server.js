const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- Import Routes ---
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// --- 1. GLOBAL MIDDLEWARE (ORDER IS CRITICAL HERE) ---
// We allow 50MB BEFORE any routes are processed
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure CORS for Vercel and Localhost
app.use(cors({
  origin: ["https://reelestate-beta.vercel.app", "http://localhost:5173"],
  credentials: true
}));

// --- 2. SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: ["https://reelestate-beta.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected'));
});

// --- 3. ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// --- 4. DATABASE & SERVER START ---
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Stop if DB fails
  });