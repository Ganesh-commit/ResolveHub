const mongoose = require('mongoose');

const timelineStepSchema = new mongoose.Schema({
  stepKey: {
    type: String,
    enum: ['submitted', 'assigned', 'in_progress', 'resolved'],
    required: true
  },
  title: { type: String, required: true },
  timestamp: { type: Date, default: null },
  completed: { type: Boolean, default: false },
  note: { type: String, default: '' },
  actor: {
    name: { type: String, default: '' },
    role: { type: String, default: '' }
  }
});

const ticketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true, index: true },
  department: { type: String, required: true, index: true },
  departmentId: { type: String, default: null },
  urgency: { type: String, default: 'medium' },
  priority: { type: String, default: 'Medium' },
  status: { type: String, default: 'Submitted', index: true },
  slaStatus: { type: String, default: 'normal' },
  
  // ── Anonymous Reporting Mode (Anti-Ragging & Welfare) ──
  isAnonymous: { type: Boolean, default: false },
  anonymousAlias: { type: String, default: 'Anonymous Student' },

  // ── Campus Location & Zone Heatmap Fields ──
  locationId: { type: String, default: null },
  zone: { 
    type: String, 
    enum: ['Hostels', 'Academic', 'Library', 'Administration', 'Food', 'Sports', 'Transport', 'Common Areas', 'Online / No location'],
    default: 'Online / No location'
  },
  hostelBlock: { 
    type: String, 
    default: 'General / Campus' 
  },
  location: { type: String, default: '' },

  // ── Post-Resolution Ratings & Re-opening ──
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingFeedback: { type: String, default: '' },
  isReopened: { type: Boolean, default: false },
  reopenReason: { type: String, default: '' },
  reopenedAt: { type: Date, default: null },

  // ── AI Auto-Categorization & Priority Engine ──
  aiSuggestedCategory: { type: String, default: '' },
  aiSuggestedPriority: { type: String, default: '' },
  aiSuggestedDept: { type: String, default: '' },
  duplicateClusterId: { type: String, default: null },

  // ── SLA Auto-Escalation Fields ──
  slaDeadline: { type: Date, default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
  escalationLevel: {
    type: String,
    enum: ['LEVEL_0_STAFF', 'LEVEL_1_HOD', 'LEVEL_2_DEAN'],
    default: 'LEVEL_0_STAFF'
  },
  isEscalated: { type: Boolean, default: false },
  escalatedAt: { type: Date, default: null },
  escalationReason: { type: String, default: '' },

  // ── Status Stepper Timeline ──
  timeline: {
    type: [timelineStepSchema],
    default: function() {
      const now = new Date();
      return [
        { stepKey: 'submitted', title: 'Submitted', timestamp: now, completed: true, note: 'Grievance submitted successfully' },
        { stepKey: 'assigned', title: 'Assigned to Specialist', timestamp: null, completed: false, note: 'Awaiting technician assignment' },
        { stepKey: 'in_progress', title: 'Under Investigation', timestamp: null, completed: false, note: 'Field technician inspection' },
        { stepKey: 'resolved', title: 'Resolved & Signed', timestamp: null, completed: false, note: 'Resolution verified and closed' }
      ];
    }
  },

  description: { type: String, required: true },
  complainant: {
    regNo: { type: String, required: true, index: true },
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
    department: { type: String, default: null },
    departmentId: { type: String, default: null }
  },
  responseRemarks: { type: String, default: '' },
  eta: { type: String, default: '3 Business Days (SLA Target)' },
  etaMinutesLeft: { type: Number, default: 4320 },
  currentStepIndex: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toLocaleString('en-IN'), index: true },
  updatedAt: { type: String, default: () => new Date().toLocaleString('en-IN') },
  attachments: [{
    id: { type: String },
    name: { type: String },
    originalName: { type: String },
    fileName: { type: String },
    url: { type: String },
    type: { type: String },
    mimeType: { type: String },
    size: { type: String },
    uploadedAt: { type: String }
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

ticketSchema.index({ 'complainant.regNo': 1, status: 1 });
ticketSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
