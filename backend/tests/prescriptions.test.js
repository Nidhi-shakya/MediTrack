// ==============================================================================
// Prescription Creation & Doctor Workflow Automated Tests
// [Requirement 7: Prescription Creation & Consultation Completion Tests]
// ==============================================================================

const request = require('supertest');
const app = require('../server');
const storage = require('../services/storageService');

describe('Prescriptions API (/api/prescriptions)', () => {
  let doctorToken;

  beforeAll(async () => {
    storage.resetMemoryStoreForTesting();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ role: 'doctor', pin: '1234' });
    doctorToken = loginRes.body.token;
  });

  it('should allow authorized doctor to issue a digital prescription and auto-complete patient', async () => {
    const rxPayload = {
      patientId: '65f1a101b1c2d3e4f5a00103', // Priya Kaur
      diagnosis: 'Acute Viral Pharyngitis with Mild Dehydration',
      medicines: [
        { medicineName: 'Paracetamol 650mg', dosage: '1-0-1', duration: '3 Days' },
        { medicineName: 'Vitamin C 500mg', dosage: '1-0-0', duration: '7 Days' },
      ],
      notes: 'Adequate hydration and saline gargles.',
    };

    const res = await request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(rxPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.diagnosis).toBe(rxPayload.diagnosis);
    expect(res.body.data.medicines.length).toBe(2);

    // Verify patient status was automatically changed to Completed
    const patientRes = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`);

    const updatedPatient = patientRes.body.data.find(
      (p) => String(p._id) === '65f1a101b1c2d3e4f5a00103'
    );
    expect(updatedPatient.status).toBe('Completed');
  });

  it('should reject prescription when clinical diagnosis is missing (400 Bad Request)', async () => {
    const invalidPayload = {
      patientId: '65f1a101b1c2d3e4f5a00101',
      diagnosis: '',
      medicines: [{ medicineName: 'Azithromycin', dosage: '1-0-0', duration: '3 Days' }],
    };

    const res = await request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(invalidPayload);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject prescription when medicines array is empty (400 Bad Request)', async () => {
    const invalidPayload = {
      patientId: '65f1a101b1c2d3e4f5a00101',
      diagnosis: 'Tension Headache',
      medicines: [],
    };

    const res = await request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(invalidPayload);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should retrieve all issued prescriptions when authenticated', async () => {
    const res = await request(app)
      .get('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
