const mongoose = require('mongoose');

const signupRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  regNo: { type: String, required: true, uppercase: true },
  fullName: { type: String, required: true },
  email: { type: String, default: '' },
  department: { type: String, default: 'Computer Science & Engineering (CSE)' },
  year: { type: String, default: '1st Year' },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  rejectionReason: { type: String, default: null },
  createdAt: { type: String, default: () => new Date().toLocaleString('en-IN') }
}, { timestamps: true });

module.exports = mongoose.model('SignupRequest', signupRequestSchema);
