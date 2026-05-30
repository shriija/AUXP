const Classroom = require('../models/Classroom');
const { awardXP } = require('../utils/gamification');
const Notification = require('../models/Notification');

const createClassroom = async (req, res) => {
    try {
        const { name, description, isPrivate, code, sessionTitle, startTime, duration, sessionStatus } = req.body;
        const classroom = await Classroom.create({
            name,
            description,
            isPrivate: isPrivate || false,
            code: isPrivate ? code : undefined,
            creator: req.user._id,
            members: [req.user._id],
            sessionTitle: sessionTitle || name,
            startTime: startTime ? new Date(startTime) : new Date(),
            duration: duration ? Number(duration) : 60,
            sessionStatus: sessionStatus || 'scheduled'
        });
        
        // XP will be awarded only after admin approval in the admin controller.
        res.status(201).json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create classroom', error: error.message });
    }
};

const getClassrooms = async (req, res) => {
    try {
        const now = new Date();
        
        // 1. Auto-end active classrooms that have expired
        const activeClassrooms = await Classroom.find({ sessionStatus: 'active', isDeleted: { $ne: true } });
        for (const room of activeClassrooms) {
            const expiryTime = new Date(room.startTime.getTime() + room.duration * 60000);
            if (now >= expiryTime) {
                room.sessionStatus = 'ended';
                room.endedAt = now;
                await room.save();
            }
        }

        // 2. Fetch rooms: exclude rooms that ended more than 5 minutes ago and check approval status
        let approvalQuery = {};
        if (req.user) {
            if (req.user.role !== 'admin') {
                approvalQuery.$or = [
                    { approvalStatus: 'approved' },
                    { creator: req.user._id }
                ];
            }
        } else {
            approvalQuery.approvalStatus = 'approved';
        }

        const fiveMinsAgo = new Date(now.getTime() - 5 * 60000);
        const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
        const timeQuery = {
            $or: [
                { sessionStatus: { $in: ['scheduled', 'active'] } },
                { sessionStatus: 'ended', name: 'Completed Exam Review', endedAt: { $gte: tenDaysAgo } },
                { sessionStatus: 'ended', name: { $ne: 'Completed Exam Review' }, endedAt: { $gte: fiveMinsAgo } }
            ]
        };

        const classrooms = await Classroom.find({
            $and: [
                { isDeleted: { $ne: true } },
                approvalQuery,
                timeQuery
            ]
        })
        .populate('creator', 'name')
        .sort({ createdAt: -1 });

        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch classrooms', error: error.message });
    }
};

const getClassroomById = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('creator', 'name')
            .populate('members', 'name email');
            
        if (!classroom || classroom.isDeleted) return res.status(404).json({ message: 'Classroom not found' });

        if (classroom.approvalStatus !== 'approved') {
            if (!req.user || (req.user.role !== 'admin' && classroom.creator._id.toString() !== req.user._id.toString())) {
                return res.status(403).json({ message: 'Classroom is pending approval' });
            }
        }
        
        // Auto-end if active but expired
        if (classroom.sessionStatus === 'active') {
            const now = new Date();
            const expiryTime = new Date(classroom.startTime.getTime() + classroom.duration * 60000);
            if (now >= expiryTime) {
                classroom.sessionStatus = 'ended';
                classroom.endedAt = now;
                await classroom.save();
            }
        }
        
        res.json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch classroom', error: error.message });
    }
};

const joinClassroom = async (req, res) => {
    try {
        const { code } = req.body;
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom || classroom.isDeleted) return res.status(404).json({ message: 'Classroom not found' });

        if (classroom.isPrivate && classroom.creator.toString() !== req.user._id.toString()) {
            if (classroom.code !== code) {
                return res.status(403).json({ message: 'Invalid classroom code' });
            }
        }

        if (!classroom.members.includes(req.user._id)) {
            classroom.members.push(req.user._id);
            await classroom.save();
            // Gamification: Classroom joined (Disabled immediate XP to prevent exploit)

            // Create Notification
            if (classroom.creator.toString() !== req.user._id.toString()) {
                await Notification.create({
                    recipient: classroom.creator,
                    sender: req.user._id,
                    type: 'CLASSROOM_JOIN',
                    relatedItem: classroom._id,
                    message: `${req.user.name} joined your classroom "${classroom.name}"`
                });
            }
        }
        res.json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Failed to join classroom', error: error.message });
    }
};

module.exports = { createClassroom, getClassrooms, getClassroomById, joinClassroom };
