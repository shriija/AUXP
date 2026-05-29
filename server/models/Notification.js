const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['FORUM_REPLY', 'RESOURCE_UPVOTE', 'CLASSROOM_JOIN', 'APPROVAL_STATUS', 'CONCERN_RAISED'],
        required: true
    },
    relatedItem: {
        type: mongoose.Schema.Types.ObjectId, // can be ForumPost ID, Resource ID, or Classroom ID
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
