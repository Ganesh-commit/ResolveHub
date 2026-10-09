const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  regNo: { type: String, required: true, unique: true, uppercase: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, default: '', index: true },
  phone: { type: String, default: '' },
  department: { type: String, default: 'CSE', index: true },
  departmentId: { type: String, default: null },
  year: { type: String, default: '1st Year' },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  mustChangePassword: { type: Boolean, default: false },
  failedAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null },
  status: { type: String, default: 'ACTIVE', index: true },
  activatedAt: { type: String, default: () => new Date().toLocaleString('en-IN') }
}, { timestamps: true });

userSchema.index({ regNo: 1, email: 1 });

module.exports = mongoose.model('User', userSchema);
