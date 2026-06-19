const crypto = require('crypto');
const Account = require('../models/Account');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization header missing.', code: 'UNAUTHORIZED' });
    }

    const credentials = authHeader.slice(7);
    const colonIndex = credentials.indexOf(':');
    if (colonIndex === -1) {
      return res.status(401).json({ success: false, message: 'Invalid authorization format.', code: 'UNAUTHORIZED' });
    }

    const username = credentials.slice(0, colonIndex);
    const rawToken = credentials.slice(colonIndex + 1);

    if (!username || !rawToken) {
      return res.status(401).json({ success: false, message: 'Username and token required.', code: 'UNAUTHORIZED' });
    }

    const account = await Account.findOne({ username, token: hashToken(rawToken) });
    if (!account) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.', code: 'UNAUTHORIZED' });
    }

    req.account = account;
    req.username = username;
    next();
  } catch (err) {
    console.error('[Auth]', err.message);
    res.status(500).json({ success: false, message: 'Auth error.', code: 'SERVER_ERROR' });
  }
};

module.exports = { authenticate };