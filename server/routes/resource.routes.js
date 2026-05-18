const express = require('express');
const router = express.Router();
const { createResource, getResources, getResourceById } = require('../controllers/resource.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../config/multer');

router.route('/')
    .get(getResources)
    .post(protect, upload.single('file'), createResource);

router.route('/:id')
    .get(getResourceById);

module.exports = router;
