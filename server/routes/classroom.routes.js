const express = require('express');
const router = express.Router();
const { createClassroom, getClassrooms, getClassroomById, joinClassroom } = require('../controllers/classroom.controller');
const { protect, optionalProtect } = require('../middleware/auth.middleware');

router.post('/', protect, createClassroom);
router.get('/', optionalProtect, getClassrooms);
router.get('/:id', optionalProtect, getClassroomById);
router.post('/:id/join', protect, joinClassroom);

module.exports = router;
