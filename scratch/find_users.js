const mongoose = require('mongoose');
const User = require('../server/models/User');

const run = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/csv');
        const users = await User.find({});
        console.log('Registered Users:');
        users.forEach(u => {
            console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
