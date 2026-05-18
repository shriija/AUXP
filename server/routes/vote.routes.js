const express = require('express');
const router = express.Router();
const { toggleVote } = require('../controllers/vote.controller');
const { protect } = require('../middleware/auth.middleware');

// Create or toggle an upvote/downvote for a resource
router.post('/', protect, toggleVote);

module.exports = router;
