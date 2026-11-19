import React, { useState, useMemo } from 'react';
import { useClinic } from '../context/ClinicContext';
import {
  Bell,
  Plus,
  Pill,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit2,
  Search,
  Filter,
  ShieldAlert,
  Sparkles,
  Volume2,
} from 'lucide-react';

const FREQUENCIES = [
  'Once Daily',
  'Twice Daily',
  'Thrice Daily',
  'Four Times Daily',
  'Every 8 Hours',
  'Every 12 Hours',
  'Weekly',
  'As Needed',
];

const COMMON_TIME_PRESETS = ['08:00', '13:00', '18:00', '21:00'];

export const MedicineReminderPage = () => {
  const {
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    logMedicationDose,
    notificationPermission,
    requestNotificationPermission,
  } = useClinic();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once Daily',
    times: ['08:00'],
    startDate: todayStr,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    instructions: 'Take with a glass of water after food.',
  });

  const [customTimeInput, setCustomTimeInput] = useState('12:00');

  const filteredMeds = useMemo(() => {
    return medications.filter((m) => {
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.instructions && m.instructions.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [medications, filterStatus, searchQuery]);

  const todayDoses = useMemo(() => {
    const list = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    medications.forEach((med) => {
      const start = new Date(med.startDate);
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const end = new Date(med.endDate);
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      if (today >= startDay && today <= endDay && med.status !== 'completed') {
        const times = Array.isArray(med.times) ? med.times : [];
        times.forEach((time) => {
          const log = (med.logs || []).find((l) => l.date === todayStr && l.time === time);
          list.push({
            medId: med._id,
            medName: med.name,
            dosage: med.dosage,
            instructions: med.instructions,
            time,
            status: log ? log.status : 'Upcoming',
            logTime: log ? log.recordedAt : null,
          });
        });
      }
    });

    return list.sort((a, b) => a.time.localeCompare(b.time));
  }, [medications, todayStr]);

  const stats = useMemo(() => {
    const activeCount = medications.filter((m) => m.status === 'active').length;
    const totalToday = todayDoses.length;
    const takenToday = todayDoses.filter((d) => d.status === 'Taken').length;
    const skippedToday = todayDoses.filter((d) => d.status === 'Skipped').length;
    const pendingToday = todayDoses.filter((d) => d.status === 'Upcoming').length;

    const complianceRate = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 100;

    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const nextUpcoming = todayDoses.find(
      (d) => d.status === 'Upcoming' && d.time >= currentTimeStr
    );

    return {
      activeCount,
      totalToday,
      takenToday,
      skippedToday,
      pendingToday,
      complianceRate,
      nextUpcomingTime: nextUpcoming ? nextUpcoming.time : 'None scheduled',
      nextUpcomingName: nextUpcoming ? `${nextUpcoming.medName} (${nextUpcoming.dosage})` : 'All caught up!',
    };
  }, [medications, todayDoses]);

  const recentLogs = useMemo(() => {
    const logs = [];
    medications.forEach((med) => {
      (med.logs || []).forEach((log) => {
        logs.push({
          medName: med.name,
          dosage: med.dosage,
          date: log.date,
          time: log.time,
          status: log.status,
          recordedAt: log.recordedAt,
        });
      });
    });

    return logs
      .sort((a, b) => new Date(b.recordedAt || b.date) - new Date(a.recordedAt || a.date))
      .slice(0, 10);
  }, [medications]);

  const openCreateModal = () => {
    setEditingMedId(null);
    setFormData({
      name: '',
      dosage: '',
      frequency: 'Once Daily',
      times: ['08:00'],
      startDate: todayStr,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      instructions: 'Take with a glass of water after food.',
    });
    setShowModal(true);
  };

  const openEditModal = (med) => {
    setEditingMedId(med._id);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      times: [...med.times],
      startDate: new Date(med.startDate).toISOString().split('T')[0],
      endDate: new Date(med.endDate).toISOString().split('T')[0],
      instructions: med.instructions || '',
    });
    setShowModal(true);
  };

  const handleAddTime = (timeToAdd) => {
    if (!timeToAdd) return;
    if (!formData.times.includes(timeToAdd)) {
      setFormData((prev) => ({
        ...prev,
        times: [...prev.times, timeToAdd].sort(),
      }));
    }
  };

  const handleRemoveTime = (timeToRemove) => {
    if (formData.times.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      times: prev.times.filter((t) => t !== timeToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingMedId) {
      const res = await updateMedication(editingMedId, formData);
      if (res.success) {
        setShowModal(false);
      }
    } else {
      const res = await addMedication(formData);
      if (res.success) {
        setShowModal(false);
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from your reminders?`)) {
      await deleteMedication(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Medicine Reminder & Medication Schedule
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage prescription schedules, dosage alarms, and track daily adherence
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-md shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add New Medicine
        </button>
      </div>

      {notificationPermission !== 'granted' && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-teal-950">
                Enable Browser Notifications for On-Time Dose Alerts
              </p>
              <p className="text-xs text-teal-800">
                Get real-time browser desktop alerts when it is time to take your scheduled dose.
              </p>
            </div>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition shrink-0 shadow-sm"
          >
            Enable Notifications
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Medicines</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Today's Doses</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.totalToday}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Doses Taken</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-700">{stats.takenToday}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Doses</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-700">{stats.pendingToday}</p>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Adherence Rate</p>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-700">
              {stats.complianceRate}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Today's Dose Schedule</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {todayStr}
          </span>
        </div>

        <div className="p-4 sm:p-6">
          {todayDoses.length === 0 ? (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <Pill className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">No doses scheduled for today.</p>
              <p className="text-xs text-slate-400">Click "Add New Medicine" above to create a schedule.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayDoses.map((dose, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
                    dose.status === 'Taken'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : dose.status === 'Skipped'
                      ? 'bg-slate-50 border-slate-300 opacity-75'
                      : 'bg-white border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-teal-100 text-teal-800">
                        <Clock className="w-3.5 h-3.5" />
                        {dose.time}
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          dose.status === 'Taken'
                            ? 'bg-emerald-100 text-emerald-800'
                            : dose.status === 'Skipped'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {dose.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{dose.medName}</h3>
                      <p className="text-xs text-slate-600 font-semibold">{dose.dosage}</p>
                    </div>

                    {dose.instructions && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-100/60 p-2 rounded-lg">
                        {dose.instructions}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        logMedicationDose(dose.medId, {
                          date: todayStr,
                          time: dose.time,
                          status: 'Taken',
                        })
                      }
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        dose.status === 'Taken'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Taken
                    </button>

                    <button
                      onClick={() =>
                        logMedicationDose(dose.medId, {
                          date: todayStr,
                          time: dose.time,
                          status: 'Skipped',
                        })
                      }
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        dose.status === 'Skipped'
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Skip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              All Prescribed Medications
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine or advice..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              {['all', 'active', 'completed', 'expired'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`capitalize px-2.5 py-1 rounded-md transition ${
                    filterStatus === st
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {filteredMeds.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No medications matching your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMeds.map((med) => (
                <div
                  key={med._id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{med.name}</h3>
                        <p className="text-xs font-semibold text-teal-700">{med.dosage}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          med.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : med.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {med.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>
                        <span className="font-semibold text-slate-700">Frequency:</span>{' '}
                        {med.frequency}
                      </p>
                      <p className="flex items-center gap-1 flex-wrap">
                        <span className="font-semibold text-slate-700">Times:</span>
                        {(med.times || []).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]"
                          >
                            {t}
                          </span>
                        ))}
                      </p>
                      <p className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(med.startDate).toLocaleDateString()} —{' '}
                        {new Date(med.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    {med.instructions && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic border border-slate-100">
                        {med.instructions}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Logged doses: {(med.logs || []).length}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(med)}
                        className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                        title="Edit Medicine"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(med._id, med.name)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {recentLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            Recent Medication Adherence History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Scheduled Date</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{log.medName}</td>
                    <td className="py-2.5 px-3">{log.dosage}</td>
                    <td className="py-2.5 px-3">{log.date}</td>
                    <td className="py-2.5 px-3 font-mono">{log.time}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          log.status === 'Taken'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log.status === 'Taken' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-800">Medical Safety Precaution:</strong> MediTrack
          Medicine Reminder is an assistive personal schedule tracker. Dosages and medication
          frequencies must be followed strictly according to instructions given by your registered
          treating physician. MediTrack does not recommend changing dosage patterns autonomously.
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editingMedId ? 'Edit Medication' : 'Add Medication Reminder'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Paracetamol, Metformin"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosage *</label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 500 mg, 1 tablet"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency *</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reminder Times (24-Hour HH:mm) *
                </label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {formData.times.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-xs"
                    >
                      {t}
                      {formData.times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTime(t)}
                          className="hover:text-rose-600 ml-1 text-slate-400 font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={customTimeInput}
                    onChange={(e) => setCustomTimeInput(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTime(customTimeInput)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-slate-700 transition"
                  >
                    + Add Time
                  </button>
                  <div className="hidden sm:flex items-center gap-1 ml-auto">
                    {COMMON_TIME_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleAddTime(p)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 hover:bg-teal-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Special Instructions</label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g. Take after meals with warm water, avoid cold dairy"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {editingMedId ? 'Update Schedule' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
