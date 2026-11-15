// [Requirement 1: Multiple React Components]
// [Requirement 2: Responsive Web Design]
// [Requirement 6: Props & State]
// [Requirement 7: Conditional Rendering]
// frontend/src/components/LiveQueueBoard.jsx

import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { PatientCard } from './PatientCard';
import {
  Users,
  Search,
  Filter,
  HeartPulse,
  Clock,
  Sparkles,
  Inbox,
  AlertCircle,
} from 'lucide-react';

export const LiveQueueBoard = ({
  viewMode = 'public',
  onStatusChange,
  onDelete,
  onSelectForPrescription,
}) => {
  const { patients, loading, t } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Currently In-Consultation Patient
  const activeConsultation = patients.find((p) => p.status === 'In-Consultation');

  // Waiting Patients sorted by Triage Priority (High > Medium > Normal)
  const waitingPatients = patients
    .filter((p) => p.status === 'Waiting')
    .filter((p) => {
      // Search filter (Safely handles masked public queue items without phone or symptoms)
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.tokenNumber && p.tokenNumber.toLowerCase().includes(term)) ||
        (p.phone && p.phone.includes(term)) ||
        (p.symptoms && p.symptoms.toLowerCase().includes(term));

      // Priority filter
      const matchesPriority = priorityFilter === 'ALL' || p.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });

  return (
    <div className="space-y-6">
      {/* Active Consultation Spotlight Banner */}
      {/* [Requirement 7: Conditional Rendering using logical &&] */}
      {activeConsultation && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/10">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/20">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white/20 rounded-xl">
                <HeartPulse className="w-5 h-5 animate-pulse text-rose-300" />
              </span>
              <div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-blue-200">
                  CURRENTLY IN CONSULTATION ROOM #1
                </span>
                <h3 className="text-xl font-black">
                  Token: {activeConsultation.tokenNumber} — {activeConsultation.name}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-bold">
                Doctor Cabin Active
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs text-blue-100">
            <span>
              Age/Gender: {activeConsultation.age} yrs • {activeConsultation.gender}
            </span>
            {activeConsultation.symptoms ? (
              <span>Symptoms: {activeConsultation.symptoms}</span>
            ) : (
              <span className="italic text-teal-200">Patient in Active Consultation</span>
            )}
            {activeConsultation.temperature && (
              <span className="font-bold bg-white text-blue-900 px-2 py-0.5 rounded">
                Temp: {activeConsultation.temperature}°F
              </span>
            )}
          </div>
        </div>
      )}

      {/* Queue Controls Bar: Search & Priority Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by token, name, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Filter Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-200"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High (Red Alert)</option>
            <option value="Medium">Medium (Urgent)</option>
            <option value="Normal">Normal (Routine)</option>
          </select>
        </div>
      </div>

      {/* Waiting Patient Cards Stack */}
      <div className="space-y-3">
        {/* [Requirement 7: Conditional Rendering - Empty State vs Patient Cards] */}
        {waitingPatients.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">{t.emptyQueue}</h4>
            <p className="text-xs text-slate-400 mt-1">
              New appointments booked from the portal will appear here prioritized automatically.
            </p>
          </div>
        ) : (
          waitingPatients.map((patient, idx) => (
            <PatientCard
              key={patient._id || patient.tokenNumber}
              patient={patient}
              index={idx}
              patientsAhead={idx}
              viewMode={viewMode}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onSelectForPrescription={onSelectForPrescription}
            />
          ))
        )}
      </div>
    </div>
  );
};

