require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// ১. HTTP Server তৈরি করা
const server = http.createServer(app);

// ২. Socket.io কনফিগারেশন (CORS ফিক্সড)
const io = new Server(server, {
  cors: {
    // আপনার ডোমেইন এবং লোকালহোস্ট উভয়ই এলাউ করা হয়েছে
    origin: ["https://uddomecommerce.com", "http://uddomecommerce.com"], 
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true // সকেট ভার্সন সামঞ্জস্যের জন্য
});

// ৩. কন্ট্রোলারে Socket.io এক্সেস করার জন্য সেটআপ
app.set('socketio', io);

// ৪. Middleware (CORS সেটিংস আপডেট করা হয়েছে)
app.use(cors({
  origin: ["https://uddomecommerce.com", "http://uddomecommerce.com"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Socket.io কানেকশন হ্যান্ডেলিং
io.on('connection', (socket) => {
  console.log('⚡ User Connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User Disconnected');
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// Root Route
app.get('/', (req, res) => {
  res.send("UDDOM API is running with Real-time Support... 🚀");
});

// ৫. পোর্ট সেটিংস
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});