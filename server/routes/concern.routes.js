const express = require('express');
const router = express.Router();
const { createConcern, getConcerns, resolveConcern } = require('../controllers/concern.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Publicly accessible concern raising for authenticated users
router.post('/', protect, createConcern);

// Admin-only endpoints to manage concerns
router.get('/', protect, admin, getConcerns);
router.put('/:id/resolve', protect, admin, resolveConcern);

module.exports = router;
