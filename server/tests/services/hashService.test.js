const { generateHash } = require('../../services/hashService');

describe('hashService', () => {
  it('returns a 64-character hex SHA-256 hash', () => {
    const hash = generateHash('hello world');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces the same hash for the same input', () => {
    expect(generateHash('abc')).toBe(generateHash('abc'));
  });

  it('produces different hashes for different input', () => {
    expect(generateHash('abc')).not.toBe(generateHash('abd'));
  });
});