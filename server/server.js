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

  // 🚨 2. SMART ONLINE DETECTION & BROADCASTING
  socket.on('iam_online', async (userId) => {
    if (!userId) return;
    const idString = String(userId); // Bulletproof string conversion so Maps don't break!

    activeSockets.set(socket.id, idString);
    
    const currentCount = userConnectionCounts.get(idString) || 0;
    userConnectionCounts.set(idString, currentCount + 1);

    if (currentCount === 0) {
      const User = mongoose.models.User;
      if (User) await User.findByIdAndUpdate(idString, { isOnline: true });
      
      // 🚨 THE FIX: Shout to EVERYONE in the app that this user is now online!
      io.emit('user_status_change', { userId: idString, isOnline: true });
    }
  });

  /* ... (Keep your join_room, send_message, typing events here) ... */
  
  // 🚨 3. SMART OFFLINE DETECTION & BROADCASTING
  socket.on('disconnect', async () => {
    console.log('❌ User disconnected:', socket.id);
    
    const idString = activeSockets.get(socket.id);
    if (idString) {
      activeSockets.delete(socket.id); 
      
      const currentCount = userConnectionCounts.get(idString) || 0;

      if (currentCount <= 1) {
        userConnectionCounts.delete(idString);
        const User = mongoose.models.User;
        if (User) await User.findByIdAndUpdate(idString, { isOnline: false });
        
        // 🚨 THE FIX: Shout to EVERYONE that this user left!
        io.emit('user_status_change', { userId: idString, isOnline: false });
      } else {
        userConnectionCounts.set(idString, currentCount - 1);
      }
    }
  })
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