const { scrapeText, assertPublicUrl, isPrivateIP } = require('../../services/scraper');

describe('isPrivateIP', () => {
  it('flags 10.x.x.x as private', () => {
    expect(isPrivateIP('10.0.0.5')).toBe(true);
  });
  it('flags 127.x.x.x as private', () => {
    expect(isPrivateIP('127.0.0.1')).toBe(true);
  });
  it('flags 169.254.x.x (cloud metadata) as private', () => {
    expect(isPrivateIP('169.254.169.254')).toBe(true);
  });
  it('flags 172.16-31.x.x as private', () => {
    expect(isPrivateIP('172.20.0.1')).toBe(true);
  });
  it('flags 192.168.x.x as private', () => {
    expect(isPrivateIP('192.168.1.1')).toBe(true);
  });
  it('flags IPv6 loopback (::1) as private', () => {
    expect(isPrivateIP('::1')).toBe(true);
  });
  it('does not flag a public IP', () => {
    expect(isPrivateIP('8.8.8.8')).toBe(false);
  });
});

describe('assertPublicUrl', () => {
  it('rejects localhost', async () => {
    await expect(assertPublicUrl('http://localhost:5000')).rejects.toThrow(/local|internal/i);
  });
  it('rejects .local addresses', async () => {
    await expect(assertPublicUrl('http://myserver.local')).rejects.toThrow(/local|internal/i);
  });
  it('rejects non-http(s) protocols', async () => {
    await expect(assertPublicUrl('ftp://example.com')).rejects.toThrow(/http and https/i);
  });
});

describe('scrapeText', () => {
  it('rejects SSRF-blocked URLs before attempting any fetch', async () => {
    await expect(scrapeText('http://localhost')).rejects.toThrow(/local|internal/i);
  });
});