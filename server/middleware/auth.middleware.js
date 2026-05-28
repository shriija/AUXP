const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            
            return next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else if (req.query.token) {
        try {
            token = req.query.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            
            return next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const optionalProtect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            console.error('Optional JWT Verification Error:', error.message);
        }
    }
    next();
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, optionalProtect, admin };

