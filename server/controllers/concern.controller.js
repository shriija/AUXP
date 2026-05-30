const Concern = require('../models/Concern');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Raise a new concern
// @route   POST /api/concerns
// @access  Private
const createConcern = async (req, res) => {
    try {
        const { concernType, text, contentType, contentId } = req.body;

        if (!concernType || !text) {
            return res.status(400).json({ message: 'Concern type and text are required.' });
        }

        const validTypes = ['FORUM_ABUSE', 'NOTES_SPAM', 'ROOM_TOXICITY', 'TECH_BUG', 'CUSTOM', 'ADMIN_APPEAL'];
        if (!validTypes.includes(concernType)) {
            return res.status(400).json({ message: 'Invalid concern type.' });
        }

        const concern = await Concern.create({
            sender: req.user._id,
            concernType,
            text,
            contentType,
            contentId
        });

        // Find all admin users to notify them
        const admins = await User.find({ role: 'admin' });
        
        // Map concernType to readable format for the notification
        const readableType = concernType.split('_').join(' ');

        const notificationPromises = admins.map(admin => {
            return Notification.create({
                recipient: admin._id,
                sender: req.user._id,
                type: 'CONCERN_RAISED',
                relatedItem: concern._id,
                message: `⚠️ New concern raised by ${req.user.name}: [${readableType}]`
            });
        });

        await Promise.all(notificationPromises);

        res.status(201).json({
            success: true,
            message: 'Concern raised successfully.',
            concern
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to raise concern.', error: error.message });
    }
};

// @desc    Get all concerns
// @route   GET /api/concerns
// @access  Private/Admin
const getConcerns = async (req, res) => {
    try {
        const concerns = await Concern.find({})
            .populate('sender', 'name email xp level department')
            .sort({ status: 1, createdAt: -1 }); // pending first, then newest

        res.json({
            success: true,
            concerns
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch concerns.', error: error.message });
    }
};

// @desc    Mark a concern as resolved
// @route   PUT /api/concerns/:id/resolve
// @access  Private/Admin
const resolveConcern = async (req, res) => {
    try {
        const concern = await Concern.findById(req.params.id);

        if (!concern) {
            return res.status(404).json({ message: 'Concern not found.' });
        }

        concern.status = 'resolved';
        await concern.save();

        res.json({
            success: true,
            message: 'Concern marked as resolved.',
            concern
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to resolve concern.', error: error.message });
    }
};

module.exports = {
    createConcern,
    getConcerns,
    resolveConcern
};
