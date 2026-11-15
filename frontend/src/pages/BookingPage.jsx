// [Requirement 1: Multiple React Components]
// [Requirement 2: Responsive Web Design - sm:, md:, lg:]
// [Requirement 6: Props and State]
// [Requirement 7: Conditional Rendering]
// frontend/src/pages/BookingPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../context/ClinicContext';
import { StatCard } from '../components/StatCard';
import { BookingForm } from '../components/BookingForm';
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Ticket,
  Printer,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const BookingPage = () => {
  const { stats, t } = useClinic();
  const [issuedToken, setIssuedToken] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-teal-100 text-teal-800 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Assisted Smart Triage
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Outpatient Token & Appointment Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Register your appointment details. Our triage algorithm will assess vital signs to instantly allocate your queue position.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex gap-2 justify-center">
          <Link
            to="/queue"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm"
          >
            <Users className="w-4 h-4 text-teal-400" />
            View Live Queue Board
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid [Requirement 6: Props & State] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.totalWaiting}
          value={stats.totalWaiting}
          icon={Users}
          color="teal"
          subtitle="Currently in line"
        />
        <StatCard
          title={t.avgWait}
          value={`~${stats.estimatedWaitTimeMinutes} ${t.mins}`}
          icon={Clock}
          color="blue"
          subtitle="Calculated at 10m/patient"
        />
        <StatCard
          title={t.highPriority}
          value={stats.highPriorityCount}
          icon={AlertTriangle}
          color="rose"
          badge="Priority #1"
          subtitle="Immediate physician review"
        />
        <StatCard
          title={t.completedToday}
          value={stats.completedToday}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Consultations completed"
        />
      </div>

      {/* Main Grid: Booking Form & Success Token Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <BookingForm onSuccess={(patient) => setIssuedToken(patient)} />
        </div>

        {/* Right Column: Issued Token Ticket / Information Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* [Requirement 7: Conditional Rendering - Token Receipt Card] */}
          {issuedToken ? (
            <div className="bg-gradient-to-b from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden border border-teal-500/30">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Ticket className="w-48 h-48" />
              </div>

              <div className="flex items-center justify-between border-b border-teal-700/50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-500/20 rounded-xl text-teal-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-teal-300 font-bold uppercase tracking-widest">
                      TOKEN ISSUED SUCCESSFULLY
                    </span>
                    <h3 className="text-lg font-bold text-white">MediTrack Outpatient Slip</h3>
                  </div>
                </div>
              </div>

              <div className="my-6 text-center bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <p className="text-xs text-teal-300 uppercase font-bold tracking-widest">
                  YOUR QUEUE NUMBER
                </p>
                <div className="text-5xl font-black text-teal-300 my-2 tracking-tight">
                  {issuedToken.tokenNumber}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 mt-1">
                  <span>Triage: {issuedToken.priority} Priority</span>
                  <span>•</span>
                  <span>Risk: {issuedToken.riskScore}%</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-teal-700/50 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient Name:</span>
                  <span className="font-bold text-white">{issuedToken.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Age / Gender:</span>
                  <span className="font-bold text-white">
                    {issuedToken.age} yrs / {issuedToken.gender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recorded Temp:</span>
                  <span className="font-bold text-white">{issuedToken.temperature}°F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registered Phone:</span>
                  <span className="font-mono text-white">{issuedToken.phone}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-teal-700/50 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Token Slip
                </button>
                <Link
                  to="/queue"
                  className="flex-1 py-2.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  Track in Queue
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                How Smart Triage Works
              </h3>

              <div className="mt-4 space-y-3.5 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-rose-900 font-bold block">
                      High Priority (85% Risk Score)
                    </strong>
                    Triggered if Age ≥ 65, Temperature ≥ 102°F, or symptoms like Chest Pain or Breathing Difficulty. Automatically placed at the top of the waiting queue.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-amber-900 font-bold block">
                      Medium Priority (50% Risk Score)
                    </strong>
                    Triggered if Age ≥ 50 or Temperature ≥ 100°F. Positioned ahead of routine consults.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <strong className="text-emerald-900 font-bold block">
                      Normal Priority (15% Risk Score)
                    </strong>
                    Standard routine consultations served sequentially with live waiting time estimates.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

