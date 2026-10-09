const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  timestamp: { type: String, default: () => new Date().toLocaleString('en-IN') },
  author: { type: String, required: true, index: true },
  role: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, default: '' }
}, { timestamps: true });

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
