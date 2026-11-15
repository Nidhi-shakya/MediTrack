// ==============================================================================
// Authentication Automated Tests
// [Requirement 7: Login, Authentication & Invalid Credential Tests]
// ==============================================================================

const request = require('supertest');
const app = require('../server');
const storage = require('../services/storageService');

describe('Authentication API (/api/auth)', () => {
  beforeEach(() => {
    storage.resetMemoryStoreForTesting();
  });

  it('should authenticate reception staff with valid PIN and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ role: 'reception', pin: '1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.role).toBe('reception');
  });

  it('should authenticate doctor with valid PIN and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ role: 'doctor', pin: '1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('doctor');
  });

  it('should reject login with incorrect PIN (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ role: 'reception', pin: '9999' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.token).toBeUndefined();
  });

  it('should reject login request when PIN/password is missing (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ role: 'reception' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return current verified user profile on GET /api/auth/me with valid JWT', async () => {
    // 1. Log in to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ role: 'doctor', pin: '1234' });

    const token = loginRes.body.token;

    // 2. Query /api/auth/me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.role).toBe('doctor');
  });

  it('should reject GET /api/auth/me when token is omitted (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

