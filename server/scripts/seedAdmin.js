const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function seedAdmin() {
  const username = (process.env.SUPERADMIN_USERNAME || 'ksaiganesh64').trim();
  const password = process.env.SUPERADMIN_PASSWORD || 'SAI@@@killer197712200611';

  if (!username || !password) {
    console.error('❌ Error: SUPERADMIN_USERNAME or SUPERADMIN_PASSWORD missing in .env');
    return;
  }

  const envURI = process.env.MONGODB_URI;
  const isPlaceholder = !envURI || envURI.includes('YOUR_USERNAME') || envURI.includes('cluster0.xxxxx');
  const primaryURI = isPlaceholder ? 'mongodb://127.0.0.1:27017/resolvehub' : envURI;

  let closeDb = false;
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 3000 });
      closeDb = true;
    } catch (e) {
      console.log('🔄 Secondary fallback: Connecting to local MongoDB (mongodb://127.0.0.1:27017/resolvehub)...');
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/resolvehub', { serverSelectionTimeoutMS: 3000 });
        closeDb = true;
      } catch (localErr) {
        console.error('⚠️ Could not connect to MongoDB Atlas or local MongoDB for seeding. Continuing...');
        return;
      }
    }
  }

  const Staff = require('../models/Staff');

  const cleanUsername = username.toLowerCase();
  let existingAdmin = await Staff.findOne({ username: cleanUsername });

  if (!existingAdmin) {
    await Staff.deleteMany({ username: { $in: ['superadmin', 'admin'] } });

    const passwordHash = await bcrypt.hash(password, 10);
    existingAdmin = await Staff.create({
      id: 'admin-super-01',
      username: cleanUsername,
      passwordHash,
      name: 'System Super Admin (Sai Ganesh)',
      role: 'super_admin',
      department: 'All Departments',
      status: 'ACTIVE',
      createdAt: new Date().toLocaleString('en-IN')
    });
    console.log(`✅ Super Admin account created: ${cleanUsername}`);
  } else {
    const isPasswordSame = await bcrypt.compare(password, existingAdmin.passwordHash);
    if (!isPasswordSame) {
      existingAdmin.passwordHash = await bcrypt.hash(password, 10);
      existingAdmin.role = 'super_admin';
      existingAdmin.status = 'ACTIVE';
      await existingAdmin.save();
      console.log(`🔄 Super Admin password updated from .env for user: ${cleanUsername}`);
    } else {
      console.log(`ℹ️ Super Admin account is up to date: ${cleanUsername}`);
    }
  }

  if (closeDb) {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedAdmin().then(() => {
    console.log('✨ Seed script completed.');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Seed script error:', err);
    process.exit(1);
  });
}

module.exports = seedAdmin;
