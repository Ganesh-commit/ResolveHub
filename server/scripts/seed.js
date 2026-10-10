const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function seedDatabase() {
  const superUsername = (process.env.SUPERADMIN_USERNAME || 'ksaiganesh64').trim().toLowerCase();
  const superPassword = process.env.SUPERADMIN_PASSWORD || 'SAI@@@killer197712200611';

  const envURI = process.env.MONGODB_URI;
  const isPlaceholder = !envURI || envURI.includes('YOUR_USERNAME') || envURI.includes('cluster0.xxxxx');
  const primaryURI = isPlaceholder ? 'mongodb://127.0.0.1:27017/resolvehub' : envURI;

  let closeDb = false;
  if (mongoose.connection.readyState !== 1) {
    try {
      const dns = require('dns');
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
      await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 3000 });
      closeDb = true;
    } catch (e) {
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/resolvehub', { serverSelectionTimeoutMS: 3000 });
        closeDb = true;
      } catch (localErr) {
        console.error('⚠️ Could not connect to MongoDB for seeding. Continuing...');
        return;
      }
    }
  }

  const Staff = require('../models/Staff');
  const User = require('../models/User');
  const SignupRequest = require('../models/SignupRequest');

  // 1. Seed / Update Super Admin Account (Idempotent)
  let existingAdmin = await Staff.findOne({ username: superUsername });
  const adminHash = await bcrypt.hash(superPassword, 10);

  if (!existingAdmin) {
    await Staff.deleteMany({ username: { $in: ['superadmin', 'admin'] } });
    await Staff.create({
      id: 'admin-super-01',
      username: superUsername,
      passwordHash: adminHash,
      name: 'System Super Admin (Sai Ganesh)',
      role: 'super_admin',
      department: 'All Departments',
      status: 'ACTIVE',
      createdAt: new Date().toLocaleString('en-IN')
    });
    console.log(`✅ Super Admin account created: ${superUsername}`);
  } else {
    const isPasswordSame = await bcrypt.compare(superPassword, existingAdmin.passwordHash);
    if (!isPasswordSame) {
      existingAdmin.passwordHash = adminHash;
      existingAdmin.role = 'super_admin';
      existingAdmin.status = 'ACTIVE';
      await existingAdmin.save();
      console.log(`🔄 Super Admin password updated from .env for user: ${superUsername}`);
    } else {
      console.log(`ℹ️ Super Admin account is up to date: ${superUsername}`);
    }
  }

  // 2. Seed / Update Active Student 241FA07011 (Password: 241FA07011)
  const targetReg = '241FA07011';
  const targetPwd = '241FA07011';
  const studentHash = await bcrypt.hash(targetPwd, 10);

  let existingStudent = await User.findOne({ regNo: targetReg });
  if (!existingStudent) {
    existingStudent = await User.create({
      id: 'usr-241fa07011',
      regNo: targetReg,
      fullName: 'K Sai Ganesh',
      email: 'ksaiganesh64@vignan.ac.in',
      phone: '+91 9876543210',
      department: 'Information Technology (IT)',
      year: '1st Year',
      passwordHash: studentHash,
      mustChangePassword: false,
      status: 'ACTIVE',
      activatedAt: new Date().toLocaleString('en-IN')
    });
    console.log(`✅ Student account created: ${targetReg}`);
  } else {
    existingStudent.passwordHash = studentHash;
    existingStudent.status = 'ACTIVE';
    existingStudent.mustChangePassword = false;
    existingStudent.failedAttempts = 0;
    existingStudent.lockoutUntil = null;
    await existingStudent.save();
    console.log(`🔄 Student account verified and activated: ${targetReg}`);
  }

  // Ensure corresponding SignupRequest is APPROVED
  let existingReq = await SignupRequest.findOne({ regNo: targetReg });
  if (!existingReq) {
    await SignupRequest.create({
      id: 'req-241fa07011',
      regNo: targetReg,
      fullName: 'K Sai Ganesh',
      email: 'ksaiganesh64@vignan.ac.in',
      phone: '+91 9876543210',
      department: 'Information Technology (IT)',
      year: '1st Year',
      passwordHash: studentHash,
      status: 'APPROVED',
      rejectionReason: null,
      createdAt: new Date().toLocaleString('en-IN')
    });
    console.log(`✅ Signup request approved: ${targetReg}`);
  } else {
    existingReq.status = 'APPROVED';
    existingReq.rejectionReason = null;
    existingReq.passwordHash = studentHash;
    await existingReq.save();
    console.log(`ℹ️ Signup request status confirmed APPROVED: ${targetReg}`);
  }

  // 3. Seed Pre-Approved Demo Student 241FA07001
  const demoReg = '241FA07001';
  let demoStudent = await User.findOne({ regNo: demoReg });
  if (!demoStudent) {
    const demoHash = await bcrypt.hash('241FA07001', 10);
    await User.create({
      id: 'usr-student-001',
      regNo: demoReg,
      fullName: 'Venkata Sai Teja',
      email: 'saiteja.241fa07001@gmail.com',
      department: 'Computer Science & Engineering (CSE)',
      year: '3rd Year',
      passwordHash: demoHash,
      status: 'ACTIVE',
      activatedAt: new Date().toLocaleString('en-IN')
    });
  }

  if (closeDb) {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('✨ Seed script completed.');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Seed script error:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
