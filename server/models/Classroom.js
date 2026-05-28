const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    code: {
        type: String
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    chatMessages: [{
        sender: String,
        text: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    whiteboardPaths: [{
        type: mongoose.Schema.Types.Mixed
    }],
    snapshots: [{
        dataUrl: String,
        createdBy: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    tasks: [{
        title: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    }],
    sessionTitle: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    sessionStatus: {
        type: String,
        enum: ['scheduled', 'active', 'ended'],
        default: 'scheduled'
    },
    endedAt: {
        type: Date
    },
    pomodoroEnabled: {
        type: Boolean,
        default: false
    },
    boardElements: [{
        type: mongoose.Schema.Types.Mixed
    }]
}, { timestamps: true });

const Classroom = mongoose.model('Classroom', classroomSchema);
module.exports = Classroom;
