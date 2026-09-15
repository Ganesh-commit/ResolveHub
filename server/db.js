const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// ── Setup data directory & file ────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const adapter = new FileSync(path.join(DATA_DIR, 'resolvehub.json'));
const db = low(adapter);

// ── Password Hashing Helpers ─────────────────────────────────────────────
const SALT = 'resolvehub_secure_salt_2026';

function hashPassword(password) {
  if (!password) return '';
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  // Support legacy plain-text fallback check for smooth transition
  if (password === storedHash) return true;
  return hashPassword(password) === storedHash;
}

// ── Default Schema Setup ──────────────────────────────────────────────────
db.defaults({
  tickets: [],
  staff: [],
  signupRequests: [],
  users: [],
  activityLogs: [],
  systemSettings: {
    categories: ['Hostel & Facilities', 'IT & Network', 'Finance & Scholarship', 'Sanitation & Hygiene', 'Academics', 'Harassment & Discipline'],
    departments: ['Facilities & HVAC', 'IT & Network Systems', 'Student Finance Bureau', 'Health & Sanitation', 'Academics Redressal', 'Internal Grievance Committee'],
    priorities: ['Low', 'Medium', 'High', 'Urgent'],
    slaHours: { critical: 2, high: 4, medium: 8, low: 24 }
  }
}).write();

// ── Seed Staff / Admin Accounts if SuperAdmin missing ─────────────────────
const hasSuperAdmin = db.get('staff').find(s => s.username === 'superadmin' || s.username === 'admin').value();
if (!hasSuperAdmin) {
  db.get('staff').push(
    {
      id: 'admin-super-01',
      username: 'superadmin',
      password: 'admin123',
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
      password: 'admin123',
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
      password: 'admin123',
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
      password: 'admin123',
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
      password: 'admin123',
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
      password: 'admin123',
      passwordHash: hashPassword('admin123'),
      name: 'Campus Administrator',
      role: 'super_admin',
      department: 'All Departments',
      status: 'ACTIVE',
      createdAt: '2026-09-15 08:00 AM'
    }
  ).write();
} else {
  // Ensure superadmin has passwordHash & super_admin role
  const sa = db.get('staff').find({ username: 'superadmin' }).value();
  if (!sa) {
    db.get('staff').push({
      id: 'admin-super-01',
      username: 'superadmin',
      password: 'admin123',
      passwordHash: hashPassword('admin123'),
      name: 'System Super Admin',
      role: 'super_admin',
      department: 'All Departments',
      status: 'ACTIVE',
      createdAt: '2026-09-15 08:00 AM'
    }).write();
  }
}

// ── Seed Student Accounts if Empty ───────────────────────────────────────
const existingUsers = db.get('users').value();
if (!existingUsers || existingUsers.length === 0) {
  db.get('users').push(
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
  ).write();
}

// ── Seed Initial Tickets if Empty ───────────────────────────────────────
if (db.get('tickets').size().value() === 0) {
  db.get('tickets').push(
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
      attachments: [{ id: 'att-3', name: 'ap_led_status.jpg', size: '2.1 MB', type: 'image/jpeg' }],
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
    },
    {
      id: 'RP-7911',
      title: 'Water Filtration Unit Filter Replacement (Dining Hall B)',
      category: 'Sanitation & Hygiene',
      department: 'Health & Sanitation',
      urgency: 'medium',
      status: 'resolved',
      slaStatus: 'normal',
      location: 'Mess Facility B, South Wing',
      description: 'RO filtration TDS reading 380 PPM. Requested membrane replacement.',
      complainant: { regNo: '241FA07015', name: 'Ananya Sharma', email: 'ananya.s@campus.edu', role: 'Student' },
      assignedAgent: { name: 'Santosh Kumar', role: 'Sanitation Officer', phone: '+91 97766 54321', department: 'Health & Sanitation' },
      responseRemarks: 'Industrial RO cartridge swapped and water purity re-tested at 45 PPM.',
      eta: 'Resolved',
      etaMinutesLeft: 0,
      currentStepIndex: 3,
      createdAt: '2026-09-10, 08:00 AM',
      updatedAt: 'Oct 10, 03:45 PM',
      attachments: [],
      auditLogs: [
        { id: 'l7', timestamp: 'Oct 10, 08:00 AM', author: 'System', role: 'Intake', action: 'Ticket Logged', note: '' },
        { id: 'l8', timestamp: 'Oct 10, 11:00 AM', author: 'Santosh K.', role: 'Department Admin', action: 'Technician Dispatched', note: 'Industrial RO cartridge swapped.' },
        { id: 'l9', timestamp: 'Oct 10, 03:45 PM', author: 'Santosh K.', role: 'Department Admin', action: 'Resolved', note: 'Water tested at 45 PPM pure.' }
      ]
    },
    {
      id: 'RP-7890',
      title: 'Lab 4 Deep Learning GPU Server Overheating Warning',
      category: 'IT & Network',
      department: 'IT & Network Systems',
      urgency: 'critical',
      status: 'resolved',
      slaStatus: 'normal',
      location: 'AI Research Center, Lab 4 Rack 2',
      description: 'NVIDIA RTX A6000 node throttling at 94°C due to intake fan dust blockage.',
      complainant: { regNo: '241FA07001', name: 'Venkata Sai Teja', email: 'saiteja.241fa07001@gmail.com', role: 'Student' },
      assignedAgent: { name: 'Vikram Mehta', role: 'Senior Network Engineer', department: 'IT & Network Systems' },
      responseRemarks: 'Intake fans cleaned and thermal paste reapplied.',
      eta: 'Resolved',
      etaMinutesLeft: 0,
      currentStepIndex: 3,
      createdAt: '2026-09-08, 02:00 PM',
      updatedAt: 'Oct 08, 04:30 PM',
      attachments: [],
      auditLogs: [
        { id: 'l10', timestamp: 'Oct 08, 02:00 PM', author: 'System', role: 'Intake', action: 'Ticket Logged', note: '' },
        { id: 'l11', timestamp: 'Oct 08, 04:30 PM', author: 'Vikram M.', role: 'Department Admin', action: 'Resolved', note: 'Thermal paste reapplied.' }
      ]
    }
  ).write();

  console.log('✅ Database (resolvehub.json) seeded with initial tickets, staff roles & students.');
}

// Helper to log system activity
function logActivity(author, role, action, details) {
  const logItem = {
    id: `log-${uuidv4().substring(0, 8)}`,
    timestamp: new Date().toLocaleString('en-IN'),
    author,
    role,
    action,
    details
  };
  db.get('activityLogs').unshift(logItem).write();
  return logItem;
}

module.exports = {
  db,
  uuidv4,
  hashPassword,
  verifyPassword,
  logActivity
};

