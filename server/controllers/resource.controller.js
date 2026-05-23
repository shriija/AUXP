const Resource = require('../models/Resource');
const User = require('../models/User');

const createResource = async (req, res) => {
    try {
        const { title, category, year, subject, topic, tags } = req.body;
        
        // Multer puts the file in req.file, and we serve it from /uploads/
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const resource = await Resource.create({
            title,
            category: category || 'Resources',
            year,
            subject,
            topic,
            fileUrl,
            tags,
            uploadedBy: req.user._id
        });

        // Gamification: Add 40 XP to user for uploading and recalculate level
        const user = await User.findById(req.user._id);
        if (user) {
            user.xp += 40;
            user.level = Math.floor(user.xp / 100) + 1;
            await user.save();
        }

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
            query.$or = [
                { title: new RegExp(search, 'i') },
                { tags: new RegExp(search, 'i') }
            ];
        }

        // Populating the uploader details to render in the frontend UI
        const resources = await Resource.find(query)
            .populate('uploadedBy', 'name xp level badges')
            .sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch resources', error: error.message });
    }
};

const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'name xp level badges');
        
        if (resource) {
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
        
        // Gamification: Deduct 40 XP and recalculate level
        const user = await User.findById(req.user._id);
        if (user) {
            user.xp = Math.max(0, user.xp - 40);
            user.level = Math.floor(user.xp / 100) + 1;
            await user.save();
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
        
        // Gamification: Add 40 XP and recalculate level
        const user = await User.findById(req.user._id);
        if (user) {
            user.xp += 40;
            user.level = Math.floor(user.xp / 100) + 1;
            await user.save();
        }
        
        res.json({ message: 'Resource restored successfully', resource });
    } catch (error) {
        res.status(500).json({ message: 'Failed to restore resource', error: error.message });
    }
};

module.exports = { createResource, getResources, getResourceById, deleteResource, restoreResource };
