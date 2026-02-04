const Post = require('../models/Post');
const User = require('../models/User');

exports.handleReaction = async (req, res) => {
  const { postId } = req.params;
  const { type } = req.body; // 'like', 'haha', 'clap', 'dislike', 'egg'
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // চেক করা ইউজার আগে থেকেই এই রিয়েক্ট দিয়েছে কি না
    const alreadyHasThisReact = post.reactions[type].includes(userId);

    // সব ক্যাটাগরি থেকে ইউজারের আইডি রিমুভ করা (যাতে এক পোস্টে একটাই রিয়েক্ট থাকে)
    Object.keys(post.reactions).forEach(key => {
      post.reactions[key] = post.reactions[key].filter(id => id.toString() !== userId);
    });

    // যদি আগে এই রিয়েক্ট না থেকে থাকে, তবে নতুন করে এড করা (Toggle Logic)
    if (!alreadyHasThisReact) {
      post.reactions[type].push(userId);
    }

    await post.save();

    // ডিম মারলে রিয়েল-টাইম এনিমেশন ইভেন্ট পাঠানো
    if (type === 'egg' && !alreadyHasThisReact) {
      const io = req.app.get('socketio');
      const sender = await User.findById(userId).select('fullName');
      
      // পোস্টের মালিকের রুমে ইভেন্ট পাঠানো
      io.to(post.user.toString()).emit('egg_splat_received', {
        senderName: sender.fullName
      });
    }

    res.json({ reactions: post.reactions });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};