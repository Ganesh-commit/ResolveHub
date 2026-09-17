const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  department: { type: String, required: true },
  urgency: { type: String, default: 'medium' },
  priority: { type: String, default: 'Medium' },
  status: { type: String, default: 'new' },
  slaStatus: { type: String, default: 'normal' },
  location: { type: String, default: '' },
  description: { type: String, required: true },
  complainant: {
    regNo: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    role: { type: String, default: 'Student' },
    department: { type: String, default: '' }
  },
  submittedBy: { type: String, default: '' },
  assignedAgent: {
    name: { type: String, default: null },
    role: { type: String, default: null },
    phone: { type: String, default: null },
    department: { type: String, default: null }
  },
  responseRemarks: { type: String, default: '' },
  eta: { type: String, default: 'Assessing ETA...' },
  etaMinutesLeft: { type: Number, default: 480 },
  currentStepIndex: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toLocaleString('en-IN') },
  updatedAt: { type: String, default: () => new Date().toLocaleString('en-IN') },
  attachments: [{
    id: { type: String },
    name: { type: String },
    size: { type: String },
    type: { type: String }
  }],
  auditLogs: [{
    id: { type: String },
    timestamp: { type: String },
    author: { type: String },
    role: { type: String },
    action: { type: String },
    note: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
