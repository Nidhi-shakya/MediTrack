const { evaluateTriage, TRIAGE_DISCLAIMER, EMERGENCY_NOTICE } = require('../services/triageEngine');

describe('Triage Engine Service (evaluateTriage)', () => {
  it('should assign High Priority for geriatric patient (age >= 65)', () => {
    const result = evaluateTriage({
      age: 70,
      temperature: 98.6,
      symptoms: 'Mild knee joint pain',
    });

    expect(result.priority).toBe('High');
    expect(result.riskScore).toBe(85);
    expect(result.disclaimer).toBe(TRIAGE_DISCLAIMER);
  });

  it('should assign High Priority for high fever (temp >= 102.0°F)', () => {
    const result = evaluateTriage({
      age: 25,
      temperature: 103.2,
      symptoms: 'Body shivering and severe fever',
    });

    expect(result.priority).toBe('High');
    expect(result.riskScore).toBe(85);
  });

  it('should assign High Priority and attach Emergency Notice for red-flag symptoms', () => {
    const result = evaluateTriage({
      age: 40,
      temperature: 98.4,
      symptoms: 'Sudden chest pain radiating to left shoulder and breathing difficulty',
    });

    expect(result.priority).toBe('High');
    expect(result.riskScore).toBe(85);
    expect(result.isEmergency).toBe(true);
    expect(result.emergencyNotice).toBe(EMERGENCY_NOTICE);
  });

  it('should assign Medium Priority for senior adult (age 50 - 64)', () => {
    const result = evaluateTriage({
      age: 55,
      temperature: 98.6,
      symptoms: 'Mild persistent cough',
    });

    expect(result.priority).toBe('Medium');
    expect(result.riskScore).toBe(50);
  });

  it('should assign Medium Priority for moderate pyrexia (temp 100.0 - 101.9°F)', () => {
    const result = evaluateTriage({
      age: 28,
      temperature: 100.5,
      symptoms: 'Headache and feverish feeling',
    });

    expect(result.priority).toBe('Medium');
    expect(result.riskScore).toBe(50);
  });

  it('should assign Normal Priority for routine outpatient consult', () => {
    const result = evaluateTriage({
      age: 24,
      temperature: 98.4,
      symptoms: 'Follow-up for seasonal allergies',
    });

    expect(result.priority).toBe('Normal');
    expect(result.riskScore).toBe(15);
    expect(result.isEmergency).toBe(false);
  });

  it('should always include the educational decision-support disclaimer', () => {
    const result = evaluateTriage({ age: 30, temperature: 98.6, symptoms: 'Checkup' });
    expect(result.disclaimer).toContain('algorithmic queue decision-support tool');
    expect(result.disclaimer).toContain('does not constitute a medical diagnosis');
  });
});

