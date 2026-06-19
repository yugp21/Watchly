const mongoose = require('mongoose');
 
const changeEventSchema = new mongoose.Schema({
  detectedAt: { type: Date, default: Date.now },
  emailSent: { type: Boolean, default: false },
  snapshot: { type: String, default: null },
});
 
const siteSchema = new mongoose.Schema({
  accountUsername: { type: String, required: true, index: true },
  label: { type: String, default: '', maxlength: 60 },
  url: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  checkInterval: { type: Number, required: true, enum: [1, 6, 12, 24], default: 24 },
  lastContentHash: { type: String, default: null },
  lastChecked: { type: Date, default: null },
  status: { type: String, enum: ['active', 'changed', 'unreachable'], default: 'active' },
  totalChecks: { type: Number, default: 0 },
  totalChanges: { type: Number, default: 0 },
  changeHistory: { type: [changeEventSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});
 
module.exports = mongoose.model('Site', siteSchema);