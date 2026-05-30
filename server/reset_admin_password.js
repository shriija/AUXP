const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/csv');
        const user = await User.findOne({ email: 'admin@anurag.edu.in' });
        if (!user) {
            console.error('Admin user not found!');
            process.exit(1);
        }
        user.password = 'Password123!';
        await user.save();
        console.log('Admin password successfully reset to Password123!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
