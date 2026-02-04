const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const postController = require('../controllers/postController'); // এই ইম্পোর্টটি নিশ্চিত করুন

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uddom_uploads',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'mov']
  },
});

const upload = multer({ storage: storage });

// 2. [UPDATE & AUTO-POST] প্রোফাইল/কভার ফটো আপডেট
router.put('/update-images', auth, upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'coverPic', maxCount: 1 }
]), async (req, res) => {
  try {
    const updates = {};
    let postText = "";
    let mediaUrl = "";

    if (req.files['profilePic']) {
      mediaUrl = req.files['profilePic'][0].path;
      updates.profilePic = mediaUrl;
      postText = "Updated profile picture";
    }
    
    if (req.files['coverPic']) {
      mediaUrl = req.files['coverPic'][0].path;
      updates.coverPic = mediaUrl;
      postText = "Updated cover photo";
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user, 
      { $set: updates }, 
      { new: true }
    ).select('-password');

    if (mediaUrl) {
      const newAutoPost = new Post({
        user: req.user,
        text: postText,
        mediaUrl: mediaUrl,
        mediaType: 'image'
      });
      await newAutoPost.save();
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: "Image update failed" });
  }
});

// 3. [LANDING PAGE FEED]
router.get('/feed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const followedIds = [...user.friends, req.user]; 
    const posts = await Post.find({ user: { $in: followedIds } })
      .populate('user', 'fullName profilePic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Feed fetch failed" });
  }
});

// 4. [CREATE POST] 
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const { text } = req.body;
    const newPost = new Post({
      user: req.user,
      text: text || "",
      mediaUrl: req.file ? req.file.path : "",
      mediaType: req.file && req.file.mimetype.startsWith('video') ? 'video' : 'image'
    });
    const post = await newPost.save();
    const populatedPost = await Post.findById(post._id).populate('user', 'fullName profilePic');
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// 5. [REACTION TOGGLE] <--- এটি নতুন যোগ করা হলো
router.post('/:postId/react', auth, postController.handleReaction);

// 6. [ALL POSTS] & [USER PROFILE POSTS]
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'fullName profilePic').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching posts" });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).populate('user', 'fullName profilePic').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching user posts" });
  }
});

module.exports = router;