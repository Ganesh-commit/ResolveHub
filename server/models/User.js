const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  regNo: { type: String, required: true, unique: true, uppercase: true },
  fullName: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  department: { type: String, default: 'CSE' },
  departmentId: { type: String, default: null },
  year: { type: String, default: '1st Year' },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  mustChangePassword: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null },
  status: { type: String, default: 'ACTIVE' },
  activatedAt: { type: String, default: () => new Date().toLocaleString('en-IN') }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
