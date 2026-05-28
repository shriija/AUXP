const Resource = require('../models/Resource');
const ForumPost = require('../models/ForumPost');
const ForumReply = require('../models/ForumReply');
const Classroom = require('../models/Classroom');
const Notification = require('../models/Notification');
const { awardXP, checkAchievements } = require('../utils/gamification');

const getPendingItems = async (req, res) => {
    try {
        const resources = await Resource.find({ approvalStatus: 'pending', isDeleted: { $ne: true } })
            .populate('uploadedBy', 'name email');
        
        const posts = await ForumPost.find({ approvalStatus: 'pending', isDeleted: { $ne: true } })
            .populate('author', 'name email');
            
        const replies = await ForumReply.find({ approvalStatus: 'pending', isDeleted: { $ne: true } })
            .populate('author', 'name email')
            .populate({
                path: 'post',
                select: 'title author',
                populate: { path: 'author', select: 'name' }
            });
            
        const classrooms = await Classroom.find({ approvalStatus: 'pending', isDeleted: { $ne: true } })
            .populate('creator', 'name email');
            
        res.json({
            resources,
            posts,
            replies,
            classrooms
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending items', error: error.message });
    }
};

const approveItem = async (req, res) => {
    try {
        const { itemId, itemType } = req.body;
        let item;
        let ownerId;
        let title = '';
        let message = '';

        if (itemType === 'resource') {
            item = await Resource.findById(itemId);
            if (!item) return res.status(404).json({ message: 'Resource not found' });
            item.approvalStatus = 'approved';
            item.rejectionCount = 0;
            await item.save();
            ownerId = item.uploadedBy;
            title = item.title;

            // Gamification: Add 40 XP and check achievements
            await awardXP(ownerId, 'UPLOAD');
            await checkAchievements(ownerId, 'UPLOAD');
            
            message = `Your Vault notes upload "${title}" has been approved! +40 XP awarded.`;

        } else if (itemType === 'post') {
            item = await ForumPost.findById(itemId);
            if (!item) return res.status(404).json({ message: 'Post not found' });
            item.approvalStatus = 'approved';
            item.rejectionCount = 0;
            await item.save();
            ownerId = item.author;
            title = item.title;

            // Gamification: Forum post (+10 XP)
            await awardXP(ownerId, 'FORUM_POST');
            
            message = `Your forum post "${title}" has been approved! +10 XP awarded.`;

        } else if (itemType === 'reply') {
            item = await ForumReply.findById(itemId);
            if (!item) return res.status(404).json({ message: 'Reply not found' });
            item.approvalStatus = 'approved';
            await item.save();
            ownerId = item.author;

            // Gamification: Forum reply (+5 XP) and check achievements
            await awardXP(ownerId, 'FORUM_REPLY');
            await checkAchievements(ownerId, 'REPLY');

            message = `Your forum reply has been approved! +5 XP awarded.`;

            // Trigger notification to the post author that someone replied
            const postObj = await ForumPost.findById(item.post);
            if (postObj && postObj.author.toString() !== ownerId.toString()) {
                await Notification.create({
                    recipient: postObj.author,
                    sender: ownerId,
                    type: 'FORUM_REPLY',
                    relatedItem: postObj._id,
                    message: `${req.user.name} replied to your post "${postObj.title}"`
                });
            }

        } else if (itemType === 'classroom') {
            item = await Classroom.findById(itemId);
            if (!item) return res.status(404).json({ message: 'Classroom not found' });
            item.approvalStatus = 'approved';
            await item.save();
            ownerId = item.creator;
            title = item.name;

            // Gamification: Classroom created (+20 XP)
            await awardXP(ownerId, 'CLASSROOM_CREATE');
            
            message = `Your classroom study room "${title}" has been approved! +20 XP awarded.`;
            
        } else {
            return res.status(400).json({ message: 'Invalid item type' });
        }

        // Create APPROVAL_STATUS notification for the owner
        await Notification.create({
            recipient: ownerId,
            sender: req.user._id,
            type: 'APPROVAL_STATUS',
            relatedItem: itemId,
            message
        });

        res.json({ message: `${itemType} approved successfully`, item });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve item', error: error.message });
    }
};

const rejectItem = async (req, res) => {
    try {
        const { itemId, itemType, rejectionReason } = req.body;
        if (!rejectionReason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        let item;
        let ownerId;
        let title = '';
        let message = '';
        let wasDeletedPermanently = false;

        if (itemType === 'resource') {
            item = await Resource.findById(itemId);
            if (!item) return res.status(404).json({ message: 'Resource not found' });
            ownerId = item.uploadedBy;
            title = item.title;

            const count = (item.rejectionCount || 0) + 1;
            if (count >= 2) {
                await Resource.findByIdAndDelete(itemId);
                message = `Your Vault notes upload "${title}" was rejected for the second time and has been permanently deleted. Reason: ${rejectionReason}`;
                wasDeletedPermanently = true;
            } else {
                item.approvalStatus = 'rejected';
                item.rejectionReason = rejectionReason;
                item.rejectionCount = count;
                await item.save();
                message = `Your Vault notes upload "${title}" was rejected. Reason: ${rejectionReason}`;
            }

        } else if (itemType === 'post') {
            item = await ForumPost.findById(itemId);
            if (!item) return res.status(404).json({ message: 'Post not found' });
            ownerId = item.author;
            title = item.title;

            const count = (item.rejectionCount || 0) + 1;
            if (count >= 2) {
                await ForumPost.findByIdAndDelete(itemId);
                message = `Your forum post "${title}" was rejected for the second time and has been permanently deleted. Reason: ${rejectionReason}`;
                wasDeletedPermanently = true;
            } else {
                item.approvalStatus = 'rejected';
                item.rejectionReason = rejectionReason;
                item.rejectionCount = count;
                await item.save();
                message = `Your forum post "${title}" was rejected. Reason: ${rejectionReason}`;
            }

        } else if (itemType === 'reply') {
            item = await ForumReply.findById(itemId);
            if (!item) return res.status(404).json({ message: 'Reply not found' });
            item.approvalStatus = 'rejected';
            item.rejectionReason = rejectionReason;
            await item.save();
            ownerId = item.author;
            message = `Your forum reply was rejected. Reason: ${rejectionReason}`;

        } else if (itemType === 'classroom') {
            item = await Classroom.findById(itemId);
            if (!item) return res.status(404).json({ message: 'Classroom not found' });
            item.approvalStatus = 'rejected';
            item.rejectionReason = rejectionReason;
            item.isDeleted = true;
            await item.save();
            ownerId = item.creator;
            title = item.name;
            message = `Your classroom study room "${title}" was rejected and has been removed. Reason: ${rejectionReason}`;
            
        } else {
            return res.status(400).json({ message: 'Invalid item type' });
        }

        // Create APPROVAL_STATUS notification for the owner
        await Notification.create({
            recipient: ownerId,
            sender: req.user._id,
            type: 'APPROVAL_STATUS',
            relatedItem: itemId,
            message
        });

        res.json({ message: `${itemType} rejected successfully`, item: wasDeletedPermanently ? null : item, wasDeletedPermanently });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject item', error: error.message });
    }
};

module.exports = { getPendingItems, approveItem, rejectItem };
