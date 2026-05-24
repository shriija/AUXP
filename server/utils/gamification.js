const User = require('../models/User');
const Resource = require('../models/Resource');
const ForumReply = require('../models/ForumReply');

const XP_REWARDS = {
    UPLOAD: 40,
    UPVOTE_RECEIVED: 5,
    FORUM_POST: 10,
    FORUM_REPLY: 5,
    REPLY_UPVOTE_RECEIVED: 3,
    CLASSROOM_CREATE: 20,
    CLASSROOM_JOIN: 5,
    DAILY_LOGIN: 2,
    DOWNLOAD_RECEIVED: 2
};

const BADGES = {
    FIRST_UPLOAD: 'First Upload',
    TEN_RESOURCES: '10 Resources Shared',
    FORUM_HELPER: 'Forum Helper',
    WHITEBOARD_WIZARD: 'Whiteboard Wizard',
    THIRTY_DAY_STREAK: '30-Day Streak',
    SCHOLAR_10: 'Level 10 Scholar'
};

async function awardXP(userId, action, amountMultiplier = 1) {
    try {
        const xpAmount = XP_REWARDS[action] * amountMultiplier;
        if (!xpAmount) return null;

        const user = await User.findById(userId);
        if (!user) return null;

        user.xp = Math.max(0, user.xp + xpAmount);
        user.level = Math.floor(user.xp / 100) + 1;

        // Level 10 Scholar check
        if (user.level >= 10 && !user.badges.includes(BADGES.SCHOLAR_10)) {
            user.badges.push(BADGES.SCHOLAR_10);
        }

        await user.save();
        return user;
    } catch (err) {
        console.error('awardXP error:', err);
        return null;
    }
}

async function checkAchievements(userId, triggerType) {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        let updated = false;

        if (triggerType === 'UPLOAD') {
            const activeCount = await Resource.countDocuments({ uploadedBy: userId, isDeleted: false });
            if (activeCount >= 1 && !user.badges.includes(BADGES.FIRST_UPLOAD)) {
                user.badges.push(BADGES.FIRST_UPLOAD);
                updated = true;
            }
            if (activeCount >= 10 && !user.badges.includes(BADGES.TEN_RESOURCES)) {
                user.badges.push(BADGES.TEN_RESOURCES);
                updated = true;
            }
        }

        if (triggerType === 'REPLY') {
            const replyCount = await ForumReply.countDocuments({ author: userId });
            if (replyCount >= 5 && !user.badges.includes(BADGES.FORUM_HELPER)) {
                user.badges.push(BADGES.FORUM_HELPER);
                updated = true;
            }
        }

        if (triggerType === 'WHITEBOARD') {
            if (!user.badges.includes(BADGES.WHITEBOARD_WIZARD)) {
                user.badges.push(BADGES.WHITEBOARD_WIZARD);
                updated = true;
            }
        }

        if (triggerType === 'STREAK') {
            if (user.loginStreak >= 30 && !user.badges.includes(BADGES.THIRTY_DAY_STREAK)) {
                user.badges.push(BADGES.THIRTY_DAY_STREAK);
                updated = true;
            }
        }

        if (updated) {
            await user.save();
        }
        return user;
    } catch (err) {
        console.error('checkAchievements error:', err);
        return null;
    }
}

async function updateLoginStreak(user) {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (!user.lastLoginDate) {
            user.lastLoginDate = today;
            user.loginStreak = 1;
            user.xp += XP_REWARDS.DAILY_LOGIN;
            user.level = Math.floor(user.xp / 100) + 1;
            
            // Streak badge check
            if (user.loginStreak >= 30 && !user.badges.includes(BADGES.THIRTY_DAY_STREAK)) {
                user.badges.push(BADGES.THIRTY_DAY_STREAK);
            }
            await user.save();
            return true;
        }

        const lastLogin = new Date(user.lastLoginDate);
        const lastLoginDateOnly = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
        
        const diffTime = today - lastLoginDateOnly;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            user.loginStreak += 1;
            user.lastLoginDate = today;
            user.xp += XP_REWARDS.DAILY_LOGIN;
            user.level = Math.floor(user.xp / 100) + 1;
            
            // Streak badge check
            if (user.loginStreak >= 30 && !user.badges.includes(BADGES.THIRTY_DAY_STREAK)) {
                user.badges.push(BADGES.THIRTY_DAY_STREAK);
            }
            await user.save();
            return true;
        } else if (diffDays > 1) {
            user.loginStreak = 1;
            user.lastLoginDate = today;
            user.xp += XP_REWARDS.DAILY_LOGIN;
            user.level = Math.floor(user.xp / 100) + 1;
            await user.save();
            return true;
        }
        
        return false;
    } catch (err) {
        console.error('updateLoginStreak error:', err);
        return false;
    }
}

async function syncUserAchievements(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        let updated = false;

        // 1. Upload achievements
        const activeCount = await Resource.countDocuments({ uploadedBy: userId, isDeleted: false });
        if (activeCount >= 1 && !user.badges.includes(BADGES.FIRST_UPLOAD)) {
            user.badges.push(BADGES.FIRST_UPLOAD);
            updated = true;
        }
        if (activeCount >= 10 && !user.badges.includes(BADGES.TEN_RESOURCES)) {
            user.badges.push(BADGES.TEN_RESOURCES);
            updated = true;
        }

        // 2. Forum achievements
        const replyCount = await ForumReply.countDocuments({ author: userId });
        if (replyCount >= 5 && !user.badges.includes(BADGES.FORUM_HELPER)) {
            user.badges.push(BADGES.FORUM_HELPER);
            updated = true;
        }

        // 3. Level 10 Scholar check
        if (user.level >= 10 && !user.badges.includes(BADGES.SCHOLAR_10)) {
            user.badges.push(BADGES.SCHOLAR_10);
            updated = true;
        }

        if (updated) {
            await user.save();
        }
        return user;
    } catch (err) {
        console.error('syncUserAchievements error:', err);
        return null;
    }
}

module.exports = { awardXP, checkAchievements, updateLoginStreak, syncUserAchievements, XP_REWARDS, BADGES };
