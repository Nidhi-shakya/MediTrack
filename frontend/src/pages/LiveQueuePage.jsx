import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../context/ClinicContext';
import { StatCard } from '../components/StatCard';
import { LiveQueueBoard } from '../components/LiveQueueBoard';
import {
  Users,
  Clock,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Radio,
} from 'lucide-react';

export const LiveQueuePage = () => {
  const { stats, fetchPatients, loading, t } = useClinic();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {t.badgeLive}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.navQueue}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time outpatient queue sorted automatically by medical triage urgency and wait time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPatients()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            Refresh Queue
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Book New Token
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={t.totalWaiting}
          value={stats.totalWaiting}
          icon={Users}
          color="teal"
          subtitle="Awaiting doctor consultation"
        />
        <StatCard
          title={t.avgWait}
          value={`~${stats.estimatedWaitTimeMinutes} ${t.mins}`}
          icon={Clock}
          color="blue"
          subtitle="Patients Ahead × 10 mins rule"
        />
        <StatCard
          title={t.highPriority}
          value={stats.highPriorityCount}
          icon={AlertTriangle}
          color="rose"
          badge="High Urgency"
          subtitle="Red triage status"
        />
      </div>

      <LiveQueueBoard viewMode="public" />
    </div>
  );
};

