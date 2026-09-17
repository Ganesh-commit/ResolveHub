const mongoose = require('mongoose');
const crypto = require('crypto');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const { v4: uuidv4 } = require('uuid');

const Ticket = require('./models/Ticket');
const User = require('./models/User');
const Staff = require('./models/Staff');
const SignupRequest = require('./models/SignupRequest');
const ActivityLog = require('./models/ActivityLog');
const SystemSetting = require('./models/SystemSetting');

// ── Password Hashing Helpers ─────────────────────────────────────────────
const SALT = 'resolvehub_secure_salt_2026';

function hashPassword(password) {
  if (!password) return '';
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  if (password === storedHash) return true;
  return hashPassword(password) === storedHash;
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
    
    // Auto-seed initial defaults
    await seedInitialData();
  } catch (err) {
    console.error(`⚠️ Primary MongoDB Connection Note: ${err.message}`);
    if (isPlaceholder) {
      console.log(`💡 Note: Please update MONGODB_URI in server/.env with your exact MongoDB Atlas connection link from cloud.mongodb.com`);
    } else {
      // Try local fallback if Atlas URI had invalid credentials or network block
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
    // 1. Seed System Settings
    const settingCount = await SystemSetting.countDocuments();
    if (settingCount === 0) {
      await SystemSetting.create({
        key: 'global_settings',
        categories: ['Hostel & Facilities', 'IT & Network', 'Finance & Scholarship', 'Sanitation & Hygiene', 'Academics', 'Harassment & Discipline'],
        departments: ['Facilities & HVAC', 'IT & Network Systems', 'Student Finance Bureau', 'Health & Sanitation', 'Academics Redressal', 'Internal Grievance Committee'],
        priorities: ['Low', 'Medium', 'High', 'Urgent'],
        slaHours: { critical: 2, high: 4, medium: 8, low: 24 }
      });
    }

    // 2. Seed Super Admin & Dept Admin Accounts
    const superAdmin = await Staff.findOne({ username: 'superadmin' });
    if (!superAdmin) {
      await Staff.insertMany([
        {
          id: 'admin-super-01',
          username: 'superadmin',
          passwordHash: hashPassword('admin123'),
          name: 'System Super Admin',
          role: 'super_admin',
          department: 'All Departments',
          status: 'ACTIVE',
          createdAt: '2026-09-15 08:00 AM'
        },
        {
          id: 'admin-dept-it',
          username: 'dept_it',
          passwordHash: hashPassword('admin123'),
          name: 'Vikram Mehta',
          role: 'dept_admin',
          department: 'IT & Network Systems',
          status: 'ACTIVE',
          createdAt: '2026-09-15 08:30 AM'
        },
        {
          id: 'admin-dept-hvac',
          username: 'dept_hvac',
          passwordHash: hashPassword('admin123'),
          name: 'Rahul K.',
          role: 'dept_admin',
          department: 'Facilities & HVAC',
          status: 'ACTIVE',
          createdAt: '2026-09-15 08:45 AM'
        },
        {
          id: 'admin-dept-finance',
          username: 'dept_finance',
          passwordHash: hashPassword('admin123'),
          name: 'Deepak Joshi',
          role: 'dept_admin',
          department: 'Student Finance Bureau',
          status: 'ACTIVE',
          createdAt: '2026-09-15 09:00 AM'
        },
        {
          id: 'admin-dept-sanitation',
          username: 'dept_sanitation',
          passwordHash: hashPassword('admin123'),
          name: 'Santosh Kumar',
          role: 'dept_admin',
          department: 'Health & Sanitation',
          status: 'ACTIVE',
          createdAt: '2026-09-15 09:15 AM'
        },
        {
          id: 'admin-legacy-admin',
          username: 'admin',
          passwordHash: hashPassword('admin123'),
          name: 'Campus Administrator',
          role: 'super_admin',
          department: 'All Departments',
          status: 'ACTIVE',
          createdAt: '2026-09-15 08:00 AM'
        }
      ]);
    }

    // 3. Seed Demo Students
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany([
        {
          id: 'usr-student-001',
          regNo: '241FA07001',
          fullName: 'Venkata Sai Teja',
          email: 'saiteja.241fa07001@gmail.com',
          department: 'Computer Science & Engineering (CSE)',
          year: '3rd Year',
          passwordHash: hashPassword('241FA07001'),
          status: 'ACTIVE',
          activatedAt: '2026-09-15 09:00 AM'
        },
        {
          id: 'usr-student-002',
          regNo: '241FA07015',
          fullName: 'Ananya Sharma',
          email: 'ananya.s@campus.edu',
          department: 'Electronics & Communication (ECE)',
          year: '2nd Year',
          passwordHash: hashPassword('241FA07015'),
          status: 'ACTIVE',
          activatedAt: '2026-09-15 09:30 AM'
        }
      ]);
    }

    // 4. Seed Initial Tickets
    const ticketCount = await Ticket.countDocuments();
    if (ticketCount === 0) {
      await Ticket.insertMany([
        {
          id: 'RP-8042',
          title: 'Air Conditioning Breakdown in Block-C Server & Common Hall',
          category: 'Hostel & Facilities',
          department: 'Facilities & HVAC',
          urgency: 'high',
          status: 'dispatched',
          slaStatus: 'normal',
          location: 'Block-C, Room 304 & Common Wing',
          description: 'Central cooling unit tripping every 10 minutes. Severe compressor noise and rising temperature.',
          complainant: { regNo: '241FA07001', name: 'Venkata Sai Teja', email: 'saiteja.241fa07001@gmail.com', role: 'Student' },
          assignedAgent: { name: 'Rahul K.', role: 'Lead HVAC Specialist', phone: '+91 94412 88201', department: 'Facilities & HVAC' },
          responseRemarks: 'Diagnostic team on-site inspecting central chiller compressor.',
          eta: 'Today, 02:30 PM',
          etaMinutesLeft: 58,
          currentStepIndex: 2,
          createdAt: '2026-09-15, 10:30 AM',
          updatedAt: '12 mins ago',
          attachments: [
            { id: 'att-1', name: 'ac_compressor_trip.jpg', size: '1.4 MB', type: 'image/jpeg' },
            { id: 'att-2', name: 'thermostat_reading.png', size: '820 KB', type: 'image/png' }
          ],
          auditLogs: [
            { id: 'l1', timestamp: '10:30 AM', author: 'System Dispatch', role: 'Automated Bot', action: 'Ticket Logged', note: 'Issue classified as High Urgency.' },
            { id: 'l2', timestamp: '10:45 AM', author: 'Dispatcher Sharma', role: 'Super Admin', action: 'Ticket Assigned', note: 'Assigned to Facilities & HVAC division queue.' },
            { id: 'l3', timestamp: '11:15 AM', author: 'Rahul K.', role: 'Department Admin', action: 'Technician Dispatched', note: 'On-site diagnostic kit deployed.' }
          ]
        },
        {
          id: 'RP-8039',
          title: 'Main Library 5GHz Enterprise Wi-Fi Gateway Offline',
          category: 'IT & Network',
          department: 'IT & Network Systems',
          urgency: 'critical',
          status: 'investigating',
          slaStatus: 'warning',
          location: 'Central Library, 2nd Floor Reading Room',
          description: 'Aruba AP-535 access point blinking red. Over 120 students disconnected.',
          complainant: { regNo: '241FA07015', name: 'Ananya Sharma', email: 'ananya.s@campus.edu', role: 'Student' },
          assignedAgent: { name: 'Vikram Mehta', role: 'Senior Network Engineer', phone: '+91 98877 12345', department: 'IT & Network Systems' },
          responseRemarks: 'Checking core switch PoE port configuration and VLAN router.',
          eta: 'Today, 01:00 PM',
          etaMinutesLeft: 32,
          currentStepIndex: 1,
          createdAt: '2026-09-15, 09:15 AM',
          updatedAt: '25 mins ago',
          attachments: [{ id: 'att-3', name: 'ap_led_status.jpg', size: '2.1 MB', type: 'image/png' }],
          auditLogs: [
            { id: 'l4', timestamp: '09:15 AM', author: 'System Dispatch', role: 'Automated Bot', action: 'Ticket Logged', note: 'SLA timer initiated: 4.0 Hours Max.' },
            { id: 'l5', timestamp: '09:30 AM', author: 'Vikram Mehta', role: 'Department Admin', action: 'Investigating', note: 'Remote ping to switch port timed out.' }
          ]
        },
        {
          id: 'RP-7994',
          title: 'Merit Scholarship Disbursal Ledger Discrepancy (Semester V)',
          category: 'Finance & Scholarship',
          department: 'Student Finance Bureau',
          urgency: 'medium',
          status: 'new',
          slaStatus: 'normal',
          location: 'Admin Wing, Finance Counter 3',
          description: 'Tuition fee waiver credited at 40% instead of official 75%.',
          complainant: { regNo: '241FA07001', name: 'Venkata Sai Teja', email: 'saiteja.241fa07001@gmail.com', role: 'Student' },
          assignedAgent: null,
          responseRemarks: '',
          eta: 'Tomorrow, 12:00 PM',
          etaMinutesLeft: 840,
          currentStepIndex: 0,
          createdAt: '2026-09-14, 04:20 PM',
          updatedAt: 'Yesterday, 04:20 PM',
          attachments: [{ id: 'att-4', name: 'scholarship_award_letter.pdf', size: '640 KB', type: 'application/pdf' }],
          auditLogs: [{ id: 'l6', timestamp: 'Yesterday, 04:20 PM', author: 'System Dispatch', role: 'Automated Bot', action: 'Ticket Logged', note: 'Queued in Finance verification backlog.' }]
        }
      ]);
    }
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
