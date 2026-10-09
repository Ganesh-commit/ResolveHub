const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const SignupRequest = require('../models/SignupRequest');
const { normalizeRegNo } = require('../utils/normalize');

async function migrateApprovedRequests() {
  console.log(`\n==================================================`);
  console.log(`🔄 MIGRATING & RECOVERING APPROVED SIGNUP REQUESTS`);
  console.log(`==================================================`);

  const envURI = process.env.MONGODB_URI;
  const isPlaceholder = !envURI || envURI.includes('YOUR_USERNAME') || envURI.includes('cluster0.xxxxx');
  const mongoURI = isPlaceholder ? 'mongodb://127.0.0.1:27017/resolvehub' : envURI;

  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log(`📡 Connected DB Host: ${mongoose.connection.host}`);
    console.log(`🗄️ Database Name:   ${mongoose.connection.name}`);

    // 1. Normalize all SignupRequests
    const requests = await SignupRequest.find({});
    let normalizedReqCount = 0;
    for (const reqItem of requests) {
      const cleanReg = normalizeRegNo(reqItem.regNo);
      if (reqItem.regNo !== cleanReg) {
        reqItem.regNo = cleanReg;
        await reqItem.save();
        normalizedReqCount++;
      }
    }
    console.log(`\n✅ Normalized ${normalizedReqCount} SignupRequest regNo fields.`);

    // 2. Normalize all Users
    const users = await User.find({});
    let normalizedUserCount = 0;
    for (const userItem of users) {
      const cleanReg = normalizeRegNo(userItem.regNo);
      if (userItem.regNo !== cleanReg) {
        userItem.regNo = cleanReg;
        await userItem.save();
        normalizedUserCount++;
      }
    }
    console.log(`✅ Normalized ${normalizedUserCount} User regNo fields.`);

    // 3. Find APPROVED SignupRequests without a User document
    const approvedRequests = await SignupRequest.find({ status: 'APPROVED' });
    let createdUsersCount = 0;

    for (const reqItem of approvedRequests) {
      const cleanReg = normalizeRegNo(reqItem.regNo);
      let userDoc = await User.findOne({ regNo: cleanReg });

      if (!userDoc) {
        userDoc = new User({
          id: `usr-${uuidv4().substring(0, 8)}`,
          regNo: cleanReg,
          fullName: reqItem.fullName,
          email: reqItem.email || '',
          phone: reqItem.phone || '',
          department: reqItem.department || 'CSE',
          year: reqItem.year || '1st Year',
          passwordHash: reqItem.passwordHash,
          mustChangePassword: false,
          status: 'ACTIVE',
          activatedAt: new Date().toLocaleString('en-IN')
        });
        await userDoc.save();
        createdUsersCount++;
        console.log(`   └─ 🟢 Created missing User for approved student: ${cleanReg} (${reqItem.fullName})`);
      }
    }

    console.log(`\n🎉 Migration Complete! Recovered/Created ${createdUsersCount} missing approved user accounts.`);
    console.log(`==================================================\n`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  }
}

migrateApprovedRequests();
