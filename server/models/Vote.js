const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true
    },
    type: {
        type: String,
        enum: ['up', 'down'],
        required: true
    }
}, {
    timestamps: true
});

// Ensure a user can only vote once per resource
voteSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;
