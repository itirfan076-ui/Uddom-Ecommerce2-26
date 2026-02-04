const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'freelancer'], default: 'buyer' },
  
  // --- প্রোফাইল এক্সট্রা ফিল্ডস ---
  bio: { type: String, default: "Building the future" },
  aboutMe: { type: String, default: "" },
  work: { type: String, default: "" },
  education: { type: String, default: "" },
  location: { type: String, default: "" },
  profilePic: { type: String, default: "" }, 
  coverPic: { type: String, default: "" },

  // --- ফ্রেন্ড/নেটওয়ার্ক সিস্টেম লজিক (New) ---
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // সফল ফ্রেন্ডস
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // যারা রিকোয়েস্ট পাঠিয়েছে
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // যাদেরকে আমি রিকোয়েস্ট পাঠিয়েছি
  
  // --- সোশ্যাল স্ট্যাটস (New) ---
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // সেভ করা পোস্ট
  notificationsCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false }, // ব্লু টিক বা ভেরিফায়েড ব্যাজ
  
  // --- সিকিউরিটি ও টাইমস্ট্যাম্প ---
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);