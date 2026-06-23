const mongoose = require('mongoose');
const crypto = require('crypto');

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

  // Email verification — alert emails only sent after recipient confirms
  emailVerified: { type: Boolean, default: false },
  verifyToken: { type: String, default: () => crypto.randomBytes(32).toString('hex') },
  verifyTokenExpires: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24h

  // Unsubscribe — lets alert recipients opt out without needing account access
  unsubscribeToken: { type: String, default: () => crypto.randomBytes(32).toString('hex') },
});

module.exports = mongoose.model('Site', siteSchema);