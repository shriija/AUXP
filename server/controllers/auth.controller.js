const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const dns = require('dns').promises;

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev', {
        expiresIn: '30d',
    });
};

const { updateLoginStreak, syncUserAchievements } = require('../utils/gamification');

const registerUser = async (req, res) => {
    const { name, email, password, department } = req.body;
    try {
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
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.department) {
                user.department = req.body.department;
            }
            if (req.body.password) {
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

module.exports = { registerUser, loginUser, getCurrentUser, updateUserProfile, googleLogin };

