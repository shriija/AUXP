require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const path = require('path');
const Classroom = require('./models/Classroom');

// Import routes
const authRoutes = require('./routes/auth.routes');
const resourceRoutes = require('./routes/resource.routes');
const voteRoutes = require('./routes/vote.routes');
const forumRoutes = require('./routes/forum.routes');
const classroomRoutes = require('./routes/classroom.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const concernRoutes = require('./routes/concern.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://auxp-chi.vercel.app"
        ],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://auxp-chi.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/concerns', concernRoutes);

app.get('/', (req, res) => {
    res.send('CSV API is running...');
});

// Socket.io for Real-time Whiteboard and Chat
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', (data) => {
        const roomId = typeof data === 'string' ? data : data?.roomId;
        const userId = typeof data === 'object' ? data?.userId : null;
        
        socket.join(roomId);
        socket.roomId = roomId;
        socket.userId = userId;
        socket.joinTime = new Date();
        
        console.log(`User ${userId || socket.id} joined room ${roomId}`);
    });

    socket.on('update-paths', async (data) => {
        socket.to(data.roomId).emit('update-paths', data.paths);
        try {
            await Classroom.findByIdAndUpdate(data.roomId, { whiteboardPaths: data.paths });
            if (data.userId) {
                const { checkAchievements } = require('./utils/gamification');
                await checkAchievements(data.userId, 'WHITEBOARD');
            }
        } catch (error) {
            console.error('Save paths error:', error);
        }
    });

    socket.on('clear-canvas', async (roomId) => {
        socket.to(roomId).emit('clear-canvas');
        try {
            await Classroom.findByIdAndUpdate(roomId, { whiteboardPaths: [], boardElements: [] });
        } catch (error) {
            console.error('Clear canvas error:', error);
        }
    });

    socket.on('add-element', async (data) => {
        try {
            await Classroom.findByIdAndUpdate(data.roomId, {
                $push: { boardElements: data.element }
            });
            socket.to(data.roomId).emit('element-added', data.element);
        } catch (err) {
            console.error('Add element error:', err);
        }
    });

    socket.on('update-element', async (data) => {
        try {
            const classroom = await Classroom.findById(data.roomId);
            if (classroom) {
                classroom.boardElements = classroom.boardElements.map(el => 
                    el.id === data.elementId ? { ...el, ...data.updates } : el
                );
                await classroom.save();
                socket.to(data.roomId).emit('element-updated', { elementId: data.elementId, ...data.updates });
            }
        } catch (err) {
            console.error('Update element error:', err);
        }
    });

    socket.on('delete-element', async (data) => {
        try {
            await Classroom.findByIdAndUpdate(data.roomId, {
                $pull: { boardElements: { id: data.elementId } }
            });
            socket.to(data.roomId).emit('element-deleted', { elementId: data.elementId });
        } catch (err) {
            console.error('Delete element error:', err);
        }
    });

    socket.on('chat-message', async (data) => {
        socket.to(data.roomId).emit('chat-message', data);
        try {
            await Classroom.findByIdAndUpdate(data.roomId, {
                $push: { chatMessages: { sender: data.sender, text: data.text } }
            });
        } catch (error) {
            console.error('Save chat error:', error);
        }
    });

    socket.on('cursor-move', (data) => {
        socket.to(data.roomId).emit('cursor-move', { socketId: socket.id, ...data });
    });

    socket.on('save-snapshot', async (data) => {
        const snapshot = { dataUrl: data.dataUrl, createdBy: data.createdBy, timestamp: new Date() };
        // Optionally emit the snapshot to other users right away, or they can refresh.
        // Emitting allows real-time gallery updates.
        socket.to(data.roomId).emit('new-snapshot', snapshot);
        try {
            await Classroom.findByIdAndUpdate(data.roomId, {
                $push: { snapshots: snapshot }
            });
            if (data.userId) {
                const { checkAchievements } = require('./utils/gamification');
                await checkAchievements(data.userId, 'WHITEBOARD');
            }
        } catch (error) {
            console.error('Save snapshot error:', error);
        }
    });

    socket.on('delete-snapshot', async (data) => {
        socket.to(data.roomId).emit('snapshot-deleted', data.timestamp);
        try {
            await Classroom.findByIdAndUpdate(data.roomId, {
                $pull: { snapshots: { timestamp: data.timestamp } }
            });
        } catch (error) {
            console.error('Delete snapshot error:', error);
        }
    });

    socket.on('update-tasks', async (data) => {
        socket.to(data.roomId).emit('update-tasks', data.tasks);
        try {
            await Classroom.findByIdAndUpdate(data.roomId, { tasks: data.tasks });
        } catch (error) {
            console.error('Update tasks error:', error);
        }
    });

    socket.on('start-session-manual', async (data) => {
        try {
            const room = await Classroom.findById(data.roomId);
            if (room && room.creator.toString() === data.userId) {
                room.sessionStatus = 'active';
                room.startTime = new Date();
                await room.save();
                io.to(data.roomId).emit('session-started', { startTime: room.startTime });
                console.log(`Session manually started for classroom: ${room.name}`);
            }
        } catch (error) {
            console.error('Start session manual error:', error);
        }
    });

    socket.on('change-start-time', async (data) => {
        try {
            const room = await Classroom.findById(data.roomId);
            if (room && room.creator.toString() === data.userId) {
                room.startTime = new Date(data.newStartTime);
                await room.save();
                io.to(data.roomId).emit('start-time-changed', { startTime: room.startTime });
                console.log(`Start time changed for classroom: ${room.name}`);
            }
        } catch (error) {
            console.error('Change start time error:', error);
        }
    });

    socket.on('end-session-manual', async (data) => {
        try {
            const room = await Classroom.findById(data.roomId);
            if (room && room.creator.toString() === data.userId) {
                room.sessionStatus = 'ended';
                room.endedAt = new Date();
                await room.save();
                io.to(data.roomId).emit('session-ended', { endedAt: room.endedAt });
                console.log(`Session manually ended for classroom: ${room.name}`);
            }
        } catch (error) {
            console.error('End session manual error:', error);
        }
    });

    socket.on('extend-session', async (data) => {
        try {
            const room = await Classroom.findById(data.roomId);
            if (room && room.creator.toString() === data.userId) {
                room.duration = data.duration;
                await room.save();
                io.to(data.roomId).emit('session-extended', { duration: room.duration });
                console.log(`Session duration extended/changed to ${room.duration} minutes for classroom: ${room.name}`);
            }
        } catch (error) {
            console.error('Extend session error:', error);
        }
    });

    socket.on('toggle-pomodoro', async (data) => {
        try {
            const room = await Classroom.findByIdAndUpdate(data.roomId, { pomodoroEnabled: data.enabled }, { new: true });
            if (room) {
                io.to(data.roomId).emit('pomodoro-toggled', { enabled: room.pomodoroEnabled });
                console.log(`Pomodoro status toggled to ${room.pomodoroEnabled} for classroom: ${room.name}`);
            }
        } catch (error) {
            console.error('Toggle pomodoro error:', error);
        }
    });

    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        if (socket.userId && socket.joinTime) {
            const durationMs = new Date() - socket.joinTime;
            const durationMins = durationMs / (1000 * 60);
            
            let action = null;
            if (durationMins >= 60) {
                action = 'CLASSROOM_STUDY_60_PLUS';
            } else if (durationMins >= 30) {
                action = 'CLASSROOM_STUDY_30_60';
            } else if (durationMins >= 15) {
                action = 'CLASSROOM_STUDY_15_30';
            } else if (durationMins >= 5) {
                action = 'CLASSROOM_STUDY_5_15';
            }
            
            if (action) {
                try {
                    const { awardXP } = require('./utils/gamification');
                    await awardXP(socket.userId, action);
                    console.log(`Awarded ${action} to user ${socket.userId}`);
                } catch (error) {
                    console.error('Error awarding study XP on disconnect:', error);
                }
            }
        }
    });
});

// Background job to check for expired study sessions every 15 seconds
setInterval(async () => {
    try {
        const now = new Date();
        const activeClassrooms = await Classroom.find({ sessionStatus: 'active' });
        for (const room of activeClassrooms) {
            const expiryTime = new Date(room.startTime.getTime() + room.duration * 60000);
            if (now >= expiryTime) {
                room.sessionStatus = 'ended';
                room.endedAt = now;
                await room.save();
                io.to(room._id.toString()).emit('session-ended', { endedAt: now });
                console.log(`Session automatically ended for classroom: ${room.name}`);
            }
        }
    } catch (error) {
        console.error('Error in background session check:', error);
    }
}, 15000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});