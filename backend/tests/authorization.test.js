const request = require('supertest');
const app = require('../server');
const storage = require('../services/storageService');

describe('Authorization & RBAC Middleware (/api)', () => {
  let receptionToken;
  let doctorToken;

  beforeAll(async () => {
    storage.resetMemoryStoreForTesting();

    const recRes = await request(app)
      .post('/api/auth/login')
      .send({ role: 'reception', pin: '1234' });
    receptionToken = recRes.body.token;

    const docRes = await request(app)
      .post('/api/auth/login')
      .send({ role: 'doctor', pin: '1234' });
    doctorToken = docRes.body.token;
  });

  it('should block unauthenticated access to full patients list (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/patients');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should block access with malformed Authorization header (401 Unauthorized)', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', 'InvalidFormatHeaderWithoutBearer');

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('MALFORMED_AUTH_HEADER');
  });

  it('should block access with invalid signature JWT token (401 Unauthorized)', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidTokenPayload.signature');

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });

  it('should allow authenticated staff (reception) to access full patients list', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${receptionToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should allow authenticated doctor to access full patients list', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should forbid reception staff from issuing prescriptions (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${receptionToken}`)
      .send({
        patientId: '65f1a101b1c2d3e4f5a00101',
        diagnosis: 'Mild Bronchitis',
        medicines: [{ medicineName: 'Amoxicillin', dosage: '1-0-1', duration: '5 Days' }],
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('FORBIDDEN_INSUFFICIENT_ROLE');
  });

  it('should forbid doctor from deleting patient records from queue (403 Forbidden)', async () => {
    const res = await request(app)
      .delete('/api/patients/65f1a101b1c2d3e4f5a00104')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('FORBIDDEN_INSUFFICIENT_ROLE');
  });

  it('should allow reception staff to delete patient records (200 OK)', async () => {
    const res = await request(app)
      .delete('/api/patients/65f1a101b1c2d3e4f5a00104')
      .set('Authorization', `Bearer ${receptionToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

