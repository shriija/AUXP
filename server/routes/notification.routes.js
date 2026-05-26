const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getNotifications,
    markAllRead,
    markRead,
    deleteNotification,
    clearAll
} = require('../controllers/notification.controller');

router.use(protect);

router.route('/')
    .get(getNotifications)
    .delete(clearAll);

router.put('/read', markAllRead);

router.route('/:id')
    .delete(deleteNotification);

router.put('/:id/read', markRead);

module.exports = router;
