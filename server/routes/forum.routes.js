const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPostById, addReply, votePost, voteReply, editPost, deletePost, editReply, deleteReply } = require('../controllers/forum.controller');
const { protect, optionalProtect } = require('../middleware/auth.middleware');
const upload = require('../config/multer');

router.post('/', protect, upload.single('image'), createPost);
router.get('/', optionalProtect, getPosts);
router.get('/:id', optionalProtect, getPostById);
router.put('/:id', protect, editPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/replies', protect, upload.single('image'), addReply);
router.put('/replies/:id', protect, editReply);
router.delete('/replies/:id', protect, deleteReply);
router.post('/:id/vote', protect, votePost);
router.post('/replies/:id/vote', protect, voteReply);

module.exports = router;
