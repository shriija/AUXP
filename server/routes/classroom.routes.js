const express = require('express');
const router = express.Router();
const { createClassroom, getClassrooms, getClassroomById, joinClassroom } = require('../controllers/classroom.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createClassroom);
router.get('/', getClassrooms);
router.get('/:id', getClassroomById);
router.post('/:id/join', protect, joinClassroom);

module.exports = router;
