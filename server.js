require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Socket.io এর জন্য প্রয়োজন
const { Server } = require('socket.io'); // Socket.io এর জন্য প্রয়োজন

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// ১. HTTP Server তৈরি করা (Socket.io সরাসরি express-এ চলে না)
const server = http.createServer(app);

// ২. Socket.io কনফিগারেশন
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // এই পোর্টটি আপনার Vite ফ্রন্টএন্ডের জন্য
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ৩. কন্ট্রোলারে Socket.io এক্সেস করার জন্য সেটআপ
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Socket.io কানেকশন হ্যান্ডেলিং
io.on('connection', (socket) => {
  console.log('⚡ User Connected:', socket.id);

  // ইউজার যখন লগইন করবে, সে তার ইউজার আইডি দিয়ে একটি রুমে জয়েন করবে
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`👤 User with ID: ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User Disconnected');
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

app.get('/', (req, res) => {
  res.send("UDDOM API is running with Real-time Support... 🚀");
});

const PORT = process.env.PORT || 5000;
// ৪. app.listen এর বদলে server.listen ব্যবহার করতে হবে
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));