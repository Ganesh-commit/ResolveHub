const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const SignupRequest = require('../models/SignupRequest');
const { normalizeRegNo } = require('../utils/normalize');

async function debugStudent() {
  const regArg = process.argv[2] || '241FA07011';
  const cleanReg = normalizeRegNo(regArg);

  console.log(`\n==================================================`);
  console.log(`🔍 DEBUG STUDENT ACCOUNT: "${regArg}" (Normalized: "${cleanReg}")`);
  console.log(`==================================================`);

  const envURI = process.env.MONGODB_URI;
  const isPlaceholder = !envURI || envURI.includes('YOUR_USERNAME') || envURI.includes('cluster0.xxxxx');
  const mongoURI = isPlaceholder ? 'mongodb://127.0.0.1:27017/resolvehub' : envURI;

  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    
    console.log(`📡 Connected DB Host: ${mongoose.connection.host}`);
    console.log(`🗄️ Database Name:   ${mongoose.connection.name}`);
    console.log(`==================================================\n`);

    const userDoc = await User.findOne({ regNo: cleanReg }).lean();
    const requestDoc = await SignupRequest.findOne({ regNo: cleanReg }).lean();

    console.log('👤 USER DOCUMENT IN `users` COLLECTION:');
    if (userDoc) {
      console.log(JSON.stringify(userDoc, null, 2));
    } else {
      console.log('❌ NO USER DOCUMENT FOUND in `users` collection.');
    }

    console.log('\n📝 SIGNUP REQUEST DOCUMENT IN `signuprequests` COLLECTION:');
    if (requestDoc) {
      console.log(JSON.stringify(requestDoc, null, 2));
    } else {
      console.log('❌ NO SIGNUP REQUEST DOCUMENT FOUND in `signuprequests` collection.');
    }

    console.log(`\n==================================================\n`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection or Query Error:', err.message);
    process.exit(1);
  }
}

debugStudent();
