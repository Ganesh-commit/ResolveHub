const mongoose = require('mongoose');
// Enable Mongoose command buffering for seamless async connection
const bcrypt = require('bcryptjs');
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

const dns = require('dns');
// Set high-performance DNS upfront to eliminate 5-15s Windows SRV query latency
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

// ── Connect MongoDB ──────────────────────────────────────────────────────
async function connectDB() {
  const envURI = process.env.MONGODB_URI;
  const isPlaceholder = !envURI || envURI.includes('YOUR_USERNAME') || envURI.includes('cluster0.xxxxx');
  const mongoURI = isPlaceholder ? 'mongodb://127.0.0.1:27017/resolvehub' : envURI;

  const mongoOptions = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 2,
    family: 4
  };

  try {
    console.log(`📡 Connecting to MongoDB Database (${isPlaceholder ? 'Local Mongo Fallback' : 'MongoDB Atlas'})...`);
    await mongoose.connect(mongoURI, mongoOptions);
    console.log(`✅ Connected successfully to MongoDB! (${mongoose.connection.host})`);
    
    // Auto-seed initial defaults & superadmin
    await seedInitialData();
  } catch (err) {
    console.error(`⚠️ Primary MongoDB Connection Note: ${err.message}`);
    
    // If SRV DNS lookup failed, retry once with explicit DNS fallback
    if (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
      try {
        console.log(`📡 Retrying MongoDB Atlas connection with fallback DNS servers (8.8.8.8, 1.1.1.1)...`);
        dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
        await mongoose.connect(mongoURI, mongoOptions);
        console.log(`✅ Connected successfully to MongoDB via DNS fallback! (${mongoose.connection.host})`);
        await seedInitialData();
        return;
      } catch (dnsErr) {
        console.error(`⚠️ DNS Fallback Connection Note: ${dnsErr.message}`);
      }
    }

    if (isPlaceholder) {
      console.log(`💡 Note: Please update MONGODB_URI in server/.env with your exact MongoDB Atlas connection link from cloud.mongodb.com`);
    } else {
      try {
        console.log(`🔄 Attempting Local MongoDB fallback (mongodb://127.0.0.1:27017/resolvehub)...`);
        await mongoose.connect('mongodb://127.0.0.1:27017/resolvehub', { serverSelectionTimeoutMS: 3000, family: 4 });
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
    // 1. Seed / Synchronize System Settings with Full University Department List
    const fullCategories = [
      'Academic',
      'Hostel & Facilities',
      'IT & Network',
      'Transport',
      'Canteen & Food',
      'Electrical & Maintenance',
      'Library',
      'Examinations',
      'Security & Safety',
      'Placements & Training',
      'Infrastructure & Maintenance',
      'Administration & Certificates',
      'Health & Medical',
      'Faculty & Teaching',
      'Harassment & Discipline',
      'Others'
    ];
    const fullDepartments = [
      'CSE (Computer Science & Engineering)',
      'Information Technology (IT)',
      'AI & ML (Artificial Intelligence & Machine Learning)',
      'Cyber Security',
      'ECE (Electronics & Communication Engineering)',
      'BI & BT (Bio-Informatics & Bio-Technology)',
      'Robotics',
      'Food Technology',
      'Textile Industry',
      'CS-BS (Computer Science & Business Systems)',
      'CS-DS (Computer Science & Data Science)',
      'BBA (Bachelor of Business Administration)',
      'MBA (Master of Business Administration)',
      'MCA (Master of Computer Applications)',
      'Management (BBA / MBA / MCA)',
      'Estate & Hostel Management'
    ];

    await SystemSetting.findOneAndUpdate(
      { key: 'global_settings' },
      {
        $set: {
          key: 'global_settings',
          categories: fullCategories,
          departments: fullDepartments,
          priorities: ['Low', 'Medium', 'High', 'Urgent'],
          slaHours: { critical: 2, high: 4, medium: 8, low: 24 }
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 2. Seed Super Admin and Pre-Approved Demo Student via seed script
    const seedDatabase = require('./scripts/seed');
    await seedDatabase();

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
