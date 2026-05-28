const express = require('express');
const router = express.Router();
const { getPendingItems, approveItem, rejectItem } = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.use(protect);
router.use(admin);

router.get('/pending', getPendingItems);
router.post('/approve', approveItem);
router.post('/reject', rejectItem);

module.exports = router;
