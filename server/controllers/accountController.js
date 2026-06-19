const crypto = require('crypto');
const validator = require('validator');
const Account = require('../models/Account');
const Site = require('../models/Site');

const generateUsername = () => {
  const adj = ['swift','calm','bright','silent','bold','cool','sharp','light','quick','keen','soft','warm'];
  const animals = ['fox','hawk','wolf','lynx','bear','crane','deer','owl','raven','fish','tiger','panda'];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj[Math.floor(Math.random()*adj.length)]}-${animals[Math.floor(Math.random()*animals.length)]}-${num}`;
};

const generateToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const isValidUsername = (username) => /^[a-zA-Z0-9_-]{3,30}$/.test(username);

// POST /api/accounts/create
const createAccount = async (req, res) => {
  try {
    let { username, recoveryEmail } = req.body;
    if (!username || !username.trim()) {
      username = generateUsername();
    } else {
      username = username.trim();
      if (!isValidUsername(username)) {
        return res.status(400).json({ success: false, message: 'Username must be 3-30 characters: letters, numbers, hyphens, underscores only.' });
      }
    }

    if (recoveryEmail) {
      recoveryEmail = recoveryEmail.trim().toLowerCase();
      if (!validator.isEmail(recoveryEmail)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid recovery email.' });
      }
    }

    const exists = await Account.findOne({ username });
    if (exists) return res.status(409).json({ success: false, message: 'Username already taken. Try another.' });

    const rawToken = generateToken();
    await Account.create({ username, token: hashToken(rawToken), recoveryEmail: recoveryEmail || null });

    res.status(201).json({ success: true, data: { username, token: rawToken } });
  } catch (err) {
    console.error('[createAccount]', err.message);
    res.status(500).json({ success: false, message: 'Could not create account.' });
  }
};

// POST /api/accounts/import
const importAccount = async (req, res) => {
  try {
    const { username, token } = req.body;
    if (!username || !token) return res.status(400).json({ success: false, message: 'Username and token are required.' });

    const account = await Account.findOne({ username: username.trim(), token: hashToken(token.trim()) });
    if (!account) return res.status(401).json({ success: false, message: 'Invalid username or token.' });

    res.json({ success: true, data: { username: account.username, token: token.trim() } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not import account.' });
  }
};

// PATCH /api/accounts/rename
const renameAccount = async (req, res) => {
  try {
    const { username, token, newUsername } = req.body;
    if (!username || !token || !newUsername) {
      return res.status(400).json({ success: false, message: 'username, token and newUsername are required.' });
    }
    if (!isValidUsername(newUsername.trim())) {
      return res.status(400).json({ success: false, message: 'Username must be 3-30 characters: letters, numbers, hyphens, underscores only.' });
    }

    const account = await Account.findOne({ username: username.trim(), token: hashToken(token.trim()) });
    if (!account) return res.status(401).json({ success: false, message: 'Invalid username or token.' });

    const taken = await Account.findOne({ username: newUsername.trim() });
    if (taken) return res.status(409).json({ success: false, message: 'Username already taken. Try another.' });

    account.username = newUsername.trim();
    await account.save();
    await Site.updateMany({ accountUsername: username.trim() }, { accountUsername: newUsername.trim() });

    res.json({ success: true, data: { username: account.username, token: token.trim() } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not rename account.' });
  }
};

// DELETE /api/accounts/delete — self-service account deletion
const deleteAccount = async (req, res) => {
  try {
    const { username, token } = req.body;
    if (!username || !token) return res.status(400).json({ success: false, message: 'Username and token are required.' });

    const account = await Account.findOne({ username: username.trim(), token: hashToken(token.trim()) });
    if (!account) return res.status(401).json({ success: false, message: 'Invalid username or token.' });

    // Delete all monitors belonging to this account, then the account itself
    await Site.deleteMany({ accountUsername: account.username });
    await account.deleteOne();

    res.json({ success: true, message: 'Account and all monitors permanently deleted.' });
  } catch (err) {
    console.error('[deleteAccount]', err.message);
    res.status(500).json({ success: false, message: 'Could not delete account.' });
  }
};

module.exports = { createAccount, importAccount, renameAccount, deleteAccount };