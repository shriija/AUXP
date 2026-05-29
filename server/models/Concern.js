const mongoose = require('mongoose');

const concernSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    concernType: {
        type: String,
        enum: ['FORUM_ABUSE', 'NOTES_SPAM', 'ROOM_TOXICITY', 'TECH_BUG', 'CUSTOM'],
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
    }
}, { timestamps: true });

module.exports = mongoose.model('Concern', concernSchema);
