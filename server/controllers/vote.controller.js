const Vote = require('../models/Vote');
const Resource = require('../models/Resource');
const { awardXP } = require('../utils/gamification');

const toggleVote = async (req, res) => {
    const { resourceId, type } = req.body; // type: 'up' or 'down'

    try {
        const resource = await Resource.findById(resourceId);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        const uploaderId = resource.uploadedBy;

        const existingVote = await Vote.findOne({ userId: req.user._id, resourceId });

        if (existingVote) {
            if (existingVote.type === type) {
                // If the user clicks the same vote again, remove it (neutralize)
                await existingVote.deleteOne();
                await Resource.findByIdAndUpdate(resourceId, { $inc: { [`${type}votes`]: -1 } });
                
                if (type === 'up') {
                    // Retracted upvote, deduct -5 XP
                    await awardXP(uploaderId, 'UPVOTE_RECEIVED', -1);
                }
                
                return res.json({ message: 'Vote removed' });
            } else {
                // Switch vote (Up -> Down or Down -> Up)
                await existingVote.updateOne({ type });
                const incObj = type === 'up' ? { upvotes: 1, downvotes: -1 } : { upvotes: -1, downvotes: 1 };
                await Resource.findByIdAndUpdate(resourceId, { $inc: incObj });
                
                if (type === 'up') {
                    // Switched from Down to Up, award +5 XP
                    await awardXP(uploaderId, 'UPVOTE_RECEIVED', 1);
                } else {
                    // Switched from Up to Down, deduct -5 XP
                    await awardXP(uploaderId, 'UPVOTE_RECEIVED', -1);
                }
                
                return res.json({ message: `Vote switched to ${type}` });
            }
        }

        // New fresh vote
        await Vote.create({ userId: req.user._id, resourceId, type });
        await Resource.findByIdAndUpdate(resourceId, { $inc: { [`${type}votes`]: 1 } });
        
        if (type === 'up') {
            // Fresh upvote, award +5 XP
            await awardXP(uploaderId, 'UPVOTE_RECEIVED', 1);
        }
        
        res.status(201).json({ message: `Voted ${type}` });

    } catch (error) {
        res.status(500).json({ message: 'Voting failed', error: error.message });
    }
};

module.exports = { toggleVote };
