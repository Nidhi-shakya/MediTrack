// ==============================================================================
// Patient Data Privacy & Registration Automated Tests
// [Requirement 3 & 7: Data Privacy & Patient CRUD Tests]
// ==============================================================================

const request = require('supertest');
const app = require('../server');
const storage = require('../services/storageService');

describe('Patient Data Privacy & Registration API', () => {
  let staffToken;

  beforeAll(async () => {
    storage.resetMemoryStoreForTesting();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ role: 'reception', pin: '1234' });
    staffToken = loginRes.body.token;
  });

  // ----------------------------------------------------------------------------
  // [Requirement 3: Patient Data Privacy Protection]
  // ----------------------------------------------------------------------------
  describe('GET /api/patients/public-queue (Public Live Display)', () => {
    it('should be publicly accessible without authentication', async () => {
      const res = await request(app).get('/api/patients/public-queue');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should NOT leak patient phone numbers in public view', async () => {
      const res = await request(app).get('/api/patients/public-queue');

      res.body.data.forEach((item) => {
        expect(item.phone).toBeUndefined();
      });
    });

    it('should NOT leak detailed raw symptoms in public view', async () => {
      const res = await request(app).get('/api/patients/public-queue');

      res.body.data.forEach((item) => {
        expect(item.symptoms).toBeUndefined();
      });
    });

    it('should mask patient names to protect anonymity (e.g. Ramesh S.)', async () => {
      const res = await request(app).get('/api/patients/public-queue');

      const maskedNames = res.body.data.map((p) => p.name);
      expect(maskedNames).toContain('Ramesh S.');
      expect(maskedNames).toContain('Sunita P.');
    });
  });

  // ----------------------------------------------------------------------------
  // [Requirement 7 & 8: Patient Registration & Input Validation]
  // ----------------------------------------------------------------------------
  describe('POST /api/patients (Patient Registration & Token Booking)', () => {
    it('should register a valid patient and return token and triage details', async () => {
      const payload = {
        name: 'Aarav Mehta',
        age: 38,
        gender: 'Male',
        phone: '9876543210',
        temperature: 98.6,
        symptoms: 'Mild headache and sore throat for 2 days',
      };

      const res = await request(app).post('/api/patients').send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokenNumber).toBeDefined();
      expect(res.body.triage).toBeDefined();
      expect(res.body.triage.disclaimer).toBeDefined();
    });

    it('should reject registration when name is shorter than 3 characters (400 Bad Request)', async () => {
      const payload = {
        name: 'Al',
        age: 30,
        gender: 'Male',
        phone: '9876543210',
        temperature: 98.6,
        symptoms: 'General weakness',
      };

      const res = await request(app).post('/api/patients').send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toContain('Patient name must be at least 3 characters long.');
    });

    it('should reject registration with invalid Indian phone number (400 Bad Request)', async () => {
      const payload = {
        name: 'Aarav Mehta',
        age: 30,
        gender: 'Male',
        phone: '1234567890', // Invalid: does not start with 6-9
        temperature: 98.6,
        symptoms: 'Routine checkup',
      };

      const res = await request(app).post('/api/patients').send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with out-of-range temperature (400 Bad Request)', async () => {
      const payload = {
        name: 'Aarav Mehta',
        age: 30,
        gender: 'Male',
        phone: '9876543210',
        temperature: 115.0, // Out of range (max 108)
        symptoms: 'Very high fever',
      };

      const res = await request(app).post('/api/patients').send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with invalid age (400 Bad Request)', async () => {
      const payload = {
        name: 'Aarav Mehta',
        age: 150, // Out of range
        gender: 'Male',
        phone: '9876543210',
        temperature: 98.6,
        symptoms: 'Checkup',
      };

      const res = await request(app).post('/api/patients').send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ----------------------------------------------------------------------------
  // Patient Status Updates
  // ----------------------------------------------------------------------------
  describe('PUT /api/patients/:id (Status Update)', () => {
    it('should update patient status to In-Consultation when authenticated', async () => {
      const res = await request(app)
        .put('/api/patients/65f1a101b1c2d3e4f5a00101')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'In-Consultation' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('In-Consultation');
    });

    it('should reject invalid status string (400 Bad Request)', async () => {
      const res = await request(app)
        .put('/api/patients/65f1a101b1c2d3e4f5a00101')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'DischargedToMoon' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
