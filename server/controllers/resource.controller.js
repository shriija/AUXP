const Resource = require('../models/Resource');
const User = require('../models/User');
const { awardXP, checkAchievements } = require('../utils/gamification');

const createResource = async (req, res) => {
    try {
        const { title, category, year, subject, topic, tags } = req.body;
        
        // Multer puts the file in req.file, and we serve it from /uploads/ or Cloudinary path
        const fileUrl = req.file ? (req.file.path && req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`) : null;

        // Parse comma-separated tags if string
        let parsedTags = [];
        if (tags) {
            parsedTags = typeof tags === 'string'
                ? tags.split(',').map(t => t.trim()).filter(Boolean)
                : tags;
        }

        const resource = await Resource.create({
            title,
            category: category || 'Resources',
            year,
            subject,
            topic,
            fileUrl,
            tags: parsedTags,
            uploadedBy: req.user._id
        });

        // Gamification XP will be awarded only after admin approval in the admin controller.
        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create resource', error: error.message });
    }
};

const getResources = async (req, res) => {
    try {
        const { category, year, search, subject, topic, uploadedBy, includeDeleted } = req.query;
        let query = {};

        if (category) query.category = category;
        if (year) query.year = year;
        if (subject) query.subject = new RegExp(subject, 'i');
        if (topic) query.topic = new RegExp(topic, 'i');
        if (uploadedBy) query.uploadedBy = uploadedBy;
        
        if (includeDeleted === 'true') {
            // Include both active and deleted
        } else {
            query.isDeleted = { $ne: true };
        }

        if (search) {
            const matchingUsers = await User.find({ name: new RegExp(search, 'i') }, '_id');
            const userIds = matchingUsers.map(u => u._id);

            query.$or = [
                { title: new RegExp(search, 'i') },
                { tags: new RegExp(search, 'i') },
                { subject: new RegExp(search, 'i') },
                { topic: new RegExp(search, 'i') },
                { category: new RegExp(search, 'i') },
                { year: new RegExp(search, 'i') },
                { uploadedBy: { $in: userIds } }
            ];
        }

        // Apply approval status filtering
        if (req.user) {
            if (req.user.role !== 'admin') {
                const approvalCondition = {
                    $or: [
                        { approvalStatus: 'approved' },
                        { uploadedBy: req.user._id }
                    ]
                };
                if (query.$or) {
                    query.$and = [
                        { $or: query.$or },
                        approvalCondition
                    ];
                    delete query.$or;
                } else {
                    query.$or = approvalCondition.$or;
                }
            }
        } else {
            query.approvalStatus = 'approved';
        }

        // Populating the uploader details to render in the frontend UI
        const resources = await Resource.find(query)
            .populate('uploadedBy', 'name xp level badges');

        // Calculate score and map resources
        const resourcesWithScore = resources.map(resource => {
            const upvotes = resource.upvotes || 0;
            const downloads = resource.downloadedBy ? resource.downloadedBy.length : 0;
            const bookmarks = resource.bookmarkedBy ? resource.bookmarkedBy.length : 0;
            const score = (upvotes * 3) + downloads + bookmarks;
            return {
                ...resource.toObject(),
                downloadsCount: downloads,
                bookmarksCount: bookmarks,
                score
            };
        });

        // Sort descending by score, then by createdAt descending
        resourcesWithScore.sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);

        res.json(resourcesWithScore);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch resources', error: error.message });
    }
};

const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'name xp level badges');
        
        if (resource) {
            // If resource is not approved, only the uploader or admin can view it
            if (resource.approvalStatus !== 'approved') {
                if (!req.user || (req.user.role !== 'admin' && resource.uploadedBy._id.toString() !== req.user._id.toString())) {
                    return res.status(403).json({ message: 'Resource is pending approval' });
                }
            }
            res.json(resource);
        } else {
            res.status(404).json({ message: 'Resource not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch resource', error: error.message });
    }
};

const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        
        // Authorization check
        if (resource.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this resource' });
        }
        
        resource.isDeleted = true;
        await resource.save();
        
        // Gamification: Deduct 40 XP and re-check achievements only if it was approved
        if (resource.approvalStatus === 'approved') {
            await awardXP(req.user._id, 'UPLOAD', -1);
            await checkAchievements(req.user._id, 'UPLOAD');
        }
        
        res.json({ message: 'Resource soft-deleted successfully', resource });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete resource', error: error.message });
    }
};

const restoreResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        
        // Authorization check
        if (resource.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to restore this resource' });
        }
        
        resource.isDeleted = false;
        await resource.save();
        
        // Gamification: Add 40 XP and check achievements only if it was approved
        if (resource.approvalStatus === 'approved') {
            await awardXP(req.user._id, 'UPLOAD');
            await checkAchievements(req.user._id, 'UPLOAD');
        }
        
        res.json({ message: 'Resource restored successfully', resource });
    } catch (error) {
        res.status(500).json({ message: 'Failed to restore resource', error: error.message });
    }
};

const updateResource = async (req, res) => {
    try {
        const { title, category, year, subject, topic, tags } = req.body;
        const resource = await Resource.findById(req.params.id);
        
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        
        // Authorization check
        if (resource.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to edit this resource' });
        }
        
        // Update fields
        resource.title = title || resource.title;
        resource.category = category || resource.category;
        resource.year = year || resource.year;
        resource.subject = subject || resource.subject;
        resource.topic = topic || resource.topic;
        
        if (tags !== undefined) {
            resource.tags = typeof tags === 'string'
                ? tags.split(',').map(t => t.trim()).filter(Boolean)
                : tags;
        }
        
        await resource.save();
        
        res.json({ message: 'Resource updated successfully', resource });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update resource', error: error.message });
    }
};

const downloadResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        
        // Add downloader to downloadedBy array if not already present
        if (req.user && !resource.downloadedBy.includes(req.user._id)) {
            resource.downloadedBy.push(req.user._id);
            await resource.save();
        }
        
        // If downloader is not the owner, award +2 XP to the owner!
        if (resource.uploadedBy.toString() !== req.user._id.toString()) {
            await awardXP(resource.uploadedBy, 'DOWNLOAD_RECEIVED');
        }
        
        const path = require('path');
        if (resource.fileUrl.startsWith('http')) {
            const axios = require('axios');
            const response = await axios({
                method: 'get',
                url: resource.fileUrl,
                responseType: 'stream'
            });
            res.setHeader('Content-Disposition', `attachment; filename="${resource.title}${path.extname(resource.fileUrl)}"`);
            response.data.pipe(res);
        } else {
            const filePath = path.join(__dirname, '..', resource.fileUrl);
            res.download(filePath, resource.title + path.extname(resource.fileUrl));
        }
    } catch (error) {
        res.status(500).json({ message: 'Download failed', error: error.message });
    }
};

const bookmarkResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const userId = req.user._id;
        const isBookmarked = resource.bookmarkedBy.includes(userId);

        if (isBookmarked) {
            resource.bookmarkedBy = resource.bookmarkedBy.filter(id => id.toString() !== userId.toString());
        } else {
            resource.bookmarkedBy.push(userId);
        }

        await resource.save();
        res.json({
            message: isBookmarked ? 'Resource unbookmarked' : 'Resource bookmarked',
            bookmarked: !isBookmarked,
            bookmarkedBy: resource.bookmarkedBy
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to bookmark resource', error: error.message });
    }
};

const previewResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        
        const path = require('path');
        if (resource.fileUrl.startsWith('http')) {
            const axios = require('axios');
            const response = await axios({
                method: 'get',
                url: resource.fileUrl,
                responseType: 'stream'
            });
            res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
            response.data.pipe(res);
        } else {
            const filePath = path.join(__dirname, '..', resource.fileUrl);
            res.sendFile(filePath);
        }
    } catch (error) {
        res.status(500).json({ message: 'Preview failed', error: error.message });
    }
};

module.exports = { createResource, getResources, getResourceById, deleteResource, restoreResource, updateResource, downloadResource, bookmarkResource, previewResource };
