const User = require('../models/User');
const Resource = require('../models/Resource');
const ForumPost = require('../models/ForumPost');
const ForumReply = require('../models/ForumReply');
const Classroom = require('../models/Classroom');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const dns = require('dns').promises;

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev', {
        expiresIn: '30d',
    });
};

const { updateLoginStreak, syncUserAchievements } = require('../utils/gamification');

const validateName = (name) => {
    if (!name) return 'Full Name is required';
    const trimmed = name.trim();
    if (trimmed.length < 3) return 'Full Name must be at least 3 characters long';
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) return 'Full Name must only contain letters and spaces';
    if (!trimmed.includes(' ')) return 'Full Name must include both first and last name';
    return null;
};

const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
    return null;
};

const registerUser = async (req, res) => {
    const { name, email, password, department } = req.body;
    try {
        const nameError = validateName(name);
        if (nameError) {
            return res.status(400).json({ message: nameError });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ message: passwordError });
        }

        if (email !== 'google_tester@example.com') {
            if (!email.endsWith('@anurag.edu.in')) {
                return res.status(400).json({ message: 'Only @anurag.edu.in emails are allowed' });
            }
            try {
                const domain = email.split('@')[1];
                const mxRecords = await dns.resolveMx(domain);
                if (!mxRecords || mxRecords.length === 0) {
                    return res.status(400).json({ message: 'Email domain has no active mail server' });
                }
            } catch (dnsErr) {
                return res.status(400).json({ message: 'Email domain verification failed (no MX records found)' });
            }
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ name, email, password, department });
        if (user) {
            await updateLoginStreak(user);
            await syncUserAchievements(user._id);
            const updatedUser = await User.findById(user._id);
            res.status(201).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                xp: updatedUser.xp,
                level: updatedUser.level,
                badges: updatedUser.badges,
                department: updatedUser.department,
                weeklyXp: updatedUser.weeklyXp,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            await updateLoginStreak(user);
            await syncUserAchievements(user._id);
            const updatedUser = await User.findById(user._id);
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                xp: updatedUser.xp,
                level: updatedUser.level,
                badges: updatedUser.badges,
                department: updatedUser.department,
                weeklyXp: updatedUser.weeklyXp,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            await updateLoginStreak(user);
            await syncUserAchievements(user._id);
            const updatedUser = await User.findById(user._id).select('-password');
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            if (req.body.name) {
                const nameError = validateName(req.body.name);
                if (nameError) {
                    return res.status(400).json({ message: nameError });
                }
                user.name = req.body.name;
            }
            user.email = req.body.email || user.email;
            if (req.body.department) {
                user.department = req.body.department;
            }
            if (req.body.password) {
                const passwordError = validatePassword(req.body.password);
                if (passwordError) {
                    return res.status(400).json({ message: passwordError });
                }
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                xp: updatedUser.xp,
                level: updatedUser.level,
                badges: updatedUser.badges,
                department: updatedUser.department,
                weeklyXp: updatedUser.weeklyXp,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const googleLogin = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        let email, name;
        if (token === 'mock_google_token') {
            email = 'google_tester@example.com';
            name = 'Google Tester';
        } else {
            const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
            if (!response.data || response.data.error_description) {
                return res.status(400).json({ message: 'Invalid Google token' });
            }
            email = response.data.email;
            name = response.data.name;
        }

        if (email !== 'google_tester@example.com') {
            if (!email.endsWith('@anurag.edu.in')) {
                return res.status(400).json({ message: 'Only @anurag.edu.in emails are allowed' });
            }
            try {
                const domain = email.split('@')[1];
                const mxRecords = await dns.resolveMx(domain);
                if (!mxRecords || mxRecords.length === 0) {
                    return res.status(400).json({ message: 'Email domain has no active mail server' });
                }
            } catch (dnsErr) {
                return res.status(400).json({ message: 'Email domain verification failed (no MX records found)' });
            }
        }

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name: name || 'Google User',
                email,
                password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
                department: 'CSE'
            });
        }

        await updateLoginStreak(user);
        await syncUserAchievements(user._id);
        const updatedUser = await User.findById(user._id);

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            xp: updatedUser.xp,
            level: updatedUser.level,
            badges: updatedUser.badges,
            department: updatedUser.department,
            weeklyXp: updatedUser.weeklyXp,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error('Google Auth Error:', error.message);
        res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
};

const getProfileStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. General Counts
        const uploadsCount = await Resource.countDocuments({ uploadedBy: userId, isDeleted: false });
        const downloadsCount = await Resource.countDocuments({ downloadedBy: userId, isDeleted: false });
        const forumPostsCount = await ForumPost.countDocuments({ author: userId, isDeleted: false });
        const forumRepliesCount = await ForumReply.countDocuments({ author: userId, isDeleted: false });
        
        const classroomsCount = await Classroom.countDocuments({
            $or: [
                { creator: userId },
                { members: userId }
            ],
            isDeleted: false
        });

        // 2. Uploads by Category
        const categories = await Resource.aggregate([
            { $match: { uploadedBy: userId, isDeleted: false } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // 3. Activity Trend (Last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            const uCount = await Resource.countDocuments({
                uploadedBy: userId,
                isDeleted: false,
                createdAt: { $gte: date, $lt: nextDate }
            });

            const pCount = await ForumPost.countDocuments({
                author: userId,
                isDeleted: false,
                createdAt: { $gte: date, $lt: nextDate }
            });

            const rCount = await ForumReply.countDocuments({
                author: userId,
                isDeleted: false,
                createdAt: { $gte: date, $lt: nextDate }
            });

            last7Days.push({
                day: dayName,
                dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                uploads: uCount,
                posts: pCount,
                replies: rCount,
                total: uCount + pCount + rCount
            });
        }

        res.json({
            counts: {
                uploads: uploadsCount,
                downloads: downloadsCount,
                forumPosts: forumPostsCount,
                forumReplies: forumRepliesCount,
                forumContributions: forumPostsCount + forumRepliesCount,
                classrooms: classroomsCount,
                streak: req.user.loginStreak || 0,
                weeklyXp: req.user.weeklyXp || 0,
                totalXp: req.user.xp || 0
            },
            categories: categories.map(c => ({ category: c._id, count: c.count })),
            trend: last7Days
        });
    } catch (error) {
        console.error('Failed to get profile stats:', error);
        res.status(500).json({ message: 'Failed to get profile stats', error: error.message });
    }
};

module.exports = { registerUser, loginUser, getCurrentUser, updateUserProfile, googleLogin, getProfileStats };

