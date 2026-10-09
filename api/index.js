const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const { app } = require('../server/index.js');
const { connectDB } = require('../server/db.js');

// Ensure DNS fallback for MongoDB Atlas in serverless environment
dns.setServers(['8.8.8.8', '1.1.1.1']);

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (e) {
      console.error('Vercel DB connection note:', e.message);
    }
  }
  return app(req, res);
};
