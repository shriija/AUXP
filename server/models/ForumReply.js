const mongoose = require('mongoose');

const forumReplySchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumPost',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    deletedByAdmin: {
        type: Boolean,
        default: false
    },
    deletionReason: {
        type: String,
        default: ''
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
    imageUrl: {
        type: String,
        default: ''
    },
    imageUrls: [{
        type: String
    }]
}, { timestamps: true });

const ForumReply = mongoose.model('ForumReply', forumReplySchema);
module.exports = ForumReply;
