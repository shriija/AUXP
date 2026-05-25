const express = require('express');
const router = express.Router();
const { getLeaderboards } = require('../controllers/leaderboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getLeaderboards);

module.exports = router;
