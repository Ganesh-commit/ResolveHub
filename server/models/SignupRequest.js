const mongoose = require('mongoose');

const signupRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  regNo: { type: String, required: true, uppercase: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, default: '', index: true },
  phone: { type: String, default: '' },
  department: { type: String, default: 'Computer Science & Engineering (CSE)' },
  year: { type: String, default: '1st Year' },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
  rejectionReason: { type: String, default: null },
  createdAt: { type: String, default: () => new Date().toLocaleString('en-IN'), index: true }
}, { timestamps: true });

signupRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SignupRequest', signupRequestSchema);
