import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { StatCard } from '../components/StatCard';
import { PatientCard } from '../components/PatientCard';
import {
  ClipboardList,
  Megaphone,
  Users,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export const ReceptionDashboard = () => {
  const {
    patients,
    updatePatientStatus,
    deletePatient,
    callNextPatient,
    fetchPatients,
    stats,
    loading,
    t,
  } = useClinic();

  const [activeTab, setActiveTab] = useState('ALL'); 
  const [searchQuery, setSearchQuery] = useState('');

  const handleCallNextPatient = async () => {
    await callNextPatient();
  };

  const filteredPatients = patients.filter((p) => {
    const matchesTab = activeTab === 'ALL' || p.status === activeTab;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-full">
            CLINICAL RECEPTION DESK
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Receptionist Queue Console
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage outpatient flow, summon next priority token, and oversee room triage statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchPatients()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            Sync
          </button>

          <button
            onClick={handleCallNextPatient}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-blue-500/20"
          >
            <Megaphone className="w-4 h-4 animate-bounce" />
            Call Next Priority Token
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="In Waiting Line"
          value={stats.totalWaiting}
          icon={Users}
          color="teal"
          subtitle="Waiting in OPD area"
        />
        <StatCard
          title="In Doctor Cabin"
          value={stats.inConsultationCount}
          icon={ClipboardList}
          color="blue"
          badge="Active"
          subtitle="Consultation in progress"
        />
        <StatCard
          title="Critical / High Urgency"
          value={stats.highPriorityCount}
          icon={AlertCircle}
          color="rose"
          subtitle="Priority triage patients"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Discharged / Prescribed"
        />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs font-bold">
          {['ALL', 'Waiting', 'In-Consultation', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'ALL' ? 'All Records' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, token, phone..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No patient records match the selected status filter.
          </div>
        ) : (
          filteredPatients.map((patient, idx) => (
            <PatientCard
              key={patient._id || patient.tokenNumber}
              patient={patient}
              index={idx}
              patientsAhead={idx}
              viewMode="reception"
              onStatusChange={updatePatientStatus}
              onDelete={deletePatient}
            />
          ))
        )}
      </div>
    </div>
  );
};

