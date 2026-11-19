import React from 'react';
import {
  Clock,
  Flame,
  Phone,
  User,
  HeartPulse,
  Thermometer,
  CheckCircle2,
  Trash2,
  FileEdit,
  ArrowRightCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const PatientCard = ({
  patient,
  index = 0,
  patientsAhead = 0,
  viewMode = 'public', 
  onStatusChange,
  onDelete,
  onSelectForPrescription,
}) => {
  const {
    _id,
    tokenNumber,
    name,
    age,
    gender,
    phone,
    symptoms,
    temperature,
    priority,
    riskScore,
    status,
  } = patient;

  const estimatedWaitMinutes = patientsAhead * 10;

  const priorityStyles = {
    High: {
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      border: 'border-l-4 border-l-rose-500',
      pill: 'bg-rose-500',
      icon: AlertTriangle,
    },
    Medium: {
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      border: 'border-l-4 border-l-amber-500',
      pill: 'bg-amber-500',
      icon: Flame,
    },
    Normal: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      border: 'border-l-4 border-l-emerald-500',
      pill: 'bg-emerald-500',
      icon: Sparkles,
    },
  };

  const statusStyles = {
    Waiting: 'bg-slate-100 text-slate-700 border-slate-200',
    'In-Consultation': 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
    Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const priorityConfig = priorityStyles[priority] || priorityStyles.Normal;
  const PriorityIcon = priorityConfig.icon;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all ${priorityConfig.border}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-slate-900 text-white font-extrabold shadow-sm shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">TOKEN</span>
            <span className="text-base tracking-tight text-teal-400">{tokenNumber}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
                {name}
              </h4>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${priorityConfig.badge}`}
              >
                <PriorityIcon className="w-3 h-3" />
                {priority} Triage ({riskScore}% Risk)
              </span>

              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  statusStyles[status] || 'bg-slate-100'
                }`}
              >
                {status}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {age} yrs • {gender}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {phone}
              </span>
            </p>
          </div>
        </div>

        {status === 'Waiting' ? (
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200/80 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-teal-600" />
              Est. Waiting
            </span>
            <span className="text-sm font-extrabold text-teal-700">
              {estimatedWaitMinutes === 0 ? 'Next in Line' : `~${estimatedWaitMinutes} mins`}
            </span>
            <span className="text-[10px] text-slate-400">
              ({patientsAhead} {patientsAhead === 1 ? 'patient' : 'patients'} ahead)
            </span>
          </div>
        ) : status === 'In-Consultation' ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold shrink-0">
            <HeartPulse className="w-4 h-4 text-blue-600 animate-spin" />
            Inside Doctor Cabin
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Consultation Complete
          </div>
        )}
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600 flex-1">
          <span className="font-semibold text-slate-700 shrink-0">Chief Symptoms:</span>
          <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded truncate max-w-md">
            {symptoms}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-slate-700 font-semibold">
            <Thermometer
              className={`w-4 h-4 ${
                temperature >= 101 ? 'text-rose-500 animate-bounce' : 'text-amber-500'
              }`}
            />
            <span>{temperature}°F</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold">Risk:</span>
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full ${priorityConfig.pill}`}
                style={{ width: `${riskScore}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-700">{riskScore}%</span>
          </div>
        </div>
      </div>

      {viewMode === 'reception' && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {status === 'Waiting' && (
              <button
                onClick={() => onStatusChange(_id, 'In-Consultation')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <ArrowRightCircle className="w-3.5 h-3.5" />
                Call Patient (Cabin)
              </button>
            )}

            {status === 'In-Consultation' && (
              <button
                onClick={() => onStatusChange(_id, 'Completed')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark as Completed
              </button>
            )}

            {status === 'Completed' && (
              <button
                onClick={() => onStatusChange(_id, 'Waiting')}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Re-open to Queue
              </button>
            )}
          </div>

          <button
            onClick={() => onDelete(_id)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition border border-rose-200"
            title="Remove record"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}

      {viewMode === 'doctor' && status !== 'Completed' && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={() => onSelectForPrescription(patient)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <FileEdit className="w-4 h-4" />
            Write Digital Prescription
          </button>
        </div>
      )}
    </div>
  );
};

