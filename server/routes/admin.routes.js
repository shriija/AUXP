const express = require('express');
const router = express.Router();
const { getPendingItems, approveItem, rejectItem, adminDeleteContent, adminRevertContent } = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.use(protect);
router.use(admin);

router.get('/pending', getPendingItems);
router.post('/approve', approveItem);
router.post('/reject', rejectItem);
router.post('/delete-content', adminDeleteContent);
router.post('/revert-content', adminRevertContent);

module.exports = router;
