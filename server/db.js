const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const { v4: uuidv4 } = require('uuid');

const Ticket = require('./models/Ticket');
const User = require('./models/User');
const Staff = require('./models/Staff');
const SignupRequest = require('./models/SignupRequest');
const ActivityLog = require('./models/ActivityLog');
const SystemSetting = require('./models/SystemSetting');

// ── Password Hashing Helpers using Bcrypt ────────────────────────────────
async function hashPassword(password) {
  if (!password) return '';
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  try {
    const isBcrypt = storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$');
    if (isBcrypt) {
      return await bcrypt.compare(password, storedHash);
    }
  } catch (e) {}
  return false;
}

// ── Connect MongoDB ──────────────────────────────────────────────────────
async function connectDB() {
  const envURI = process.env.MONGODB_URI;
  const isPlaceholder = !envURI || envURI.includes('YOUR_USERNAME') || envURI.includes('cluster0.xxxxx');
  const mongoURI = isPlaceholder ? 'mongodb://127.0.0.1:27017/resolvehub' : envURI;

  try {
    console.log(`📡 Connecting to MongoDB Database (${isPlaceholder ? 'Local Mongo Fallback' : 'MongoDB Atlas'})...`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ Connected successfully to MongoDB! (${mongoose.connection.host})`);
    
    // Auto-seed initial defaults & superadmin
    await seedInitialData();
  } catch (err) {
    console.error(`⚠️ Primary MongoDB Connection Note: ${err.message}`);
    if (isPlaceholder) {
      console.log(`💡 Note: Please update MONGODB_URI in server/.env with your exact MongoDB Atlas connection link from cloud.mongodb.com`);
    } else {
      try {
        console.log(`🔄 Attempting Local MongoDB fallback (mongodb://127.0.0.1:27017/resolvehub)...`);
        await mongoose.connect('mongodb://127.0.0.1:27017/resolvehub', { serverSelectionTimeoutMS: 3000 });
        console.log(`✅ Connected successfully to Local MongoDB!`);
        await seedInitialData();
      } catch (fallbackErr) {
        console.log(`💡 Connection pending. Ensure your Atlas URL in server/.env has your username and cluster domain.`);
      }
    }
  }
}

// ── Database Auto-Seeder ─────────────────────────────────────────────────
async function seedInitialData() {
  try {
    // Clear student 241FA07011 to allow fresh student registration testing
    await User.deleteMany({ regNo: '241FA07011' }).catch(() => {});
    await SignupRequest.deleteMany({ regNo: '241FA07011' }).catch(() => {});

    // 1. Seed System Settings
    const settingCount = await SystemSetting.countDocuments();
    if (settingCount === 0) {
      await SystemSetting.create({
        key: 'global_settings',
        categories: [
          'Transport',
          'Examinations',
          'Library',
          'Canteen & Food',
          'Security & Safety',
          'Placements & Training',
          'Infrastructure & Maintenance',
          'Sports & Clubs',
          'Administration & Certificates',
          'Health & Medical',
          'Faculty & Teaching',
          'Others'
        ],
        departments: [
          'Information Technology (IT)',
          'CSE (Computer Science & Engineering)',
          'AI & ML (Artificial Intelligence & Machine Learning)',
          'EEE (Electrical & Electronics Engineering)',
          'BI & BT (Bio-Informatics & Bio-Technology)',
          'Mechanical Engineering',
          'Robotics',
          'ECE (Electronics & Communication Engineering)',
          'Textile Industry',
          'CS-BS (Computer Science & Business Systems)',
          'CS-DS (Computer Science & Data Science)'
        ],
        priorities: ['Low', 'Medium', 'High', 'Urgent'],
        slaHours: { critical: 2, high: 4, medium: 8, low: 24 }
      });
    }

    // 2. Seed Super Admin via seedAdmin helper
    const seedAdmin = require('./scripts/seedAdmin');
    await seedAdmin();

  } catch (err) {
    console.error('Error during MongoDB initial data seeding:', err);
  }
}

// Helper to log system activity into MongoDB
async function logActivity(author, role, action, details) {
  try {
    const logItem = {
      id: `log-${uuidv4().substring(0, 8)}`,
      timestamp: new Date().toLocaleString('en-IN'),
      author,
      role,
      action,
      details
    };
    await ActivityLog.create(logItem);
    return logItem;
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

module.exports = {
  connectDB,
  Ticket,
  User,
  Staff,
  SignupRequest,
  ActivityLog,
  SystemSetting,
  uuidv4,
  hashPassword,
  verifyPassword,
  logActivity
};
