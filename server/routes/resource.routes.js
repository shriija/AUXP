const express = require('express');
const router = express.Router();
const { createResource, getResources, getResourceById, deleteResource, restoreResource, updateResource, downloadResource, bookmarkResource, previewResource } = require('../controllers/resource.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../config/multer');

router.route('/')
    .get(getResources)
    .post(protect, upload.single('file'), createResource);

router.route('/:id')
    .get(getResourceById)
    .delete(protect, deleteResource)
    .put(protect, updateResource);

router.route('/:id/restore')
    .post(protect, restoreResource);

router.route('/:id/download')
    .get(protect, downloadResource);

router.route('/:id/bookmark')
    .post(protect, bookmarkResource);

router.route('/:id/preview')
    .get(protect, previewResource);

module.exports = router;
