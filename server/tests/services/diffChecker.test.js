const { hasChanged } = require('../../services/diffChecker');

describe('diffChecker.hasChanged', () => {
  it('returns false when there is no baseline hash (first check)', () => {
    expect(hasChanged(null, 'somehash')).toBe(false);
  });

  it('returns false when hashes match', () => {
    expect(hasChanged('abc123', 'abc123')).toBe(false);
  });

  it('returns true when hashes differ', () => {
    expect(hasChanged('abc123', 'def456')).toBe(true);
  });
});