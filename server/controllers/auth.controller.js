const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev', {
        expiresIn: '30d',
    });
};

const { updateLoginStreak, syncUserAchievements } = require('../utils/gamification');

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ name, email, password });
        if (user) {
            await updateLoginStreak(user);
            await syncUserAchievements(user._id);
            const updatedUser = await User.findById(user._id);
            res.status(201).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                xp: updatedUser.xp,
                level: updatedUser.level,
                badges: updatedUser.badges,
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
                xp: updatedUser.xp,
                level: updatedUser.level,
                badges: updatedUser.badges,
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

module.exports = { registerUser, loginUser, getCurrentUser };

