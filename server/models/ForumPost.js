const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String
    }],
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    voters: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: ['up', 'down'] }
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    rejectionCount: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const ForumPost = mongoose.model('ForumPost', forumPostSchema);
module.exports = ForumPost;
