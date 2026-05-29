const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser, updateUserProfile, googleLogin } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getCurrentUser);
router.put('/update', protect, updateUserProfile);

module.exports = router;

