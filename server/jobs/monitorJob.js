const cron = require('node-cron');
const Site = require('../models/Site');
const { scrapeText } = require('../services/scraper');
const { generateHash } = require('../services/hashService');
const { hasChanged } = require('../services/diffChecker');
const { sendChangeAlert } = require('../services/mailService');

const checkSite = async (site) => {
  try {
    const text = await scrapeText(site.url);
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
      try {
        await sendChangeAlert(site.email, site.url, site.lastChecked, snapshot);
      } catch (e) {
        console.error(`[Mail] ${site.url}: ${e.message}`);
      }
      console.log(`[Monitor] Change detected: ${site.url}`);
    } else {
      site.status = 'active';
      if (!site.lastContentHash) site.lastContentHash = newHash;
      await site.save();
      console.log(`[Monitor] No change: ${site.url}`);
    }
  } catch (err) {
    site.totalChecks += 1;
    site.lastChecked = new Date();
    site.status = 'unreachable';
    await site.save();
    console.error(`[Monitor] Failed after retries: ${site.url}: ${err.message}`);
  }
};

const startMonitorJob = () => {
  cron.schedule('0 * * * *', async () => {
    const now = new Date();
    console.log(`[Cron] Running checks at hour ${now.getHours()}`);
    try {
      const sites = await Site.find();
      for (const site of sites) {
        if (site.checkInterval === 1) { await checkSite(site); continue; }
        if (!site.lastChecked) { await checkSite(site); continue; }
        const hoursSinceLast = (now - new Date(site.lastChecked)) / (1000 * 60 * 60);
        if (hoursSinceLast >= site.checkInterval) await checkSite(site);
      }
    } catch (err) {
      console.error('[Cron] Error:', err.message);
    }
  });
  console.log('[Cron] Monitor job scheduled (runs hourly)');
};

module.exports = { startMonitorJob };