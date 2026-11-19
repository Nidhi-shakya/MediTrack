import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import {
  User,
  Phone,
  Calendar,
  Thermometer,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

export const BookingForm = ({ onSuccess }) => {
  const { bookPatient, loading, t } = useClinic();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    symptoms: '',
    temperature: '98.6',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const getLiveTriage = () => {
    const ageNum = Number(formData.age);
    const tempNum = Number(formData.temperature);
    const symptomsLower = (formData.symptoms || '').toLowerCase();

    const isCriticalSymptom =
      symptomsLower.includes('chest pain') ||
      symptomsLower.includes('breathing difficulty') ||
      symptomsLower.includes('shortness of breath');

    if (ageNum >= 65 || tempNum >= 102 || isCriticalSymptom) {
      return {
        priority: 'High',
        riskScore: 85,
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        badge: 'High Priority (Red Alert)',
      };
    }
    if (ageNum >= 50 || tempNum >= 100) {
      return {
        priority: 'Medium',
        riskScore: 50,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        badge: 'Medium Priority (Urgent)',
      };
    }
    return {
      priority: 'Normal',
      riskScore: 15,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badge: 'Normal Priority (Routine)',
    };
  };

  const liveTriage = getLiveTriage();

  const validateField = (fieldName, value) => {
    let errorMsg = '';

    switch (fieldName) {
      case 'name':
        if (!value || value.trim().length < 3) {
          errorMsg = 'Name must be at least 3 characters long.';
        }
        break;

      case 'age':
        const numAge = Number(value);
        if (!value || isNaN(numAge) || numAge < 1 || numAge > 120) {
          errorMsg = 'Age must be a valid number between 1 and 120.';
        }
        break;

      case 'phone':
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!value || !phoneRegex.test(String(value).trim())) {
          errorMsg = 'Enter a valid 10-digit Indian phone number starting with 6-9.';
        }
        break;

      case 'temperature':
        const numTemp = Number(value);
        if (!value || isNaN(numTemp) || numTemp < 95 || numTemp > 108) {
          errorMsg = 'Body temperature must be between 95°F and 108°F.';
        }
        break;

      case 'symptoms':
        if (!value || value.trim().length < 4) {
          errorMsg = 'Please describe symptoms (at least 4 characters).';
        }
        break;

      default:
        break;
    }

    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const validateForm = () => {
    const validationErrors = {
      name: validateField('name', formData.name),
      age: validateField('age', formData.age),
      phone: validateField('phone', formData.phone),
      temperature: validateField('temperature', formData.temperature),
      symptoms: validateField('symptoms', formData.symptoms),
    };

    setErrors(validationErrors);
    setTouched({
      name: true,
      age: true,
      phone: true,
      temperature: true,
      symptoms: true,
    });

    return !Object.values(validationErrors).some((msg) => msg !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      phone: formData.phone.trim(),
      temperature: Number(formData.temperature),
      symptoms: formData.symptoms.trim(),
    };

    const response = await bookPatient(payload);
    if (response.success) {
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        symptoms: '',
        temperature: '98.6',
      });
      setTouched({});
      setErrors({});

      if (onSuccess) {
        onSuccess(response.data);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8"
      noValidate
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
          <Sparkles className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t.bookAppointment}</h2>
          <p className="text-xs text-slate-500">{t.triageExplanation}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t.fullName} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Ramesh Sharma"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                touched.name && errors.name
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-teal-200 focus:border-teal-500'
              }`}
            />
          </div>
          {touched.name && errors.name && (
            <p className="text-rose-600 text-xs mt-1 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.age} (Years) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="1 - 120"
                min="1"
                max="120"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                  touched.age && errors.age
                    ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-teal-200 focus:border-teal-500'
                }`}
              />
            </div>
            {touched.age && errors.age && (
              <p className="text-rose-600 text-xs mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.age}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.gender}
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.phone} (India) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                name="phone"
                maxLength="10"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="10 Digits (e.g. 9876543210)"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                  touched.phone && errors.phone
                    ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-teal-200 focus:border-teal-500'
                }`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="text-rose-600 text-xs mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.temperature} (°Fahrenheit) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Thermometer className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="0.1"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="98.6"
                min="95"
                max="108"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                  touched.temperature && errors.temperature
                    ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-teal-200 focus:border-teal-500'
                }`}
              />
            </div>
            {touched.temperature && errors.temperature && (
              <p className="text-rose-600 text-xs mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.temperature}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t.symptoms} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              name="symptoms"
              rows="3"
              value={formData.symptoms}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Chest pain, difficulty breathing, or high fever..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                touched.symptoms && errors.symptoms
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-teal-200 focus:border-teal-500'
              }`}
            />
          </div>
          {touched.symptoms && errors.symptoms && (
            <p className="text-rose-600 text-xs mt-1 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.symptoms}
            </p>
          )}
        </div>

        <div className={`p-3.5 rounded-2xl border ${liveTriage.color} transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Automated Triage Prediction:
            </span>
            <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white shadow-sm border border-inherit">
              {liveTriage.badge}
            </span>
          </div>
          <p className="text-[11px] mt-1 opacity-90">
            Calculated Risk Score: <span className="font-bold">{liveTriage.riskScore}%</span>.
            {liveTriage.priority === 'High' && ' Emergency triage triggers immediate queue leap to #1!'}
            {liveTriage.priority === 'Medium' && ' Moderate triage prioritized ahead of routine checkups.'}
            {liveTriage.priority === 'Normal' && ' Routine outpatient consultation queued sequentially.'}
          </p>
        </div>

        {liveTriage.priority === 'High' && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900">{t.emergencyWarningTitle}</p>
              <p className="text-[11px] text-rose-700 mt-0.5">{t.emergencyNotice}</p>
            </div>
          </div>
        )}

        <p className="text-[10px] text-slate-400 italic text-center px-1">
          {t.triageExplanation}
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Token & Running Triage...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              {t.generateToken}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

