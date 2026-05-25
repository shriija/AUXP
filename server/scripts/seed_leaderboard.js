const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const connectDB = require('../config/db');

const seedStudents = [
  { name: 'Alice Smith', email: 'alice@test.edu', department: 'CSE', xp: 750, weeklyXp: 320, level: 8, loginStreak: 4 },
  { name: 'Bob Johnson', email: 'bob@test.edu', department: 'ECE', xp: 550, weeklyXp: 150, level: 6, loginStreak: 2 },
  { name: 'Charlie Brown', email: 'charlie@test.edu', department: 'IT', xp: 880, weeklyXp: 410, level: 9, loginStreak: 7 },
  { name: 'Diana Prince', email: 'diana@test.edu', department: 'EEE', xp: 450, weeklyXp: 90, level: 5, loginStreak: 1 },
  { name: 'Ethan Hunt', email: 'ethan@test.edu', department: 'CSE', xp: 1150, weeklyXp: 520, level: 12, loginStreak: 10 },
  { name: 'Fiona Gallagher', email: 'fiona@test.edu', department: 'AIML', xp: 650, weeklyXp: 280, level: 7, loginStreak: 3 },
  { name: 'George Costanza', email: 'george@test.edu', department: 'AI', xp: 350, weeklyXp: 50, level: 4, loginStreak: 0 },
  { name: 'Hannah Baker', email: 'hannah@test.edu', department: 'IT', xp: 950, weeklyXp: 480, level: 10, loginStreak: 9 },
  { name: 'Ian Malcolm', email: 'ian@test.edu', department: 'ECE', xp: 1050, weeklyXp: 310, level: 11, loginStreak: 8 },
  { name: 'Julia Roberts', email: 'julia@test.edu', department: 'EEE', xp: 250, weeklyXp: 60, level: 3, loginStreak: 1 },
  { name: 'Kevin Bacon', email: 'kevin@test.edu', department: 'CSE', xp: 680, weeklyXp: 190, level: 7, loginStreak: 5 },
  { name: 'Laura Croft', email: 'laura@test.edu', department: 'AIML', xp: 1350, weeklyXp: 610, level: 14, loginStreak: 12 },
  { name: 'Michael Scott', email: 'michael@test.edu', department: 'AI', xp: 180, weeklyXp: 20, level: 2, loginStreak: 0 },
  { name: 'Natalie Portman', email: 'natalie@test.edu', department: 'ECE', xp: 720, weeklyXp: 240, level: 8, loginStreak: 4 },
  { name: 'Oliver Queen', email: 'oliver@test.edu', department: 'IT', xp: 490, weeklyXp: 110, level: 5, loginStreak: 3 },
  { name: 'Penny Hofstadter', email: 'penny@test.edu', department: 'EEE', xp: 510, weeklyXp: 180, level: 6, loginStreak: 2 },
  { name: 'Quentin Tarantino', email: 'quentin@test.edu', department: 'AIML', xp: 820, weeklyXp: 390, level: 9, loginStreak: 6 },
  { name: 'Rachel Green', email: 'rachel@test.edu', department: 'AI', xp: 920, weeklyXp: 450, level: 10, loginStreak: 5 },
  { name: 'Steve Rogers', email: 'steve@test.edu', department: 'CSE', xp: 1450, weeklyXp: 700, level: 15, loginStreak: 15 },
  { name: 'Tony Stark', email: 'tony@test.edu', department: 'CSE', xp: 1950, weeklyXp: 950, level: 20, loginStreak: 25 }
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log('Cleaning existing test users...');
    await User.deleteMany({ email: /@test\.edu$/ });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    console.log('Hashing passwords and preparing students...');
    const preparedStudents = seedStudents.map(student => ({
      ...student,
      password: passwordHash,
      lastWeeklyReset: new Date()
    }));

    console.log('Inserting seed students...');
    const createdUsers = await User.insertMany(preparedStudents);
    console.log(`Successfully seeded ${createdUsers.length} test students!`);

    mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDB();
