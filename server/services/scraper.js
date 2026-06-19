const axios = require('axios');
const cheerio = require('cheerio');
const dns = require('dns').promises;
const net = require('net');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
];

const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Block private/internal/reserved IP ranges — prevents SSRF attacks
// (e.g. someone monitoring http://localhost, http://169.254.169.254/, internal LAN IPs)
const isPrivateIP = (ip) => {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 127) return true; // loopback
    if (parts[0] === 169 && parts[1] === 254) return true; // link-local / cloud metadata
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
    if (parts[0] === 0) return true; // 0.0.0.0/8
    return false;
  }
  if (net.isIPv6(ip)) {
    if (ip === '::1') return true; // loopback
    if (ip.toLowerCase().startsWith('fe80')) return true; // link-local
    if (ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd')) return true; // unique local
    return false;
  }
  return false;
};

const assertPublicUrl = async (urlString) => {
  const parsed = new URL(urlString);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs are allowed.');
  }

  const hostname = parsed.hostname;

  if (hostname === 'localhost' || hostname.endsWith('.local')) {
    throw new Error('Cannot monitor local/internal addresses.');
  }

  // Resolve hostname to IP and check it's not private — blocks DNS-rebinding too
  try {
    const { address } = await dns.lookup(hostname);
    if (isPrivateIP(address)) {
      throw new Error('Cannot monitor private/internal network addresses.');
    }
  } catch (err) {
    if (err.message.includes('private')) throw err;
    throw new Error('Could not resolve hostname.');
  }
};

const fetchWithRetry = async (url, retries = 3, delay = 2000) => {
  await assertPublicUrl(url); // SSRF guard — runs before every fetch, including retries-triggering scrapes

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 20000,
        maxRedirects: 5,
        headers: {
          'User-Agent': randomUA(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        validateStatus: (status) => status < 500,
        maxContentLength: 5 * 1024 * 1024, // 5MB cap — prevents memory abuse from huge responses
      });
      return response;
    } catch (err) {
      lastError = err;
      console.warn(`[Scraper] Attempt ${attempt}/${retries} failed for ${url}: ${err.message}`);
      if (attempt < retries) await sleep(delay);
    }
  }
  throw lastError;
};

const scrapeText = async (url) => {
  const response = await fetchWithRetry(url);

  const $ = cheerio.load(response.data);
  $('script, style, noscript, svg, img, head, meta, link, iframe, nav, footer, [aria-hidden="true"]').remove();

  const lines = [];
  $('h1, h2, h3, h4, p, li, a, span, div').each((_, el) => {
    const text = $(el).clone().children().remove().end().text().trim();
    if (text.length > 20 && text.length < 300) lines.push(text);
  });

  const seen = new Set();
  const unique = lines.filter(line => {
    if (seen.has(line)) return false;
    seen.add(line);
    return true;
  });

  const result = unique.join(' • ').replace(/\s+/g, ' ').trim();

  if (!result || result.length < 50) {
    throw new Error('Page returned no readable content (may require login or JavaScript)');
  }

  return result;
};

module.exports = { scrapeText };