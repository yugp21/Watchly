const mongoose = require('mongoose');
 
const accountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens and underscores'],
  },
  token: { type: String, required: true }, // SHA-256 hash
  recoveryEmail: { type: String, default: null, trim: true, lowercase: true },
  createdAt: { type: Date, default: Date.now },
});
 
module.exports = mongoose.model('Account', accountSchema);