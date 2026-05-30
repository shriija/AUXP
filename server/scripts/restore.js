require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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

async function runRestore() {
  const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/csv';
  console.log(`Connecting to MongoDB for restoration at: ${dbUri}...`);
  
  try {
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB successfully.');

    const backupDir = path.join(__dirname, '..', '..', 'db-backup');
    if (!fs.existsSync(backupDir)) {
      console.error(`Backup directory not found at: ${backupDir}`);
      return;
    }

    for (const [name, model] of Object.entries(models)) {
      const filePath = path.join(backupDir, `${name}.json`);
      if (!fs.existsSync(filePath)) {
        console.log(`Backup file ${name}.json not found, skipping...`);
        continue;
      }

      console.log(`Restoring collection: ${name} from ${name}.json...`);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const documents = JSON.parse(rawData);

      if (documents.length === 0) {
        console.log(`No documents found in ${name}.json, skipping.`);
        continue;
      }

      // Clear existing collection
      await model.deleteMany({});
      console.log(`Cleared existing documents in ${name}.`);

      // Insert backup documents
      await model.insertMany(documents);
      console.log(`Successfully restored ${documents.length} documents into ${name}.`);
    }

    console.log('\n=== RESTORATION COMPLETED SUCCESSFULLY! ===');
  } catch (error) {
    console.error('Restoration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runRestore();
