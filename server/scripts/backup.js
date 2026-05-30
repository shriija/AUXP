const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');

// Import all models
const User = require('../models/User');
const ForumPost = require('../models/ForumPost');
const ForumReply = require('../models/ForumReply');
const Resource = require('../models/Resource');
const Classroom = require('../models/Classroom');
const Notification = require('../models/Notification');
const Concern = require('../models/Concern');
const Vote = require('../models/Vote');

const models = {
  users: User,
  forum_posts: ForumPost,
  forum_replies: ForumReply,
  resources: Resource,
  classrooms: Classroom,
  notifications: Notification,
  concerns: Concern,
  votes: Vote
};

async function runBackup() {
  const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/csv';
  console.log(`Connecting to MongoDB at: ${dbUri}...`);
  
  try {
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB successfully.');

    const backupDir = path.join(__dirname, '..', '..', 'db-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    console.log(`Backup folder: ${backupDir}`);

    for (const [name, model] of Object.entries(models)) {
      console.log(`Backing up collection: ${name}...`);
      const documents = await model.find({}).lean();
      const filePath = path.join(backupDir, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), 'utf-8');
      console.log(`Saved ${documents.length} documents to ${name}.json`);
    }

    console.log('\n=== BACKUP COMPLETED SUCCESSFULLY! ===');
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runBackup();
