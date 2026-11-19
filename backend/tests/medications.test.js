const request = require('supertest');
const app = require('../server');
const storage = require('../services/storageService');

describe('Medication Reminder & Management API (/api/medications)', () => {
  beforeEach(() => {
    storage.resetMemoryStoreForTesting();
  });

  it('should list medications with summary counts and safety disclaimer', async () => {
    const res = await request(app).get('/api/medications');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body).toHaveProperty('disclaimer');
  });

  it('should filter medications by status (e.g. active, expired)', async () => {
    const res = await request(app).get('/api/medications?status=expired');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((med) => {
      expect(med.status).toBe('expired');
    });
  });

  it('should reject creating a medication when name is too short', async () => {
    const res = await request(app)
      .post('/api/medications')
      .send({
        name: 'A',
        dosage: '500mg',
        frequency: 'Once Daily',
        times: ['08:00'],
        startDate: '2026-11-20',
        endDate: '2026-11-25',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/at least 2 characters/i);
  });

  it('should reject creating a medication when dosage is missing', async () => {
    const res = await request(app)
      .post('/api/medications')
      .send({
        name: 'Metformin',
        dosage: '',
        frequency: 'Once Daily',
        times: ['08:00'],
        startDate: '2026-11-20',
        endDate: '2026-11-25',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/dosage is required/i);
  });

  it('should reject creating a medication with invalid reminder time format', async () => {
    const res = await request(app)
      .post('/api/medications')
      .send({
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Once Daily',
        times: ['8pm'],
        startDate: '2026-11-20',
        endDate: '2026-11-25',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid time format/i);
  });

  it('should reject creating a medication when end date is prior to start date', async () => {
    const res = await request(app)
      .post('/api/medications')
      .send({
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Once Daily',
        times: ['08:00'],
        startDate: '2026-11-25',
        endDate: '2026-11-20',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/cannot be prior to start date/i);
  });

  it('should successfully create a valid medication with multiple reminder times', async () => {
    const res = await request(app)
      .post('/api/medications')
      .send({
        name: 'Azithromycin',
        dosage: '500 mg',
        frequency: 'Once Daily',
        times: ['10:00'],
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Take 1 tablet after food.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Azithromycin');
    expect(res.body.data.dosage).toBe('500 mg');
    expect(res.body.data.status).toBe('active');
  });

  it('should retrieve a medication by ID', async () => {
    const listRes = await request(app).get('/api/medications');
    const firstMed = listRes.body.data[0];

    const res = await request(app).get(`/api/medications/${firstMed._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(firstMed._id);
  });

  it('should update an existing medication record', async () => {
    const listRes = await request(app).get('/api/medications');
    const firstMed = listRes.body.data[0];

    const res = await request(app)
      .put(`/api/medications/${firstMed._id}`)
      .send({
        instructions: 'Take with warm water after dinner.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.instructions).toBe('Take with warm water after dinner.');
  });

  it('should record a dose log as Taken or Skipped', async () => {
    const listRes = await request(app).get('/api/medications');
    const firstMed = listRes.body.data[0];
    const todayStr = new Date().toISOString().split('T')[0];

    const resTaken = await request(app)
      .post(`/api/medications/${firstMed._id}/dose`)
      .send({
        date: todayStr,
        time: '08:00',
        status: 'Taken',
      });

    expect(resTaken.status).toBe(200);
    expect(resTaken.body.success).toBe(true);
    expect(resTaken.body.data.logs.some((l) => l.date === todayStr && l.status === 'Taken')).toBe(
      true
    );

    const resSkipped = await request(app)
      .post(`/api/medications/${firstMed._id}/dose`)
      .send({
        date: todayStr,
        time: '20:00',
        status: 'Skipped',
      });

    expect(resSkipped.status).toBe(200);
    expect(resSkipped.body.success).toBe(true);
    expect(
      resSkipped.body.data.logs.some((l) => l.date === todayStr && l.status === 'Skipped')
    ).toBe(true);
  });

  it('should delete a medication record', async () => {
    const createRes = await request(app)
      .post('/api/medications')
      .send({
        name: 'Temporary Med',
        dosage: '10mg',
        frequency: 'Once Daily',
        times: ['12:00'],
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });

    const medId = createRes.body.data._id;

    const delRes = await request(app).delete(`/api/medications/${medId}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    const checkRes = await request(app).get(`/api/medications/${medId}`);
    expect(checkRes.status).toBe(404);
  });
});
