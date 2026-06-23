const validator = require('validator');
const Site = require('../models/Site');
const Account = require('../models/Account');
const { scrapeText } = require('../services/scraper');
const { generateHash } = require('../services/hashService');
const { hasChanged } = require('../services/diffChecker');
const { sendChangeAlert } = require('../services/mailService');

const MAX_MONITORS_PER_ACCOUNT = 20;
const VALID_INTERVALS = [1, 6, 12, 24];

// Strips HTML/script tags from label to prevent stored XSS
const sanitizeLabel = (label) =>
  (label || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`]/g, '')
    .trim()
    .slice(0, 60);

// GET /api/sites — paginated
const getAllSites = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [sites, total] = await Promise.all([
      Site.find({ accountUsername: req.username })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Site.countDocuments({ accountUsername: req.username }),
    ]);

    res.json({
      success: true,
      data: sites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[GET /sites]', err.message);
    res.status(500).json({ success: false, message: 'Could not load monitors.' });
  }
};

// POST /api/sites
const addSite = async (req, res) => {
  try {
    let { url, email, checkInterval, label } = req.body;

    if (!url || !email || !checkInterval) {
      return res.status(400).json({ success: false, message: 'url, email and checkInterval are required.' });
    }

    url = url.trim();
    email = email.trim().toLowerCase();
    label = sanitizeLabel(label);

    if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL starting with http:// or https://' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (!VALID_INTERVALS.includes(Number(checkInterval))) {
      return res.status(400).json({ success: false, message: 'Check interval must be 1, 6, 12 or 24 hours.' });
    }

    const count = await Site.countDocuments({ accountUsername: req.username });
    if (count >= MAX_MONITORS_PER_ACCOUNT) {
      return res.status(403).json({
        success: false,
        message: `You've reached the limit of ${MAX_MONITORS_PER_ACCOUNT} monitors per account. Delete one to add another.`,
      });
    }

    const duplicate = await Site.findOne({ accountUsername: req.username, url });
    if (duplicate) {
      return res.status(409).json({ success: false, message: 'You are already monitoring this URL.' });
    }

    let lastContentHash = null;
    try {
      const text = await scrapeText(url);
      lastContentHash = generateHash(text);
    } catch (e) {
      // Scrape failed on add — site saved as unreachable, will retry on next cron tick
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`[Scraper] Initial scrape failed for ${url}: ${e.message}`);
      }
    }

    const site = await Site.create({
      accountUsername: req.username,
      label,
      url,
      email,
      checkInterval: Number(checkInterval),
      lastContentHash,
      lastChecked: lastContentHash ? new Date() : null,
      totalChecks: lastContentHash ? 1 : 0,
      status: lastContentHash ? 'active' : 'unreachable',
    });

    res.status(201).json({ success: true, data: site });
  } catch (err) {
    console.error('[POST /sites]', err.message);
    res.status(500).json({ success: false, message: 'Could not add monitor.' });
  }
};

// PUT /api/sites/:id — update label, email, checkInterval
const updateSite = async (req, res) => {
  try {
    const site = await Site.findOne({ _id: req.params.id, accountUsername: req.username });
    if (!site) return res.status(404).json({ success: false, message: 'Site not found.' });

    const { email, checkInterval, label } = req.body;

    if (email !== undefined) {
      const cleaned = email.trim().toLowerCase();
      if (!validator.isEmail(cleaned)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      }
      site.email = cleaned;
    }

    if (checkInterval !== undefined) {
      if (!VALID_INTERVALS.includes(Number(checkInterval))) {
        return res.status(400).json({ success: false, message: 'Check interval must be 1, 6, 12 or 24 hours.' });
      }
      site.checkInterval = Number(checkInterval);
    }

    if (label !== undefined) {
      site.label = sanitizeLabel(label);
    }

    await site.save();
    res.json({ success: true, data: site });
  } catch (err) {
    console.error('[PUT /sites]', err.message);
    res.status(500).json({ success: false, message: 'Could not update monitor.' });
  }
};

// DELETE /api/sites/:id
const deleteSite = async (req, res) => {
  try {
    const site = await Site.findOneAndDelete({ _id: req.params.id, accountUsername: req.username });
    if (!site) return res.status(404).json({ success: false, message: 'Site not found.' });
    res.json({ success: true, message: 'Monitor deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not delete monitor.' });
  }
};

// POST /api/sites/check-now/:id
const checkNow = async (req, res) => {
  try {
    const site = await Site.findOne({ _id: req.params.id, accountUsername: req.username });
    if (!site) return res.status(404).json({ success: false, message: 'Site not found.' });

    let text;
    try {
      text = await scrapeText(site.url);
    } catch (e) {
      site.lastChecked = new Date();
      site.totalChecks += 1;
      site.status = 'unreachable';
      await site.save();
      return res.json({ success: true, changed: false, unreachable: true, data: site });
    }

    const newHash = generateHash(text);
    const changed = hasChanged(site.lastContentHash, newHash);
    site.totalChecks += 1;
    site.lastChecked = new Date();

    if (changed) {
      site.status = 'changed';
      site.lastContentHash = newHash;
      site.totalChanges += 1;
      const snapshot = text.slice(0, 300).trim();
      site.changeHistory.unshift({ detectedAt: new Date(), emailSent: true, snapshot });
      if (site.changeHistory.length > 10) site.changeHistory = site.changeHistory.slice(0, 10);
      await site.save();
      try { await sendChangeAlert(site.email, site.url, site.lastChecked, snapshot); } catch (_) {}
      return res.json({ success: true, changed: true, data: site });
    }

    site.status = 'active';
    if (!site.lastContentHash) site.lastContentHash = newHash;
    await site.save();
    res.json({ success: true, changed: false, data: site });
  } catch (err) {
    console.error('[check-now]', err.message);
    res.status(500).json({ success: false, message: 'Could not check site.' });
  }
};

module.exports = { getAllSites, addSite, updateSite, deleteSite, checkNow, MAX_MONITORS_PER_ACCOUNT };