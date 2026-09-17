const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  key: { type: String, default: 'global_settings', unique: true },
  categories: [{ type: String }],
  departments: [{ type: String }],
  priorities: [{ type: String }],
  slaHours: {
    critical: { type: Number, default: 2 },
    high: { type: Number, default: 4 },
    medium: { type: Number, default: 8 },
    low: { type: Number, default: 24 }
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
