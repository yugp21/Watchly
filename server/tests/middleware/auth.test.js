require('../setupTestDB');
const crypto = require('crypto');
const { authenticate } = require('../../middleware/auth');
const Account = require('../../models/Account');

const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authenticate middleware', () => {
  it('rejects missing Authorization header', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects malformed header (no Bearer prefix)', async () => {
    const req = { headers: { authorization: 'foo:bar' } };
    const res = mockRes();
    const next = jest.fn();
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects header missing colon separator', async () => {
    const req = { headers: { authorization: 'Bearer justtoken' } };
    const res = mockRes();
    const next = jest.fn();
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects valid format but unknown credentials', async () => {
    const req = { headers: { authorization: 'Bearer ghost:faketoken' } };
    const res = mockRes();
    const next = jest.fn();
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('calls next() and attaches req.username for valid credentials', async () => {
    const rawToken = 'realtoken123';
    await Account.create({ username: 'tester', token: hashToken(rawToken) });

    const req = { headers: { authorization: `Bearer tester:${rawToken}` } };
    const res = mockRes();
    const next = jest.fn();
    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.username).toBe('tester');
  });
});