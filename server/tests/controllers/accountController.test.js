require('../setupTestDB');
const request = require('supertest');
const app = require('../../app');
const Account = require('../../models/Account');

describe('Account API', () => {
  describe('POST /api/accounts/create', () => {
    it('creates an account with auto-generated username when none given', async () => {
      const res = await request(app).post('/api/accounts/create').send({});
      expect(res.status).toBe(201);
      expect(res.body.data.username).toMatch(/^[a-z]+-[a-z]+-\d+$/);
      expect(res.body.data.token).toHaveLength(64);
    });

    it('rejects invalid username format', async () => {
      const res = await request(app).post('/api/accounts/create').send({ username: 'a' });
      expect(res.status).toBe(400);
    });

    it('rejects duplicate username', async () => {
      await request(app).post('/api/accounts/create').send({ username: 'dupeuser' });
      const res = await request(app).post('/api/accounts/create').send({ username: 'dupeuser' });
      expect(res.status).toBe(409);
    });

    it('rejects invalid recovery email', async () => {
      const res = await request(app)
        .post('/api/accounts/create')
        .send({ username: 'validname', recoveryEmail: 'not-an-email' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/accounts/import', () => {
    it('returns 400 if username or token missing', async () => {
      const res = await request(app).post('/api/accounts/import').send({ username: 'x' });
      expect(res.status).toBe(400);
    });

    it('returns 401 for wrong token', async () => {
      await request(app).post('/api/accounts/create').send({ username: 'importtest' });
      const res = await request(app)
        .post('/api/accounts/import')
        .send({ username: 'importtest', token: 'wrongtoken' });
      expect(res.status).toBe(401);
    });

    it('successfully imports with correct credentials', async () => {
      const create = await request(app).post('/api/accounts/create').send({ username: 'importok' });
      const { token } = create.body.data;
      const res = await request(app)
        .post('/api/accounts/import')
        .send({ username: 'importok', token });
      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe('importok');
    });
  });

  describe('DELETE /api/accounts/delete', () => {
    it('deletes the account and its sites', async () => {
      const create = await request(app).post('/api/accounts/create').send({ username: 'deleteme' });
      const { token } = create.body.data;
      const res = await request(app)
        .delete('/api/accounts/delete')
        .send({ username: 'deleteme', token });
      expect(res.status).toBe(200);

      const found = await Account.findOne({ username: 'deleteme' });
      expect(found).toBeNull();
    });
  });
});