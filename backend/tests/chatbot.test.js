const request = require('supertest');
const app = require('../server');

describe('AI Healthcare Chatbot API (/api/chat)', () => {
  it('should return educational answer and safety disclaimer for a valid inquiry', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'How should I take care of myself during a mild seasonal fever?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('reply');
    expect(typeof res.body.data.reply).toBe('string');
    expect(res.body.data.isEmergency).toBe(false);
    expect(res.body.data).toHaveProperty('disclaimer');
    expect(res.body.data.disclaimer).toMatch(/general healthcare education/i);
  });

  it('should answer "What is a blood pressure reading?" accurately', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'What is a blood pressure reading?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toMatch(/Systolic/i);
    expect(res.body.data.reply).toMatch(/Diastolic/i);
    expect(res.body.data.reply).toMatch(/120\/80/);
    expect(res.body.data.isEmergency).toBe(false);
  });

  it('should answer "How can I maintain a healthy lifestyle?" accurately', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'How can I maintain a healthy lifestyle?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toMatch(/Balanced Nutrition/i);
    expect(res.body.data.reply).toMatch(/Physical Activity/i);
    expect(res.body.data.reply).toMatch(/Sleep/i);
  });

  it('should answer "What does a CBC test measure?" accurately', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'What does a CBC test measure?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toMatch(/Complete Blood Count/i);
    expect(res.body.data.reply).toMatch(/Red Blood Cells/i);
    expect(res.body.data.reply).toMatch(/White Blood Cells/i);
    expect(res.body.data.reply).toMatch(/Platelets/i);
  });

  it('should answer "How should I organize my medical records?" accurately', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'How should I organize my medical records?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toMatch(/records/i);
    expect(res.body.data.reply).toMatch(/Emergency/i);
  });

  it('should reject empty or missing message with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: '   ',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/cannot be empty/i);
  });

  it('should detect emergency acute symptoms and advise immediate helpline 112/102', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'My father has severe chest pain and cannot breathe properly',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isEmergency).toBe(true);
    expect(res.body.data.reply).toMatch(/112/);
    expect(res.body.data.reply).toMatch(/102/);
    expect(res.body.data.reply).toMatch(/EMERGENCY/i);
  });

  it('should return list of suggested starter questions on GET /api/chat/suggestions', async () => {
    const res = await request(app).get('/api/chat/suggestions');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(4);

    const questions = res.body.data.map((q) => q.question);
    expect(questions).toContain('What is a blood pressure reading?');
    expect(questions).toContain('How can I maintain a healthy lifestyle?');
    expect(questions).toContain('What does a CBC test measure?');
    expect(questions).toContain('How should I organize my medical records?');
  });
});
