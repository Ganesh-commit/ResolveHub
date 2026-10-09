const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function cleanupDemoStudent() {
  const targetRegNo = '241FA07011';
  console.log(`🧹 Starting cleanup for demo student: ${targetRegNo}...`);

  const envURI = process.env.MONGODB_URI;
  const isPlaceholder = !envURI || envURI.includes('YOUR_USERNAME') || envURI.includes('cluster0.xxxxx');
  const primaryURI = isPlaceholder ? 'mongodb://127.0.0.1:27017/resolvehub' : envURI;

  try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 5000 });
  } catch (e) {
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/resolvehub', { serverSelectionTimeoutMS: 3000 });
    } catch (localErr) {
      console.error('❌ Could not connect to MongoDB for cleanup:', localErr.message);
      process.exit(1);
    }
  }

  const User = require('../models/User');
  const SignupRequest = require('../models/SignupRequest');
  const ActivityLog = require('../models/ActivityLog');
  const Ticket = require('../models/Ticket');

  const regRegex = new RegExp(targetRegNo, 'i');

  const resUser = await User.deleteMany({ regNo: regRegex });
  const resReq = await SignupRequest.deleteMany({ regNo: regRegex });
  const resLog = await ActivityLog.deleteMany({ $or: [{ username: regRegex }, { details: regRegex }] });
  const resTicket = await Ticket.deleteMany({ $or: [{ studentId: regRegex }, { submittedBy: regRegex }] });

  console.log(`✅ Deleted ${resUser.deletedCount} user record(s).`);
  console.log(`✅ Deleted ${resReq.deletedCount} signup request record(s).`);
  console.log(`✅ Deleted ${resLog.deletedCount} activity log record(s).`);
  console.log(`✅ Deleted ${resTicket.deletedCount} ticket record(s).`);

  await mongoose.disconnect();
  console.log('✨ Demo student cleanup completed successfully.');
}

if (require.main === module) {
  cleanupDemoStudent().then(() => process.exit(0)).catch(err => {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  });
}

module.exports = cleanupDemoStudent;
