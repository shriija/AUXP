const User = require('../models/User');
const { getStartOfThisWeek } = require('../utils/gamification');

const getLeaderboards = async (req, res) => {
    try {
        const startOfWeek = getStartOfThisWeek();

        // 1. Reset stale weekly XP for any users who haven't logged in/earned XP this week yet
        await User.updateMany(
            { lastWeeklyReset: { $lt: startOfWeek } },
            { $set: { weeklyXp: 0, lastWeeklyReset: startOfWeek } }
        );

        // 2. Fetch top 10 Global
        const globalUsers = await User.find({})
            .sort({ xp: -1, name: 1 })
            .limit(10)
            .select('name email xp level department');

        // 3. Fetch top 10 Weekly
        const weeklyUsers = await User.find({})
            .sort({ weeklyXp: -1, name: 1 })
            .limit(10)
            .select('name email xp weeklyXp level department');

        // 4. Fetch top 10 Department
        // Use query param if provided, otherwise default to current user's department, fallback to 'CSE'
        const targetDept = req.query.department || (req.user ? req.user.department : 'CSE');
        const deptUsers = await User.find({ department: targetDept })
            .sort({ xp: -1, name: 1 })
            .limit(10)
            .select('name email xp level department');

        // 5. Calculate requesting user's ranks if req.user is set
        let userRanks = null;
        if (req.user) {
            const currentUser = await User.findById(req.user._id);
            if (currentUser) {
                const globalRank = await User.countDocuments({ xp: { $gt: currentUser.xp } }) + 1;
                const weeklyRank = await User.countDocuments({ weeklyXp: { $gt: currentUser.weeklyXp } }) + 1;
                const deptRank = await User.countDocuments({ department: currentUser.department, xp: { $gt: currentUser.xp } }) + 1;
                
                userRanks = {
                    global: globalRank,
                    weekly: weeklyRank,
                    department: deptRank,
                    userDepartment: currentUser.department,
                    xp: currentUser.xp,
                    weeklyXp: currentUser.weeklyXp,
                    level: currentUser.level
                };
            }
        }

        res.json({
            global: globalUsers,
            weekly: weeklyUsers,
            department: deptUsers,
            userRanks,
            targetDepartment: targetDept
        });
    } catch (error) {
        console.error('getLeaderboards error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLeaderboards };
