const Classroom = require('../models/Classroom');
const { awardXP } = require('../utils/gamification');

const createClassroom = async (req, res) => {
    try {
        const { name, description, isPrivate, code } = req.body;
        const classroom = await Classroom.create({
            name,
            description,
            isPrivate: isPrivate || false,
            code: isPrivate ? code : undefined,
            creator: req.user._id,
            members: [req.user._id]
        });
        
        // Gamification: Classroom created (+20 XP)
        await awardXP(req.user._id, 'CLASSROOM_CREATE');
        
        res.status(201).json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create classroom', error: error.message });
    }
};

const getClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find()
            .select('-code')
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
            .populate('members', 'name');
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
        res.json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch classroom', error: error.message });
    }
};

const joinClassroom = async (req, res) => {
    try {
        const { code } = req.body;
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        if (classroom.isPrivate && classroom.creator.toString() !== req.user._id.toString()) {
            if (classroom.code !== code) {
                return res.status(403).json({ message: 'Invalid classroom code' });
            }
        }

        if (!classroom.members.includes(req.user._id)) {
            classroom.members.push(req.user._id);
            await classroom.save();
            // Gamification: Classroom joined (+5 XP)
            await awardXP(req.user._id, 'CLASSROOM_JOIN');
        }
        res.json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Failed to join classroom', error: error.message });
    }
};

module.exports = { createClassroom, getClassrooms, getClassroomById, joinClassroom };
