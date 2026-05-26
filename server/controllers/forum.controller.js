const ForumPost = require('../models/ForumPost');
const ForumReply = require('../models/ForumReply');
const { awardXP, checkAchievements } = require('../utils/gamification');
const Notification = require('../models/Notification');

const createPost = async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        const post = await ForumPost.create({
            title,
            description,
            tags,
            author: req.user._id
        });
        
        // Gamification: Forum post (+10 XP)
        await awardXP(req.user._id, 'FORUM_POST');
        
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create post', error: error.message });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await ForumPost.find({ isDeleted: { $ne: true } })
            .populate('author', 'name level')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await ForumPost.findOne({ _id: req.params.id, isDeleted: { $ne: true } }).populate('author', 'name level');
        if (!post) return res.status(404).json({ message: 'Post not found or has been deleted' });
        
        const replies = await ForumReply.find({ post: req.params.id, isDeleted: { $ne: true } }).populate('author', 'name level').sort({ createdAt: 1 });
        res.json({ post, replies });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch post', error: error.message });
    }
};

const addReply = async (req, res) => {
    try {
        const { content } = req.body;
        const reply = await ForumReply.create({
            post: req.params.id,
            content,
            author: req.user._id
        });
        
        // Gamification: Forum reply (+5 XP) and check achievements
        await awardXP(req.user._id, 'FORUM_REPLY');
        await checkAchievements(req.user._id, 'REPLY');

        // Create Notification
        const postObj = await ForumPost.findById(req.params.id);
        if (postObj && postObj.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: postObj.author,
                sender: req.user._id,
                type: 'FORUM_REPLY',
                relatedItem: postObj._id,
                message: `${req.user.name} replied to your post "${postObj.title}"`
            });
        }
        
        res.status(201).json(reply);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add reply', error: error.message });
    }
};

const votePost = async (req, res) => {
    try {
        const { type } = req.body; // 'up' or 'down'
        const userId = req.user._id;
        
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        const existingVoteIndex = post.voters.findIndex(v => v.user.toString() === userId.toString());
        
        if (existingVoteIndex !== -1) {
            const existingVote = post.voters[existingVoteIndex];
            if (existingVote.type === type) {
                // Toggle off existing vote
                post.voters.splice(existingVoteIndex, 1);
                if (type === 'up') post.upvotes = Math.max(0, post.upvotes - 1);
                if (type === 'down') post.downvotes = Math.max(0, post.downvotes - 1);
            } else {
                // Change vote
                existingVote.type = type;
                if (type === 'up') {
                    post.upvotes += 1;
                    post.downvotes = Math.max(0, post.downvotes - 1);
                } else {
                    post.downvotes += 1;
                    post.upvotes = Math.max(0, post.upvotes - 1);
                }
            }
        } else {
            // New vote
            post.voters.push({ user: userId, type });
            if (type === 'up') post.upvotes += 1;
            if (type === 'down') post.downvotes += 1;
        }
        
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Failed to vote', error: error.message });
    }
};

const voteReply = async (req, res) => {
    try {
        const { type } = req.body; // 'up' or 'down'
        const userId = req.user._id;
        
        const reply = await ForumReply.findById(req.params.id);
        if (!reply) return res.status(404).json({ message: 'Reply not found' });
        
        const replyAuthor = reply.author;
        const existingVoteIndex = reply.voters.findIndex(v => v.user.toString() === userId.toString());
        
        if (existingVoteIndex !== -1) {
            const existingVote = reply.voters[existingVoteIndex];
            if (existingVote.type === type) {
                reply.voters.splice(existingVoteIndex, 1);
                if (type === 'up') {
                    reply.upvotes = Math.max(0, reply.upvotes - 1);
                    // Retracted reply upvote, deduct -3 XP
                    await awardXP(replyAuthor, 'REPLY_UPVOTE_RECEIVED', -1);
                } else if (type === 'down') {
                    reply.downvotes = Math.max(0, reply.downvotes - 1);
                }
            } else {
                existingVote.type = type;
                if (type === 'up') {
                    reply.upvotes += 1;
                    reply.downvotes = Math.max(0, reply.downvotes - 1);
                    // Switched from Down to Up, award +3 XP
                    await awardXP(replyAuthor, 'REPLY_UPVOTE_RECEIVED', 1);
                } else {
                    reply.downvotes += 1;
                    reply.upvotes = Math.max(0, reply.upvotes - 1);
                    // Switched from Up to Down, deduct -3 XP
                    await awardXP(replyAuthor, 'REPLY_UPVOTE_RECEIVED', -1);
                }
            }
        } else {
            reply.voters.push({ user: userId, type });
            if (type === 'up') {
                reply.upvotes += 1;
                // Fresh upvote, award +3 XP
                await awardXP(replyAuthor, 'REPLY_UPVOTE_RECEIVED', 1);
            } else if (type === 'down') {
                reply.downvotes += 1;
            }
        }
        
        await reply.save();
        res.json(reply);
    } catch (error) {
        res.status(500).json({ message: 'Failed to vote', error: error.message });
    }
};

const deleteReply = async (req, res) => {
    try {
        const reply = await ForumReply.findById(req.params.id);
        if (!reply) return res.status(404).json({ message: 'Reply not found' });
        if (reply.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

        reply.isDeleted = true;
        await reply.save();
        res.json({ message: 'Reply deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete reply', error: error.message });
    }
};

const editPost = async (req, res) => {
    try {
        const { title, description } = req.body;
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

        post.title = title || post.title;
        post.description = description || post.description;
        post.isEdited = true;
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Failed to edit post', error: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

        post.isDeleted = true;
        await post.save();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete post', error: error.message });
    }
};

const editReply = async (req, res) => {
    try {
        const { content } = req.body;
        const reply = await ForumReply.findById(req.params.id);
        if (!reply) return res.status(404).json({ message: 'Reply not found' });
        if (reply.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

        reply.content = content || reply.content;
        reply.isEdited = true;
        await reply.save();
        res.json(reply);
    } catch (error) {
        res.status(500).json({ message: 'Failed to edit reply', error: error.message });
    }
};

module.exports = { createPost, getPosts, getPostById, addReply, votePost, voteReply, editPost, deletePost, editReply, deleteReply };
