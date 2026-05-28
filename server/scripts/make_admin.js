require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email: node server/scripts/make_admin.js <email>');
    process.exit(1);
}

const run = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/csv';
        await mongoose.connect(mongoUri);
        console.log('Database connected successfully');

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`\n🎉 Success! User "${user.name}" (${email}) has been promoted to ADMIN.\n`);
        process.exit(0);
    } catch (error) {
        console.error('Error making user admin:', error);
        process.exit(1);
    }
};

run();
