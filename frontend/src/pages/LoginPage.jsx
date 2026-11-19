import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClinic } from '../context/ClinicContext';
import {
  Lock,
  ShieldCheck,
  Stethoscope,
  ClipboardList,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const LoginPage = () => {
  const { loginStaff, loading, t } = useClinic();
  const navigate = useNavigate();
  const location = useLocation();

  const [pin, setPin] = useState('');
  const [role, setRole] = useState('reception');
  const [pinError, setPinError] = useState('');

  const from = location.state?.from?.pathname || (role === 'doctor' ? '/doctor' : '/reception');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pin || pin.trim().length !== 4 || !/^\d{4}$/.test(pin)) {
      setPinError('Please enter a valid 4-digit numeric PIN.');
      return;
    }

    setPinError('');
    const res = await loginStaff(pin, role);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const handleQuickDemoFill = (selectedRole) => {
    setPin('1234');
    setRole(selectedRole);
    setPinError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.staffLoginTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access protected clinical terminals (Reception Desk & Doctor Cabin).
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-center">
            One-Click Viva Evaluation Auto-Fill
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('reception')}
              className={`p-3 rounded-2xl border text-left transition ${
                role === 'reception' && pin === '1234'
                  ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-teal-600 mb-1" />
              <p className="text-xs font-bold text-slate-900">Reception Desk</p>
              <p className="text-[10px] text-slate-500">PIN: 1234</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoFill('doctor')}
              className={`p-3 rounded-2xl border text-left transition ${
                role === 'doctor' && pin === '1234'
                  ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-blue-600 mb-1" />
              <p className="text-xs font-bold text-slate-900">Doctor Portal</p>
              <p className="text-[10px] text-slate-500">PIN: 1234</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.selectRole}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                  role === 'reception'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="reception"
                  checked={role === 'reception'}
                  onChange={() => setRole('reception')}
                  className="hidden"
                />
                Receptionist
              </label>

              <label
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                  role === 'doctor'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={role === 'doctor'}
                  onChange={() => setRole('doctor')}
                  className="hidden"
                />
                Doctor (MD)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t.enterPin} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                maxLength="4"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (pinError) setPinError('');
                }}
                placeholder="4-digit PIN (e.g. 1234)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
              />
            </div>
            {pinError && (
              <p className="text-rose-600 text-xs mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {pinError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition"
          >
            <span>{t.signIn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-400">
          Evaluator Hint: {t.demoPinHint}
        </div>
      </div>
    </div>
  );
};

