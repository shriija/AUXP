const mongoose = require('mongoose');

const concernSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    concernType: {
        type: String,
        enum: ['FORUM_ABUSE', 'NOTES_SPAM', 'ROOM_TOXICITY', 'TECH_BUG', 'CUSTOM', 'ADMIN_APPEAL'],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending'
    },
    contentType: {
        type: String,
        enum: ['resource', 'post', 'reply', 'classroom']
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId
    }
}, { timestamps: true });

module.exports = mongoose.model('Concern', concernSchema);
