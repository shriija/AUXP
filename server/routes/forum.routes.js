const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPostById, addReply, votePost, voteReply, editPost, deletePost, editReply, deleteReply } = require('../controllers/forum.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.put('/:id', protect, editPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/replies', protect, addReply);
router.put('/replies/:id', protect, editReply);
router.delete('/replies/:id', protect, deleteReply);
router.post('/:id/vote', protect, votePost);
router.post('/replies/:id/vote', protect, voteReply);

module.exports = router;
