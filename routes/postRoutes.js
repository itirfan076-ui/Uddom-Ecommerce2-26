const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware'); // আপনার মিডলওয়্যার

router.post('/:postId/react', authMiddleware, postController.handleReaction);

module.exports = router;