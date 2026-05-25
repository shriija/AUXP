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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST']
    }
});

// Connect to Database
connectDB();

// Middleware
app.use(cors());
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

app.get('/', (req, res) => {
    res.send('CSV API is running...');
});

// Socket.io for Real-time Whiteboard and Chat
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
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
            await Classroom.findByIdAndUpdate(roomId, { whiteboardPaths: [] });
        } catch (error) {
            console.error('Clear canvas error:', error);
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

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});