const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const mongoose = require('mongoose');

const Staff = require('../models/Staff');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const SignupRequest = require('../models/SignupRequest');
const ActivityLog = require('../models/ActivityLog');
const SystemSetting = require('../models/SystemSetting');

const JSON_PATH = path.join(__dirname, '../data/resolvehub.json');

async function syncJsonToMongo() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set in server/.env!');
    console.log('👉 Please set MONGODB_URI=mongodb+srv://... or mongodb://localhost:27017/resolvehub in server/.env');
    process.exit(1);
  }

  if (!fs.existsSync(JSON_PATH)) {
    console.error(`❌ JSON database not found at: ${JSON_PATH}`);
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB...');
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
    tls: true,
    tlsAllowInvalidCertificates: true
  });
  console.log('✅ Connected to MongoDB successfully!\n');

  const raw = fs.readFileSync(JSON_PATH, 'utf8');
  const data = JSON.parse(raw);

  console.log('📂 Reading resolvehub.json data...');
  console.log(`   • Staff accounts   : ${data.staff?.length || 0}`);
  console.log(`   • Student accounts : ${data.users?.length || 0}`);
  console.log(`   • Grievances       : ${data.tickets?.length || 0}`);
  console.log(`   • Signup requests  : ${data.signupRequests?.length || 0}`);
  console.log(`   • Activity logs    : ${data.activityLogs?.length || 0}`);

  // 1. Sync Staff
  if (Array.isArray(data.staff) && data.staff.length > 0) {
    for (const item of data.staff) {
      const doc = { ...item };
      delete doc._id;
      await Staff.findOneAndUpdate(
        { $or: [{ id: doc.id }, { username: doc.username }] },
        { $set: doc },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Synced ${data.staff.length} Staff/Admin records into MongoDB.`);
  }

  // 2. Sync Users (Students)
  if (Array.isArray(data.users) && data.users.length > 0) {
    for (const item of data.users) {
      const doc = { ...item };
      delete doc._id;
      await User.findOneAndUpdate(
        { $or: [{ id: doc.id }, { regNo: doc.regNo }] },
        { $set: doc },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Synced ${data.users.length} Student records into MongoDB.`);
  }

  // 3. Sync Tickets
  if (Array.isArray(data.tickets) && data.tickets.length > 0) {
    for (const item of data.tickets) {
      const doc = { ...item };
      delete doc._id;
      await Ticket.findOneAndUpdate(
        { id: doc.id },
        { $set: doc },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Synced ${data.tickets.length} Grievance Tickets into MongoDB.`);
  }

  // 4. Sync SignupRequests
  if (Array.isArray(data.signupRequests) && data.signupRequests.length > 0) {
    for (const item of data.signupRequests) {
      const doc = { ...item };
      delete doc._id;
      await SignupRequest.findOneAndUpdate(
        { id: doc.id },
        { $set: doc },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Synced ${data.signupRequests.length} Signup Requests into MongoDB.`);
  }

  // 5. Sync System Settings
  if (data.settings) {
    const doc = { ...data.settings };
    delete doc._id;
    await SystemSetting.findOneAndUpdate(
      { key: doc.key || 'global_settings' },
      { $set: doc },
      { upsert: true, new: true }
    );
    console.log(`✅ Synced System Settings into MongoDB.`);
  }

  // 6. Sync Activity Logs
  if (Array.isArray(data.activityLogs) && data.activityLogs.length > 0) {
    for (const item of data.activityLogs) {
      const doc = { ...item };
      delete doc._id;
      await ActivityLog.findOneAndUpdate(
        { id: doc.id },
        { $set: doc },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Synced ${data.activityLogs.length} Activity Logs into MongoDB.`);
  }

  console.log('\n🎉 ALL DATA HAS BEEN SUCCESSFULLY MIGRATED TO MONGODB!');
  await mongoose.disconnect();
}

if (require.main === module) {
  syncJsonToMongo()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err.message);
      process.exit(1);
    });
}

module.exports = syncJsonToMongo;
