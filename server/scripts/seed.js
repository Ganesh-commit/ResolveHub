const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function seedDatabase() {
  const superUsername = (process.env.SUPERADMIN_USERNAME || 'ksaiganesh64').trim().toLowerCase();
  const superPassword = process.env.SUPERADMIN_PASSWORD || 'SAI@@@killer197712200611';

  const demoRegNo = (process.env.DEMO_STUDENT_REG_NO || '241FA07011').trim().toUpperCase();
  const demoPassword = process.env.DEMO_STUDENT_PASSWORD || '241FA07011';

  const envURI = process.env.MONGODB_URI;
  const isPlaceholder = !envURI || envURI.includes('YOUR_USERNAME') || envURI.includes('cluster0.xxxxx');
  const primaryURI = isPlaceholder ? 'mongodb://127.0.0.1:27017/resolvehub' : envURI;

  let closeDb = false;
  if (mongoose.connection.readyState !== 1) {
    try {
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
  const { v4: uuidv4 } = require('uuid');

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

  // 2. Seed / Update Pre-Approved Demo Student Account (Idempotent)
  let demoUser = await User.findOne({ regNo: demoRegNo });
  const demoHash = await bcrypt.hash(demoPassword, 10);

  if (!demoUser) {
    demoUser = await User.create({
      id: `usr-${uuidv4().substring(0, 8)}`,
      regNo: demoRegNo,
      fullName: 'Sai Ganesh (Demo Student)',
      email: `${demoRegNo.toLowerCase()}@vignan.ac.in`,
      phone: '9876543210',
      department: 'Information Technology (IT)',
      year: '3rd Year',
      passwordHash: demoHash,
      mustChangePassword: false,
      status: 'ACTIVE',
      activatedAt: new Date().toLocaleString('en-IN')
    });
    console.log(`✅ Pre-approved Demo Student account created: ${demoRegNo}`);
  } else {
    const isDemoPasswordSame = await bcrypt.compare(demoPassword, demoUser.passwordHash);
    let updated = false;

    if (!isDemoPasswordSame) {
      demoUser.passwordHash = demoHash;
      updated = true;
    }
    if (demoUser.status !== 'ACTIVE') {
      demoUser.status = 'ACTIVE';
      updated = true;
    }
    if (updated) {
      await demoUser.save();
      console.log(`🔄 Demo Student account updated from .env: ${demoRegNo}`);
    } else {
      console.log(`ℹ️ Demo Student account is up to date: ${demoRegNo}`);
    }
  }

  // Also ensure an APPROVED SignupRequest exists for demo student for consistency
  let demoReq = await SignupRequest.findOne({ regNo: demoRegNo });
  if (!demoReq) {
    await SignupRequest.create({
      id: `req-${uuidv4().substring(0, 8)}`,
      regNo: demoRegNo,
      fullName: demoUser.fullName,
      email: demoUser.email,
      department: demoUser.department,
      year: demoUser.year,
      passwordHash: demoUser.passwordHash,
      status: 'APPROVED',
      createdAt: new Date().toLocaleString('en-IN')
    });
  } else if (demoReq.status !== 'APPROVED' || demoReq.passwordHash !== demoUser.passwordHash) {
    demoReq.status = 'APPROVED';
    demoReq.passwordHash = demoUser.passwordHash;
    await demoReq.save();
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
