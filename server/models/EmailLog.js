const mongoose = require('mongoose');

// Tracks emails sent per recipient per day — prevents Watchly being used to spam strangers
const emailLogSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  sentAt: { type: Date, default: Date.now },  // removed index: true here — covered by .index() below
});

// Auto-delete logs older than 2 days — keeps collection small
emailLogSchema.index({ sentAt: 1 }, { expireAfterSeconds: 172800 });

module.exports = mongoose.model('EmailLog', emailLogSchema);