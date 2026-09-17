const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'dept_admin'], default: 'dept_admin' },
  department: { type: String, default: 'All Departments' },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: String, default: () => new Date().toLocaleString('en-IN') }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
